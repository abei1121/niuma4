export type AspectRatio = '9:16' | '16:9';

export interface TrackItem {
  id: string;
  trackType: 'video' | 'subtitle' | 'audio' | 'effect' | 'ai_gen';
  name: string;
  startSec: number;
  endSec: number;
  color?: string;
  detail?: string;
  [key: string]: any;
}

export interface KeepSegmentItem {
  index: number;
  start: number;
  end: number;
  duration: number;
  source_file?: string;
  file_index?: number;
  [key: string]: any;
}

export interface CutSegmentItem {
  index: number;
  start: number;
  end: number;
  duration: number;
  reason?: string;
  [key: string]: any;
}

export interface NodeL0Data {
  ratio: AspectRatio;
  files: string[];
  selectedFile?: string;
  onAddFiles?: () => void;
  onRotateFile?: (fileOrIndex: any, degrees?: number) => void;
  onRemoveFile?: (fileOrIndex: any) => void;
  onSelectFile?: (filePath: string) => void;
  [key: string]: any;
}

export interface NodeL1Data {
  ratio: AspectRatio;
  files: string[];
  selectedFile?: string;
  cleanFile?: string;
  status: 'idle' | 'washing' | 'completed';
  stats?: any;
  keepSegments: KeepSegmentItem[];
  cutSegments: CutSegmentItem[];
  silenceDb: number;
  minSilenceDurationSec: number;
  originalFile?: string;
  onStartWash?: () => void;
  onApplyCutToL3?: (segments: KeepSegmentItem[]) => void;
  onProceedToL2?: (segments: KeepSegmentItem[]) => void;
  onUpdateSilenceDb?: (db: number) => void;
  onUpdateMinSilence?: (sec: number) => void;
  [key: string]: any;
}

export interface NodeL2Data {
  ratio: AspectRatio;
  sectorId: string;
  directorId: string;
  subOptionId: string;
  directorPrompt: string;
  platformId: string;
  topic: string;
  isGenerating?: boolean;
  draftReady?: boolean;
  generatedTracks?: TrackItem[];
  sourceSegments?: KeepSegmentItem[];
  isActiveFocus?: boolean;
  onUpdate?: (updates: Partial<NodeL2Data>) => void;
  onGenerateDraft?: () => Promise<void>;
  onProceedToL3?: (tracks: TrackItem[]) => void;
  [key: string]: any;
}

export interface NodeL3Data {
  items: TrackItem[];
  isActiveFocus?: boolean;
  onOpenDrawer?: () => void;
  onProceedToL4?: () => void;
  [key: string]: any;
}

export interface NodeL4Data {
  status: 'idle' | 'rendering' | 'completed';
  progress: number;
  isActiveFocus?: boolean;
  onStartRender?: () => void;
  [key: string]: any;
}
