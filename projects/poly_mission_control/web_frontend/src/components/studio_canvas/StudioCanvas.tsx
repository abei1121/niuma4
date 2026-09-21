import { FunctionalComponent } from 'preact';
import { useState, useCallback, useMemo } from 'preact/hooks';
import { memo } from 'preact/compat';
import { ReactFlow, Controls, Background, MiniMap } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { MediaPickerModal } from './MediaPickerModal';
import { L3TimelineDrawer } from './L3TimelineDrawer';
import { StudioMasterViewer } from './StudioMasterViewer';
import { ProjectHeader } from './ProjectHeader';
import { AspectRatio, TrackItem, KeepSegmentItem, CutSegmentItem } from './types';
import { executeRoughWash } from '../../api/video';
import { STATIC_EDGES, DEFAULT_TRACK_ITEMS, STATIC_NODE_TYPES } from './constants';
import { buildWorkflowEdges } from './workflowEdges';
import { useStudioNodes } from './useStudioNodes';
import { useProjectManager } from './useProjectManager';

const StudioCanvasComponent: FunctionalComponent = () => {
  const [projectName, setProjectName] = useState('爆款剪辑项目_' + new Date().toISOString().slice(0, 10).replace(/-/g, ''));
  const [ratio, setRatio] = useState<AspectRatio>('9:16');
  const [files, setFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [cleanFile, setCleanFile] = useState<string>('');
  const [washStatus, setWashStatus] = useState<'idle' | 'washing' | 'completed'>('idle');
  const [washStats, setWashStats] = useState<any>(null);
  const [keepSegments, setKeepSegments] = useState<KeepSegmentItem[]>([]);
  const [cutSegments, setCutSegments] = useState<CutSegmentItem[]>([]);
  const [silenceDb, setSilenceDb] = useState(-28);
  const [minSilenceDurationSec, setMinSilenceDurationSec] = useState(0.6);
  const [directorId, setDirectorId] = useState('dir_ziwei');
  const [platformId, setPlatformId] = useState('douyin');
  const [draftReady, setDraftReady] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [isRendering, setIsRendering] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [previewModal, setPreviewModal] = useState<{ isOpen: boolean; url: string; title: string }>({ isOpen: false, url: '', title: '' });
  const [trackItems, setTrackItems] = useState<TrackItem[]>(DEFAULT_TRACK_ITEMS);
  const [isL1ToL2Connected, setIsL1ToL2Connected] = useState(false);
  const [isL2ToL3Connected, setIsL2ToL3Connected] = useState(false);
  const [isL3ToL4Connected, setIsL3ToL4Connected] = useState(false);
  const [l2ActiveFocus, setL2ActiveFocus] = useState(false);
  const [l3ActiveFocus, setL3ActiveFocus] = useState(false);
  const [l4ActiveFocus, setL4ActiveFocus] = useState(false);
  const [rfInstance, setRfInstance] = useState<any>(null);

  const edges = useMemo(() => {
    return buildWorkflowEdges({
      hasFiles: files.length > 0,
      filesCount: files.length,
      isL1ToL2Connected: isL1ToL2Connected || keepSegments.length > 0,
      keepCount: keepSegments.length,
      cleanDurationSec: washStats?.clean_duration_sec || 0,
      isL2ToL3Connected: isL2ToL3Connected || (draftReady && trackItems.length > 0),
      trackCount: trackItems.length,
      isL3ToL4Connected,
    });
  }, [files.length, isL1ToL2Connected, keepSegments.length, washStats, isL2ToL3Connected, draftReady, trackItems.length, isL3ToL4Connected]);

  const handleOpenPreview = useCallback((url: string, title: string) => {
    setPreviewModal({ isOpen: true, url, title });
  }, []);

  const handleNewProject = useCallback(() => {
    setProjectName('新建剪辑工程_' + Date.now().toString().slice(-4));
    setFiles([]);
    setSelectedFile('');
    setCleanFile('');
    setWashStatus('idle');
    setIsL1ToL2Connected(false);
    setIsL2ToL3Connected(false);
    setIsL3ToL4Connected(false);
    setL2ActiveFocus(false);
    setL3ActiveFocus(false);
    setL4ActiveFocus(false);
    setDraftReady(false);
    setRenderProgress(0);
    setIsRendering(false);
    setTrackItems([]);
  }, []);

  const { getCurrentProjectData, handleLoadProjectData, handleRotateFile } = useProjectManager({
    projectName, setProjectName, ratio, setRatio, files, setFiles, selectedFile, setSelectedFile,
    cleanFile, setCleanFile, setWashStatus, keepSegments, setKeepSegments, cutSegments, setCutSegments,
    washStats, setWashStats, silenceDb, setSilenceDb, minSilenceDurationSec, setMinSilenceDurationSec,
    directorId, setDirectorId, platformId, setPlatformId, trackItems, setTrackItems,
  });

  const handleStartWash = useCallback(async () => {
    if (!files.length) {
      alert('请先在 L0 素材池中添加待粗洗的原片素材');
      return;
    }
    setWashStatus('washing');
    try {
      const res = await executeRoughWash(files, silenceDb, minSilenceDurationSec, ratio);
      if (res.success && res.clean_file) {
        setCleanFile(res.clean_file);
        if (res.stats) setWashStats(res.stats);
        if (res.keep_segments) setKeepSegments(res.keep_segments);
        if (res.cut_segments) setCutSegments(res.cut_segments);
        setWashStatus('completed');
      } else {
        setWashStatus('idle');
        alert(`粗洗失败: ${res.error || '转码异常'}`);
      }
    } catch (e) {
      setWashStatus('idle');
      alert(`粗洗执行异常: ${e}`);
    }
  }, [files, silenceDb, minSilenceDurationSec, ratio]);

  const handleApplyCutToL3 = useCallback((segments: KeepSegmentItem[]) => {
    if (!segments || !segments.length) return;
    let cursor = 0;
    const newTracks: TrackItem[] = segments.map((seg) => {
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
    setTrackItems(newTracks);
    alert(`已将 ${segments.length} 个粗剪切片成功灌入 L3 精修时间线轨道！`);
  }, []);

  const handleProceedToL2 = useCallback((segments: KeepSegmentItem[]) => {
    if (!segments || !segments.length) {
      alert('当前暂无粗剪切片，请先在 L1 执行粗剪！');
      return;
    }
    setIsL1ToL2Connected(true);
    setL2ActiveFocus(true);
    setL3ActiveFocus(false);
    setL4ActiveFocus(false);
    rfInstance?.setCenter(860 + 175, 150 + 200, { zoom: 0.95, duration: 650 });
  }, [rfInstance]);

  const handleProceedToL3 = useCallback((tracks: TrackItem[]) => {
    if (!tracks || !tracks.length) {
      alert('当前暂无分镜轨道，请先在 L2 驱动大模型生成爆款草稿！');
      return;
    }
    setIsL2ToL3Connected(true);
    setTrackItems(tracks);
    setL2ActiveFocus(false);
    setL3ActiveFocus(true);
    setL4ActiveFocus(false);
    rfInstance?.setCenter(1250 + 160, 150 + 200, { zoom: 0.95, duration: 650 });
  }, [rfInstance]);

  const handleProceedToL4 = useCallback(() => {
    setIsL3ToL4Connected(true);
    setL2ActiveFocus(false);
    setL3ActiveFocus(false);
    setL4ActiveFocus(true);
    rfInstance?.setCenter(1640 + 145, 150 + 200, { zoom: 0.95, duration: 650 });
  }, [rfInstance]);

  const { nodes, onNodesChange } = useStudioNodes({
    ratio, files, selectedFile, cleanFile, washStatus, washStats, keepSegments, cutSegments, silenceDb, minSilenceDurationSec,
    directorId, platformId, draftReady, renderProgress, isRendering, trackItems,
    setRatio, setFiles, setSelectedFile, setSilenceDb, setMinSilenceDurationSec,
    setDirectorId, setPlatformId, setDraftReady, setIsRendering, setRenderProgress,
    setMediaPickerOpen, setDrawerOpen, setTrackItems, handleRotateFile, handleStartWash,
    handleApplyCutToL3,
    handleProceedToL2,
    handleProceedToL3,
    handleProceedToL4,
    l2ActiveFocus,
    l3ActiveFocus,
    l4ActiveFocus,
    onOpenPreview: handleOpenPreview,
  });

  return (
    <div className="space-y-3">
      <ProjectHeader
        projectName={projectName}
        onUpdateProjectName={setProjectName}
        onNewProject={handleNewProject}
        getCurrentProjectData={getCurrentProjectData}
        onLoadProjectData={handleLoadProjectData}
      />
      <div className="w-full h-[740px] bg-[#070b12] rounded-2xl border border-gray-800 relative overflow-hidden shadow-2xl">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onInit={setRfInstance}
          nodesDraggable={true}
          nodeTypes={STATIC_NODE_TYPES}
          defaultViewport={{ x: 30, y: 30, zoom: 0.8 }}
          minZoom={0.2}
          maxZoom={1.5}
          className="bg-[#080d1a]"
        >
          <Background color="#1e293b" gap={20} size={1} />
          <Controls className="!bg-gray-900 !border-gray-800 !text-gray-200 !fill-gray-200" />
          <MiniMap nodeColor="#3b82f6" maskColor="rgba(0, 0, 0, 0.7)" className="!bg-gray-950 !border-gray-800 rounded-lg" />
        </ReactFlow>
      </div>
      <MediaPickerModal
        isOpen={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onAddFiles={(newFiles) => {
          setFiles((prev) => [...prev, ...newFiles]);
          if (!selectedFile && newFiles.length > 0) setSelectedFile(newFiles[0]);
        }}
      />
      <L3TimelineDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        items={trackItems}
        ratio={ratio}
        onUpdateItems={setTrackItems}
        onSavePreference={() => alert('精修偏好已沉淀至 master_profile.json！')}
      />
      <StudioMasterViewer
        isOpen={previewModal.isOpen}
        onClose={() => setPreviewModal((prev) => ({ ...prev, isOpen: false }))}
        videoUrl={previewModal.url}
        title={previewModal.title}
        ratio={ratio}
      />
    </div>
  );
};

export const StudioCanvas = memo(StudioCanvasComponent);
