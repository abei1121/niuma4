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
