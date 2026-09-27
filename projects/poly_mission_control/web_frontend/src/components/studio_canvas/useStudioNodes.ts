import { useState, useCallback, useEffect } from 'preact/hooks';
import { useNodesState } from '@xyflow/react';
import { AspectRatio, TrackItem, KeepSegmentItem, CutSegmentItem, NodeL3Data, NodeL4Data } from './types';
import { buildNodeL0Data, buildNodeL1Data, buildNodeL2Data } from './studioNodeBuilders';
import { executeRenderTask, executeDirectorDraft, executeJianyingExport } from './studioCanvasActions';

export interface UseStudioNodesProps {
  ratio: AspectRatio;
  files: string[];
  selectedFile: string;
  cleanFile: string;
  projectName?: string;
  washStatus: 'idle' | 'washing' | 'completed';
  washStats: any;
  keepSegments: KeepSegmentItem[];
  cutSegments: CutSegmentItem[];
  silenceDb: number;
  minSilenceDurationSec: number;
  directorId: string;
  platformId: string;
  sectorId?: string;
  setSectorId?: (id: string) => void;
  subOptionId?: string;
  setSubOptionId?: (id: string) => void;
  directorPrompt?: string;
  setDirectorPrompt?: (prompt: string) => void;
  topic?: string;
  setTopic?: (topic: string) => void;
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
  setIsL1ToL2Connected?: (connected: boolean) => void;
  setIsL2ToL3Connected?: (connected: boolean) => void;
  setIsL3ToL4Connected?: (connected: boolean) => void;
  setL2ActiveFocus?: (focused: boolean) => void;
  setL3ActiveFocus?: (focused: boolean) => void;
  setL4ActiveFocus?: (focused: boolean) => void;
  l2ActiveFocus: boolean;
  l3ActiveFocus: boolean;
  l4ActiveFocus: boolean;
  onOpenPreview: (url: string, title: string) => void;
}

