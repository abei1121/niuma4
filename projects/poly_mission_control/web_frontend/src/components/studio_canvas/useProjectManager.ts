import { useCallback } from 'preact/hooks';
import { AspectRatio, TrackItem, KeepSegmentItem, CutSegmentItem } from './types';
import { fixVideoOrientation } from '../../api/video';

export interface UseProjectManagerProps {
  projectName: string;
  setProjectName: (name: string) => void;
  ratio: AspectRatio;
  setRatio: (ratio: AspectRatio) => void;
  files: string[];
  setFiles: (updater: (prev: string[]) => string[]) => void;
  selectedFile: string;
  setSelectedFile: (file: string) => void;
  cleanFile: string;
  setCleanFile: (file: string) => void;
  setWashStatus: (status: 'idle' | 'washing' | 'completed') => void;
  keepSegments: KeepSegmentItem[];
  setKeepSegments: (segs: KeepSegmentItem[]) => void;
  cutSegments: CutSegmentItem[];
  setCutSegments: (segs: CutSegmentItem[]) => void;
  washStats: any;
  setWashStats: (stats: any) => void;
  silenceDb: number;
  setSilenceDb: (db: number) => void;
  minSilenceDurationSec: number;
  setMinSilenceDurationSec: (sec: number) => void;
  directorId: string;
  setDirectorId: (id: string) => void;
  platformId: string;
  setPlatformId: (id: string) => void;
  trackItems: TrackItem[];
  setTrackItems: (items: TrackItem[]) => void;
  sectorId?: string;
  setSectorId?: (id: string) => void;
  subOptionId?: string;
  setSubOptionId?: (id: string) => void;
  directorPrompt?: string;
  setDirectorPrompt?: (prompt: string) => void;
  topic?: string;
  setTopic?: (topic: string) => void;
  draftReady?: boolean;
  setDraftReady?: (ready: boolean) => void;
  setIsL1ToL2Connected?: (connected: boolean) => void;
  setIsL2ToL3Connected?: (connected: boolean) => void;
  onProjectLoaded?: (projectName: string) => void;
}

export function useProjectManager(props: UseProjectManagerProps) {
  const getCurrentProjectData = useCallback(() => {
    return {
      projectName: props.projectName,
      ratio: props.ratio,
      files: props.files,
      selectedFile: props.selectedFile,
      cleanFile: props.cleanFile,
      keepSegments: props.keepSegments,
      cutSegments: props.cutSegments,
      washStats: props.washStats,
      silenceDb: props.silenceDb,
      minSilenceDurationSec: props.minSilenceDurationSec,
      directorId: props.directorId,
      platformId: props.platformId,
      sectorId: props.sectorId,
      subOptionId: props.subOptionId,
      directorPrompt: props.directorPrompt,
      topic: props.topic,
      draftReady: props.draftReady,
      trackItems: props.trackItems,
      savedAt: new Date().toISOString(),
    };
  }, [
    props.projectName, props.ratio, props.files, props.selectedFile, props.cleanFile,
    props.keepSegments, props.cutSegments, props.washStats, props.silenceDb,
    props.minSilenceDurationSec, props.directorId, props.platformId, props.sectorId,
    props.subOptionId, props.directorPrompt, props.topic, props.draftReady, props.trackItems
  ]);

  const handleLoadProjectData = useCallback((nameOrData: any, maybeData?: any) => {
    let data = maybeData;
    let name = typeof nameOrData === 'string' ? nameOrData : '';
    if (!data && typeof nameOrData === 'object' && nameOrData !== null) {
      data = nameOrData.data || nameOrData;
      if (!name && nameOrData.name) name = nameOrData.name;
    }
    if (!data) return;

    const targetName = name || data.projectName || props.projectName;
    if (targetName) props.setProjectName(targetName);
    if (data.ratio) props.setRatio(data.ratio);

    const loadedFiles = Array.isArray(data.files) ? data.files : [];
    props.setFiles(() => loadedFiles);

    const targetSelected = data.selectedFile || (loadedFiles.length > 0 ? loadedFiles[0] : '');
    props.setSelectedFile(targetSelected);

    if (data.cleanFile) {
      props.setCleanFile(data.cleanFile);
      props.setWashStatus('completed');
    } else {
      props.setCleanFile('');
      props.setWashStatus('idle');
    }

    const loadedKeeps = Array.isArray(data.keepSegments) ? data.keepSegments : [];
    props.setKeepSegments(loadedKeeps);
    props.setCutSegments(Array.isArray(data.cutSegments) ? data.cutSegments : []);
    props.setWashStats(data.washStats || null);

    if (typeof data.silenceDb === 'number') props.setSilenceDb(data.silenceDb);
    if (typeof data.minSilenceDurationSec === 'number') props.setMinSilenceDurationSec(data.minSilenceDurationSec);
    if (data.directorId) props.setDirectorId(data.directorId);
    if (data.platformId) props.setPlatformId(data.platformId);
    if (data.sectorId && props.setSectorId) props.setSectorId(data.sectorId);
    if (data.subOptionId && props.setSubOptionId) props.setSubOptionId(data.subOptionId);
    if (data.directorPrompt && props.setDirectorPrompt) props.setDirectorPrompt(data.directorPrompt);
    if (data.topic !== undefined && props.setTopic) props.setTopic(data.topic);

    const loadedTracks = Array.isArray(data.trackItems) && data.trackItems.length > 0 ? data.trackItems : [];
    if (loadedTracks.length > 0) {
      props.setTrackItems(loadedTracks);
    }

    const hasWash = Boolean(data.cleanFile || loadedKeeps.length > 0);
    if (props.setIsL1ToL2Connected) props.setIsL1ToL2Connected(hasWash);

    const hasDraft = Boolean(data.draftReady || loadedTracks.length > 0);
    if (props.setDraftReady) props.setDraftReady(hasDraft);
    if (props.setIsL2ToL3Connected) props.setIsL2ToL3Connected(hasDraft);

    props.onProjectLoaded?.(targetName);
  }, [props]);

  const handleRotateFile = useCallback(async (filePath: string) => {
    try {
      const res = await fixVideoOrientation(filePath, 90);
      if (res.success && res.rotated_file) {
        props.setFiles((prev) => prev.map((f) => (f === filePath ? res.rotated_file : f)));
        if (props.selectedFile === filePath) props.setSelectedFile(res.rotated_file);
        alert('视频顺时针旋转90度完成');
      } else {
        alert(`旋转失败: ${res.error || '未知原因'}`);
      }
    } catch (e) {
      alert(`旋转执行异常: ${e}`);
    }
  }, [props.selectedFile]);

  return {
    getCurrentProjectData,
    handleLoadProjectData,
    handleRotateFile,
  };
}
