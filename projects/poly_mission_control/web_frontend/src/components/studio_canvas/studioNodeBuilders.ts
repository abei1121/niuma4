import { AspectRatio, TrackItem, KeepSegmentItem, CutSegmentItem, NodeL0Data, NodeL1Data, NodeL2Data } from './types';

export function buildNodeL0Data(params: {
  ratio: AspectRatio;
  files: string[];
  selectedFile: string;
  onOpenMediaPicker: () => void;
  handleStartWash: () => void;
  handleRotateFile: (filePath: any, degrees?: number) => void;
  setFiles: (updater: (prev: string[]) => string[]) => void;
  setSelectedFile: (file: string) => void;
  setRatio: (ratio: AspectRatio) => void;
  onOpenPreview: (url: string, title: string) => void;
}): NodeL0Data {
  return {
    ratio: params.ratio,
    files: params.files,
    selectedFile: params.selectedFile,
    onAddFiles: params.onOpenMediaPicker,
    onOpenMediaPicker: params.onOpenMediaPicker,
    onGenerateL1: params.handleStartWash,
    onStartWash: params.handleStartWash,
    onRotateFile: (target: any, deg?: number) => {
      const path = typeof target === 'number' ? params.files[target] : target;
      if (path) params.handleRotateFile(path, deg);
    },
    onRemoveFile: (target: any) => {
      const path = typeof target === 'number' ? params.files[target] : target;
      if (path) {
        params.setFiles((prev) => prev.filter((f) => f !== path));
        if (params.selectedFile === path) {
          params.setSelectedFile(params.files.find((f) => f !== path) || '');
        }
      }
    },
    onSelectFile: params.setSelectedFile,
    onOpenPreview: params.onOpenPreview,
    onUpdate: (updates: any) => {
      if (updates?.ratio) params.setRatio(updates.ratio);
    },
  };
}

export function buildNodeL1Data(params: {
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
  handleStartWash: () => void;
  handleApplyCutToL3: (segments: KeepSegmentItem[]) => void;
  handleProceedToL2: (segments: KeepSegmentItem[]) => void;
  setSilenceDb: (db: number) => void;
  setMinSilenceDurationSec: (sec: number) => void;
  onOpenPreview: (url: string, title: string) => void;
}): NodeL1Data {
  return {
    ratio: params.ratio,
    files: params.files,
    selectedFile: params.selectedFile,
    cleanFile: params.cleanFile,
    status: params.washStatus,
    stats: params.washStats,
    keepSegments: params.keepSegments,
    cutSegments: params.cutSegments,
    silenceDb: params.silenceDb,
    silenceThresholdDb: params.silenceDb,
    minSilenceDurationSec: params.minSilenceDurationSec,
    originalFile: params.selectedFile,
    onStartWash: params.handleStartWash,
    onApplyCutToL3: params.handleApplyCutToL3,
    onProceedToL2: params.handleProceedToL2,
    onUpdateSilenceDb: params.setSilenceDb,
    onUpdateMinSilence: params.setMinSilenceDurationSec,
    onOpenPreview: params.onOpenPreview,
    onUpdate: (updates: any) => {
      if (updates?.silenceDb !== undefined) params.setSilenceDb(updates.silenceDb);
      if (updates?.silenceThresholdDb !== undefined) params.setSilenceDb(updates.silenceThresholdDb);
      if (updates?.minSilenceDurationSec !== undefined) params.setMinSilenceDurationSec(updates.minSilenceDurationSec);
    },
  };
}

export function buildNodeL2Data(params: {
  ratio: AspectRatio;
  sectorId: string;
  directorId: string;
  subOptionId: string;
  directorPrompt: string;
  platformId: string;
  topic: string;
  draftReady: boolean;
  generatedTracks: TrackItem[];
  sourceSegments: KeepSegmentItem[];
  isActiveFocus: boolean;
  onUpdate: (updates: any) => void;
  onGenerateDraft: () => Promise<void>;
  onProceedToL3: (tracks: TrackItem[]) => void;
}): NodeL2Data {
  return {
    ratio: params.ratio,
    sectorId: params.sectorId,
    directorId: params.directorId,
    subOptionId: params.subOptionId,
    directorPrompt: params.directorPrompt,
    platformId: params.platformId,
    topic: params.topic,
    draftReady: params.draftReady,
    generatedTracks: params.generatedTracks,
    sourceSegments: params.sourceSegments,
    isActiveFocus: params.isActiveFocus,
    onUpdate: params.onUpdate,
    onGenerateDraft: params.onGenerateDraft,
    onProceedToL3: params.onProceedToL3,
  };
}