export function useStudioNodes(props: UseStudioNodesProps) {
  const [localSectorId, setLocalSectorId] = useState('xuanxue');
  const [localSubOptionId, setLocalSubOptionId] = useState('xx_mingpan');
  const [localDirectorPrompt, setLocalDirectorPrompt] = useState('爆款自媒体玄学名人命盘视频导演');
  const [localTopic, setLocalTopic] = useState('');
  const [outputFile, setOutputFile] = useState<string>('');
  const [hookTitle, setHookTitle] = useState('');
  const [draftSummary, setDraftSummary] = useState('');
  const [isExportingJianying, setIsExportingJianying] = useState(false);

  const sectorId = props.sectorId ?? localSectorId;
  const subOptionId = props.subOptionId ?? localSubOptionId;
  const directorPrompt = props.directorPrompt ?? localDirectorPrompt;
  const topic = props.topic ?? localTopic;

  const updateSectorId = props.setSectorId ?? setLocalSectorId;
  const updateSubOptionId = props.setSubOptionId ?? setLocalSubOptionId;
  const updateDirectorPrompt = props.setDirectorPrompt ?? setLocalDirectorPrompt;
  const updateTopic = props.setTopic ?? setLocalTopic;

  const nodeL0Data = buildNodeL0Data({
    ratio: props.ratio,
    files: props.files,
    selectedFile: props.selectedFile,
    isWashed: Boolean(props.cleanFile || props.washStatus === 'completed' || (props.keepSegments && props.keepSegments.length > 0)),
    onOpenMediaPicker: () => props.setMediaPickerOpen(true),
    handleStartWash: props.handleStartWash,
    handleRotateFile: props.handleRotateFile,
    setFiles: props.setFiles,
    setSelectedFile: props.setSelectedFile,
    setRatio: props.setRatio,
    onOpenPreview: props.onOpenPreview,
  });

  const nodeL1Data = buildNodeL1Data({
    ratio: props.ratio,
    files: props.files,
    selectedFile: props.selectedFile,
    cleanFile: props.cleanFile,
    washStatus: props.washStatus,
    washStats: props.washStats,
    keepSegments: props.keepSegments,
    cutSegments: props.cutSegments,
    silenceDb: props.silenceDb,
    minSilenceDurationSec: props.minSilenceDurationSec,
    handleStartWash: props.handleStartWash,
    handleApplyCutToL3: props.handleApplyCutToL3,
    handleProceedToL2: props.handleProceedToL2,
    setSilenceDb: props.setSilenceDb,
    setMinSilenceDurationSec: props.setMinSilenceDurationSec,
    onOpenPreview: props.onOpenPreview,
  });

  const handleGenerateDraft = useCallback(() => {
    return executeDirectorDraft({
      sectorId,
      platformId: props.platformId,
      topic,
      directorPrompt,
      cleanFile: props.cleanFile,
      selectedFile: props.selectedFile,
      setHookTitle,
      setDraftSummary,
      setTrackItems: props.setTrackItems,
      setDraftReady: props.setDraftReady,
      setIsL2ToL3Connected: props.setIsL2ToL3Connected,
      setL2ActiveFocus: props.setL2ActiveFocus,
      setL3ActiveFocus: props.setL3ActiveFocus,
      handleProceedToL3: props.handleProceedToL3,
    });
  }, [sectorId, props.platformId, topic, directorPrompt, props.cleanFile, props.selectedFile]);

  const handleExportJianying = useCallback(() => {
    return executeJianyingExport({
      cleanFile: props.cleanFile,
      selectedFile: props.selectedFile,
      files: props.files,
      projectName: props.projectName,
      sectorId,
      hookTitle,
      topic,
      directorRole: directorPrompt || topic,
      platformId: props.platformId,
      setIsExportingJianying,
    });
  }, [props.cleanFile, props.selectedFile, props.files, props.projectName, sectorId, hookTitle, topic, directorPrompt, props.platformId]);


  const nodeL2Data = buildNodeL2Data({
    ratio: props.ratio,
    cleanFile: props.cleanFile,
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
    hookTitle,
    draftSummary,
    onUpdate: (updates: any) => {
      if (updates.sectorId) updateSectorId(updates.sectorId);
      if (updates.directorId) props.setDirectorId(updates.directorId);
      if (updates.subOptionId) updateSubOptionId(updates.subOptionId);
      if (updates.directorPrompt) updateDirectorPrompt(updates.directorPrompt);
      if (updates.platformId) props.setPlatformId(updates.platformId);
      if (updates.topic !== undefined) updateTopic(updates.topic);
    },
    onGenerateDraft: handleGenerateDraft,
    onProceedToL3: props.handleProceedToL3,
  });

  const nodeL3Data: NodeL3Data = {
    items: props.trackItems,
    isActiveFocus: props.l3ActiveFocus,
    onOpenDrawer: () => props.setDrawerOpen(true),
    onProceedToL4: props.handleProceedToL4,
    onExportJianying: handleExportJianying,
    isExportingJianying,
  };

  const nodeL4Data: NodeL4Data = {
    status: props.isRendering ? 'rendering' : 'idle',
    progress: props.renderProgress,
    isActiveFocus: props.l4ActiveFocus,
    outputFile,
    onStartRender: () => {
      const targetFile = props.cleanFile || props.selectedFile || (props.files && props.files[0]);
      executeRenderTask({
        targetFile,
        setIsRendering: props.setIsRendering,
        setRenderProgress: props.setRenderProgress,
        setOutputFile,
      });
    },
  };

  const initialNodes: any[] = [
    { id: 'node-l0', type: 'nodeL0', position: { x: 40, y: 100 }, data: nodeL0Data },
    { id: 'node-l1', type: 'nodeL1', position: { x: 540, y: 100 }, data: nodeL1Data },
    { id: 'node-l2', type: 'nodeL2', position: { x: 1080, y: 100 }, data: nodeL2Data },
    { id: 'node-l3', type: 'nodeL3', position: { x: 1640, y: 100 }, data: nodeL3Data },
    { id: 'node-l4', type: 'nodeL4', position: { x: 2160, y: 100 }, data: nodeL4Data },
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);

  useEffect(() => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === 'node-l0') return { ...n, data: nodeL0Data };
        if (n.id === 'node-l1') return { ...n, data: nodeL1Data };
        if (n.id === 'node-l2') return { ...n, data: nodeL2Data };
        if (n.id === 'node-l3') return { ...n, data: nodeL3Data };
        if (n.id === 'node-l4') return { ...n, data: nodeL4Data };
        return n;
      })
    );
  }, [
    props.ratio, props.files, props.selectedFile, props.cleanFile, props.washStatus,
    props.washStats, props.keepSegments, props.cutSegments, props.silenceDb,
    props.minSilenceDurationSec, sectorId, subOptionId, directorPrompt, props.platformId,
    topic, props.draftReady, props.trackItems, props.l2ActiveFocus, props.l3ActiveFocus,
    props.l4ActiveFocus, props.isRendering, props.renderProgress, outputFile, hookTitle, draftSummary, isExportingJianying,
  ]);

  const resetNodesLayout = useCallback(() => {
    setNodes(initialNodes);
  }, [setNodes]);

  return { nodes, onNodesChange, resetNodesLayout };
}
