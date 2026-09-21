import { useState, useCallback, useEffect } from 'preact/hooks';
import { useNodesState } from '@xyflow/react';
import { AspectRatio, TrackItem, KeepSegmentItem, CutSegmentItem, NodeL0Data, NodeL1Data, NodeL2Data, NodeL3Data, NodeL4Data } from './types';

export interface UseStudioNodesProps {
  ratio: AspectRatio;
  files: string[];
  selectedFile: string;
  cleanFile: string;
  washStatus: 'idle' | 'washing' | 'completed';
  washStats: any;
  keepSegments: KeepSegmentItem[];
  cutSegments: CutSegmentItem[];
  silenceDb: number;
  minSilenceDurationSec: number;
  directorId: string;
  platformId: string;
  draftReady: boolean;
  renderProgress: number;
  isRendering: boolean;
  trackItems: TrackItem[];
  setRatio: (ratio: AspectRatio) => void;
  setFiles: (updater: (prev: string[]) => string[]) => void;
  setSelectedFile: (file: string) => void;
  setSilenceDb: (db: number) => void;
  setMinSilenceDurationSec: (sec: number) => void;
  setDirectorId: (id: string) => void;
  setPlatformId: (id: string) => void;
  setDraftReady: (ready: boolean) => void;
  setIsRendering: (rendering: boolean) => void;
  setRenderProgress: (progress: any) => void;
  setMediaPickerOpen: (open: boolean) => void;
  setDrawerOpen: (open: boolean) => void;
  setTrackItems: (items: TrackItem[]) => void;
  handleRotateFile: (filePath: any, degrees?: number) => void;
  handleStartWash: () => void;
  handleApplyCutToL3: (segments: KeepSegmentItem[]) => void;
  handleProceedToL2: (segments: KeepSegmentItem[]) => void;
  handleProceedToL3: (tracks: TrackItem[]) => void;
  handleProceedToL4: () => void;
  l2ActiveFocus: boolean;
  l3ActiveFocus: boolean;
  l4ActiveFocus: boolean;
  onOpenPreview: (url: string, title: string) => void;
}

