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
      trackItems: props.trackItems,
      savedAt: new Date().toISOString(),
    };
  }, [
    props.projectName, props.ratio, props.files, props.selectedFile, props.cleanFile,
    props.keepSegments, props.cutSegments, props.washStats, props.silenceDb,
    props.minSilenceDurationSec, props.directorId, props.platformId, props.trackItems
  ]);

  const handleLoadProjectData = useCallback((data: any) => {
    if (!data) return;
    if (data.projectName) props.setProjectName(data.projectName);
    if (data.ratio) props.setRatio(data.ratio);
    if (data.files) props.setFiles(() => data.files);
    if (data.selectedFile) props.setSelectedFile(data.selectedFile);
    if (data.cleanFile) {
      props.setCleanFile(data.cleanFile);
      props.setWashStatus('completed');
    }
    if (data.keepSegments) props.setKeepSegments(data.keepSegments);
    if (data.cutSegments) props.setCutSegments(data.cutSegments);
    if (data.washStats) props.setWashStats(data.washStats);
    if (typeof data.silenceDb === 'number') props.setSilenceDb(data.silenceDb);
    if (typeof data.minSilenceDurationSec === 'number') props.setMinSilenceDurationSec(data.minSilenceDurationSec);
    if (data.directorId) props.setDirectorId(data.directorId);
    if (data.platformId) props.setPlatformId(data.platformId);
    if (data.trackItems) props.setTrackItems(data.trackItems);
  }, [props]);

  const handleRotateFile = useCallback(async (filePath: string) => {
    try {
      const res = await fixVideoOrientation(filePath, 90);
      if (res.success && res.rotated_file) {
        props.setFiles((prev) => prev.map((f) => (f === filePath ? res.rotated_file : f)));
        if (props.selectedFile === filePath) props.setSelectedFile(res.rotated_file);
        alert('视频旋转 90 度完成！');
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
