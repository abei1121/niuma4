import { TrackItem, KeepSegmentItem } from './types';
import { createVideoTask, getVideoTasks } from '../../api/video';

export function createTrackItemsFromSegments(segments: KeepSegmentItem[]): TrackItem[] {
  let cursor = 0;
  return segments.map((seg) => {
    const srcName = seg.source_file ? seg.source_file.split('/').pop() : `素材${seg.file_index || 1}`;
    const item: TrackItem = {
      id: `cut-seg-${seg.index}`,
      trackType: 'video',
      name: `[${srcName}] #${seg.index} (${seg.duration}s)`,
      startSec: Math.round(cursor * 10) / 10,
      endSec: Math.round((cursor + seg.duration) * 10) / 10,
      color: 'bg-emerald-600 border-emerald-400',
      detail: `来源: ${srcName} (${seg.start}s ~ ${seg.end}s, 净长 ${seg.duration}s)`,
    };
    cursor += seg.duration;
    return item;
  });
}

export async function executeRenderTask(params: {
  targetFile: string;
  setIsRendering: (r: boolean) => void;
  setRenderProgress: (p: any) => void;
  setOutputFile: (f: string) => void;
}) {
  const { targetFile, setIsRendering, setRenderProgress, setOutputFile } = params;
  if (!targetFile) {
    alert('请先在 L0 导入原片素材');
    return;
  }
  setIsRendering(true);
  setRenderProgress(10);
  const taskName = targetFile.split('/').pop()?.replace(/\.[^/.]+$/, '') || '自动剪辑任务';

  try {
    const res = await createVideoTask(taskName, 'auto_100pct', targetFile);
    if (!res.success) {
      setIsRendering(false);
      alert(`启动失败: ${res.error || '创建任务异常'}`);
      return;
    }

    const taskId = res.task_id;
    setRenderProgress(20);

    const pollTimer = setInterval(async () => {
      try {
        const allTasks = await getVideoTasks();
        const cur = allTasks.find((t) => t.id === taskId);
        if (cur) {
          if (cur.status === 'completed') {
            clearInterval(pollTimer);
            setIsRendering(false);
            setRenderProgress(100);
            setOutputFile(cur.output_file || '');
            alert(`100% 全自动双轨出片完成！\n\n成品视频:\n${cur.output_file}\n\n剪映草稿已同步就绪，可以直接在剪映打开。`);
          } else if (cur.status === 'failed') {
            clearInterval(pollTimer);
            setIsRendering(false);
            alert(`剪辑任务执行失败: ${cur.error || '未知异常'}`);
          } else {
            setRenderProgress((p: number) => (p < 90 ? p + 10 : 90));
          }
        }
      } catch (e) {
        console.error('Polling error:', e);
      }
    }, 1500);
  } catch (err: any) {
    setIsRendering(false);
    alert(`触发剪辑任务异常: ${err.message || err}`);
  }
}

export async function executeDirectorDraft(params: {
  sectorId: string;
  platformId: string;
  topic: string;
  directorPrompt: string;
  cleanFile: string;
  selectedFile: string;
  setHookTitle: (t: string) => void;
  setDraftSummary: (s: string) => void;
  setTrackItems: (items: TrackItem[]) => void;
  setDraftReady: (r: boolean) => void;
  setIsL2ToL3Connected?: (c: boolean) => void;
  setL2ActiveFocus?: (f: boolean) => void;
  setL3ActiveFocus?: (f: boolean) => void;
  handleProceedToL3?: (tracks: TrackItem[]) => void;
}) {
  const {
    sectorId, platformId, topic, directorPrompt, cleanFile, selectedFile,
    setHookTitle, setDraftSummary, setTrackItems, setDraftReady,
    setIsL2ToL3Connected, setL2ActiveFocus, setL3ActiveFocus, handleProceedToL3,
  } = params;

  try {
    const res = await fetch('/api/video/director-draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        director_id: sectorId,
        platform_id: platformId,
        topic: topic || directorPrompt,
        custom_prompt: directorPrompt,
        clean_file: cleanFile || selectedFile || '',
      }),
    });
    const data = await res.json();
    const rawTracks = data.tracks || data.track_items || [];
    if (data.success && rawTracks.length > 0) {
      const normalizedTracks = rawTracks.map((t: any, idx: number) => ({
        id: t.id ? String(t.id) : `track-${idx}`,
        trackType: t.trackType || t.track_type || 'video',
        name: t.name || `片段 #${idx + 1}`,
        startSec: typeof t.startSec === 'number' ? t.startSec : (t.start_sec || 0),
        endSec: typeof t.endSec === 'number' ? t.endSec : (t.end_sec || 5.0),
        color: t.color || 'bg-blue-600 border-blue-400',
        detail: t.detail || '',
      }));
      setHookTitle(data.hook_title || '');
      setDraftSummary(data.summary || '');
      setTrackItems(normalizedTracks);
      setDraftReady(true);
      if (setIsL2ToL3Connected) setIsL2ToL3Connected(true);
      if (setL2ActiveFocus) setL2ActiveFocus(false);
      if (setL3ActiveFocus) setL3ActiveFocus(true);
      if (handleProceedToL3) handleProceedToL3(normalizedTracks);
    } else {
      alert(`生成草稿失败: ${data.error || '未知异常'}`);
    }
  } catch (e) {
    alert(`生成草稿异常: ${e}`);
  }
}

export async function executeJianyingExport(params: {
  cleanFile: string;
  selectedFile: string;
  files: string[];
  projectName?: string;
  sectorId: string;
  hookTitle?: string;
  topic?: string;
  directorRole?: string;
  platformId?: string;
  setIsExportingJianying: (e: boolean) => void;
}) {
  const { cleanFile, selectedFile, files, projectName, sectorId, hookTitle, topic, directorRole, platformId, setIsExportingJianying } = params;
  const targetFile = cleanFile || selectedFile || (files && files[0]) || '';
  if (!targetFile) {
    alert('未检测到有效视频底片，请先在 L0/L1 载入素材');
    return;
  }
  setIsExportingJianying(true);
  try {
    const res = await fetch('/api/video/export-jianying', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clean_file: targetFile,
        project_name: projectName || '自媒体剪辑工程',
        sector_id: sectorId,
        hook_title: hookTitle || '',
        topic: topic || '',
        director_role: directorRole || '',
        platform_id: platformId || '',
      }),
    });
    const data = await res.json();
    alert(data.message || '剪映/CapCut 动态草稿工程已生成并就绪！');
  } catch (e) {
    alert(`导出异常: ${e}`);
  } finally {
    setIsExportingJianying(false);
  }
}