export function useStudioNodes(props: UseStudioNodesProps) {
  const [sectorId, setSectorId] = useState('xuanxue');
  const [subOptionId, setSubOptionId] = useState('xx_mingpan');
  const [directorPrompt, setDirectorPrompt] = useState('爆款自媒体玄学名人命盘视频导演');
  const [topic, setTopic] = useState('');

  const nodeL0Data: NodeL0Data = {
    ratio: props.ratio,
    files: props.files,
    selectedFile: props.selectedFile,
    onAddFiles: () => props.setMediaPickerOpen(true),
    onRotateFile: (target: any, deg?: number) => {
      const path = typeof target === 'number' ? props.files[target] : target;
      if (path) props.handleRotateFile(path, deg);
    },
    onRemoveFile: (target: any) => {
      const path = typeof target === 'number' ? props.files[target] : target;
      if (path) {
        props.setFiles((prev) => prev.filter((f) => f !== path));
        if (props.selectedFile === path) {
          props.setSelectedFile(props.files.find((f) => f !== path) || '');
        }
      }
    },
    onSelectFile: props.setSelectedFile,
  };

  const nodeL1Data: NodeL1Data = {
    ratio: props.ratio,
    files: props.files,
    selectedFile: props.selectedFile,
    cleanFile: props.cleanFile,
    status: props.washStatus,
    stats: props.washStats,
    keepSegments: props.keepSegments,
    cutSegments: props.cutSegments,
    silenceDb: props.silenceDb,
    minSilenceDurationSec: props.minSilenceDurationSec,
    originalFile: props.selectedFile,
    onStartWash: props.handleStartWash,
    onApplyCutToL3: props.handleApplyCutToL3,
    onProceedToL2: props.handleProceedToL2,
    onUpdateSilenceDb: props.setSilenceDb,
    onUpdateMinSilence: props.setMinSilenceDurationSec,
  };

  const handleGenerateDraft = useCallback(async () => {
    try {
      const res = await fetch('/api/video/director-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          director_id: sectorId,
          platform_id: props.platformId,
          topic: topic || directorPrompt,
          custom_prompt: directorPrompt,
          clean_file: props.cleanFile || props.selectedFile || '',
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
        props.setTrackItems(normalizedTracks);
        props.setDraftReady(true);
        alert(`分镜草稿生成完毕！已生成 ${normalizedTracks.length} 个轨道元素`);
      } else {
        alert(`生成草稿失败: ${data.error || '未知异常'}`);
      }
    } catch (e) {
      alert(`生成草稿异常: ${e}`);
    }
  }, [sectorId, props.platformId, topic, directorPrompt, props.cleanFile, props.selectedFile]);

  const nodeL2Data: NodeL2Data = {
    ratio: props.ratio,
    sectorId,
    directorId: props.directorId,
    subOptionId,
    directorPrompt,
    platformId: props.platformId,
    topic,
    draftReady: props.draftReady,
    generatedTracks: props.trackItems,
    sourceSegments: props.keepSegments,
    isActiveFocus: props.l2ActiveFocus,
    onUpdate: (updates) => {
      if (updates.sectorId) setSectorId(updates.sectorId);
      if (updates.directorId) props.setDirectorId(updates.directorId);
      if (updates.subOptionId) setSubOptionId(updates.subOptionId);
      if (updates.directorPrompt) setDirectorPrompt(updates.directorPrompt);
      if (updates.platformId) props.setPlatformId(updates.platformId);
      if (updates.topic !== undefined) setTopic(updates.topic);
    },
    onGenerateDraft: handleGenerateDraft,
    onProceedToL3: props.handleProceedToL3,
  };

  const nodeL3Data: NodeL3Data = {
    items: props.trackItems,
    isActiveFocus: props.l3ActiveFocus,
    onOpenDrawer: () => props.setDrawerOpen(true),
    onProceedToL4: props.handleProceedToL4,
  };

  const nodeL4Data: NodeL4Data = {
    status: props.isRendering ? 'rendering' : 'idle',
    progress: props.renderProgress,
    isActiveFocus: props.l4ActiveFocus,
    onStartRender: () => {
      props.setIsRendering(true);
      props.setRenderProgress(10);
      const timer = setInterval(() => {
        props.setRenderProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            props.setIsRendering(false);
            alert('成片压制完成！已同步保存至 outputs 目录。');
            return 100;
          }
          return prev + 15;
        });
      }, 800);
    },
  };

  const initialNodes = [
    { id: 'node-l0', type: 'nodeL0', position: { x: 50, y: 150 }, data: nodeL0Data },
    { id: 'node-l1', type: 'nodeL1', position: { x: 450, y: 150 }, data: nodeL1Data },
    { id: 'node-l2', type: 'nodeL2', position: { x: 860, y: 150 }, data: nodeL2Data },
    { id: 'node-l3', type: 'nodeL3', position: { x: 1250, y: 150 }, data: nodeL3Data },
    { id: 'node-l4', type: 'nodeL4', position: { x: 1640, y: 150 }, data: nodeL4Data },
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes as any);

  useEffect(() => {
    setNodes([
      { id: 'node-l0', type: 'nodeL0', position: { x: 50, y: 150 }, data: nodeL0Data },
      { id: 'node-l1', type: 'nodeL1', position: { x: 450, y: 150 }, data: nodeL1Data },
      { id: 'node-l2', type: 'nodeL2', position: { x: 860, y: 150 }, data: nodeL2Data },
      { id: 'node-l3', type: 'nodeL3', position: { x: 1250, y: 150 }, data: nodeL3Data },
      { id: 'node-l4', type: 'nodeL4', position: { x: 1640, y: 150 }, data: nodeL4Data },
    ] as any);
  }, [
    props.ratio, props.files, props.selectedFile, props.cleanFile, props.washStatus,
    props.washStats, props.keepSegments, props.cutSegments, props.silenceDb,
    props.minSilenceDurationSec, sectorId, subOptionId, directorPrompt, props.platformId,
    topic, props.draftReady, props.trackItems, props.l2ActiveFocus, props.l3ActiveFocus,
    props.l4ActiveFocus, props.isRendering, props.renderProgress
  ]);

  return {
    nodes,
    onNodesChange,
  };
}
