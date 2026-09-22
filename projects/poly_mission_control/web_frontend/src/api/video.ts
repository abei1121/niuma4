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
  try {
    const res = await fetch('/api/video/rough-wash', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        files,
        silence_threshold_db: Math.round(silenceDb),
        min_silence_sec: minSilenceDurationSec,
        ratio,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      return { success: false, error: `服务器返回状态 ${res.status}: ${text}` };
    }
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

export async function listProjects(): Promise<ProjectSummary[]> {
  try {
    const res = await fetch('/api/video/projects');
    if (!res.ok) return [];
    const data = await res.json();
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.projects)) return data.projects;
    return [];
  } catch {
    return [];
  }
}

export async function saveProject(name: string, data: any): Promise<any> {
  try {
    const res = await fetch('/api/video/projects/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, data }),
    });
    if (!res.ok) {
      const text = await res.text();
      return { success: false, error: text };
    }
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

export async function loadProject(name: string): Promise<any> {
  try {
    const res = await fetch(`/api/video/projects/load?name=${encodeURIComponent(name)}`);
    if (!res.ok) {
      const text = await res.text();
      return { success: false, error: text };
    }
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

export async function deleteProject(name: string): Promise<any> {
  try {
    const res = await fetch(`/api/video/projects/delete?name=${encodeURIComponent(name)}`, {
      method: 'POST',
    });
    if (!res.ok) {
      const text = await res.text();
      return { success: false, error: text };
    }
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}


export async function downloadRemoteVideos(urls: string[]): Promise<any> {
  try {
    const res = await fetch('/api/video/download-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urls }),
    });
    if (!res.ok) {
      const text = await res.text();
      return { success: false, error: text };
    }
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

export async function detectVideoRotation(file: string): Promise<any> {
  try {
    const res = await fetch(`/api/video/detect-rotation?file=${encodeURIComponent(file)}`);
    if (!res.ok) return { success: false, rotation: 0 };
    return await res.json();
  } catch (err: any) {
    return { success: false, rotation: 0, error: err?.message || String(err) };
  }
}

export async function fixVideoOrientation(file: string, rotation: number): Promise<any> {
  try {
    const res = await fetch('/api/video/fix-orientation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file, rotation }),
    });
    if (!res.ok) {
      const text = await res.text();
      return { success: false, error: text };
    }
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

export async function createVideoTask(
  name: string,
  taskType: string,
  inputFile: string,
  params?: any
): Promise<any> {
  try {
    const res = await fetch('/api/video/tasks/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        task_type: taskType,
        input_file: inputFile,
        params,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      return { success: false, error: text };
    }
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

