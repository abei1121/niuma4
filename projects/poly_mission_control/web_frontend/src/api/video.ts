export interface VideoTask {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  created_at?: string;
  input_file?: string;
  output_file?: string;
  error?: string;
  [key: string]: any;
}

export interface MediaItem {
  name: string;
  path: string;
  category: '素材' | '成品' | '临时';
  size_human: string;
  size_mb?: string | number;
  size_bytes?: number;
  duration_sec?: number;
  modified_time: string;
  is_video?: boolean;
  [key: string]: any;
}

export interface ProjectSummary {
  id: string;
  name: string;
  updated_at: string;
  file_count?: number;
  ratio?: string;
  [key: string]: any;
}

export async function getVideoTasks(): Promise<VideoTask[]> {
  const res = await fetch('/api/video/tasks');
  const data = await res.json();
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.tasks)) return data.tasks;
  return [];
}

export async function getMediaLibrary(): Promise<MediaItem[]> {
  const res = await fetch('/api/video/library');
  const data = await res.json();
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.library)) return data.library;
  return [];
}

export async function executeRoughWash(
  files: string[],
  silenceDb: number,
  minSilenceDurationSec: number,
  ratio?: string
): Promise<any> {
  const res = await fetch('/api/video/rough-wash', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      files,
      silence_threshold_db: silenceDb,
      silence_db: silenceDb,
      min_silence_sec: minSilenceDurationSec,
      min_silence_duration_sec: minSilenceDurationSec,
      ratio,
    }),
  });
  return res.json();
}

export async function listProjects(): Promise<ProjectSummary[]> {
  const res = await fetch('/api/video/projects');
  return res.json();
}

export async function saveProject(name: string, data: any): Promise<any> {
  const res = await fetch('/api/video/projects/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, data }),
  });
  return res.json();
}

export async function loadProject(name: string): Promise<any> {
  const res = await fetch(`/api/video/projects/load?name=${encodeURIComponent(name)}`);
  return res.json();
}

export async function downloadRemoteVideos(urls: string[]): Promise<any> {
  const res = await fetch('/api/video/download-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ urls }),
  });
  return res.json();
}

export async function detectVideoRotation(file: string): Promise<any> {
  const res = await fetch(`/api/video/detect-rotation?file=${encodeURIComponent(file)}`);
  return res.json();
}

export async function fixVideoOrientation(file: string, rotation: number): Promise<any> {
  const res = await fetch('/api/video/fix-orientation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ file, rotation }),
  });
  return res.json();
}
