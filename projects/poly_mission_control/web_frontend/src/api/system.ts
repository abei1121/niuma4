import { SystemMetrics, GeminiAccount, SubagentItem, DaemonStatus, CrontabJob, SkillItem, WikiItem } from '../types/system';

export async function getSystemMetrics(): Promise<SystemMetrics> {
  const res = await fetch('/api/system');
  return res.json();
}

export async function getGeminiAccounts(): Promise<GeminiAccount[]> {
  const res = await fetch('/api/gemini-accounts');
  return res.json();
}

export async function switchGeminiAccount(idOrIndex: string | number): Promise<any> {
  const payload = typeof idOrIndex === 'string' ? { id: idOrIndex } : { id: `acc${idOrIndex + 1}`, index: idOrIndex };
  const res = await fetch('/api/gemini-accounts/switch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function unblockGeminiAccount(idOrIndex: string | number): Promise<any> {
  const payload = typeof idOrIndex === 'string' ? { id: idOrIndex } : { id: `acc${idOrIndex + 1}`, index: idOrIndex };
  const res = await fetch('/api/gemini-accounts/unblock', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function unblockAllGeminiAccounts(): Promise<any> {
  const res = await fetch('/api/gemini-accounts/unblock-all', { method: 'POST' });
  return res.json();
}

export async function updateGeminiAccountName(idOrIndex: string | number, name: string): Promise<any> {
  const payload = typeof idOrIndex === 'string' ? { id: idOrIndex, name } : { id: `acc${idOrIndex + 1}`, index: idOrIndex, name };
  const res = await fetch('/api/gemini-accounts/update-name', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function removeGeminiAccount(idOrIndex: string | number): Promise<any> {
  const payload = typeof idOrIndex === 'string' ? { id: idOrIndex } : { id: `acc${idOrIndex + 1}`, index: idOrIndex };
  const res = await fetch('/api/gemini-accounts/remove', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function addGeminiAccount(account: any): Promise<any> {
  const res = await fetch('/api/gemini-accounts/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(account),
  });
  return res.json();
}

export async function startPkceOAuth(): Promise<any> {
  const res = await fetch('/api/gemini-accounts/oauth/start');
  return res.json();
}

export async function exchangePkceCode(code: string): Promise<any> {
  const res = await fetch('/api/gemini-accounts/oauth/exchange', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });
  return res.json();
}

export async function getSubagentsStatus(): Promise<{ agents: SubagentItem[] }> {
  const res = await fetch('/api/subagents/status');
  return res.json();
}

export async function dispatchSubagent(agentOrTask: string, task?: string): Promise<any> {
  const payload = task !== undefined ? { agent: agentOrTask, task } : { task: agentOrTask, agent: 'video_director' };
  const res = await fetch('/api/subagents/dispatch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function getDaemonsStatus(): Promise<DaemonStatus[]> {
  const res = await fetch('/api/services/daemons');
  return res.json();
}

export async function restartDaemon(service: string): Promise<any> {
  const res = await fetch('/api/services/restart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ service }),
  });
  return res.json();
}

export async function getCrontabJobs(): Promise<CrontabJob[]> {
  const res = await fetch('/api/services/crontab');
  return res.json();
}

export async function runCrontabNow(command: string): Promise<any> {
  const res = await fetch('/api/services/crontab/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ command }),
  });
  return res.json();
}

export async function getLogs(logName?: string): Promise<any> {
  const url = logName ? `/api/logs?name=${encodeURIComponent(logName)}` : '/api/logs';
  const res = await fetch(url);
  const data = await res.json();
  if (Array.isArray(data)) return { lines: data };
  return data;
}

export async function getSkillsList(): Promise<SkillItem[]> {
  const res = await fetch('/api/skills');
  return res.json();
}

export async function getWikiList(): Promise<WikiItem[]> {
  const res = await fetch('/api/wiki/list');
  return res.json();
}

export async function getWikiFile(path: string): Promise<any> {
  const res = await fetch(`/api/wiki/file?path=${encodeURIComponent(path)}`);
  const data = await res.json();
  if (typeof data === 'string') return { content: data };
  return data;
}

export async function saveWikiFile(path: string, content: string): Promise<any> {
  const res = await fetch('/api/wiki/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, content }),
  });
  return res.json();
}

export async function getLanFiles(path: string): Promise<any> {
  const res = await fetch(`/api/files/list?path=${encodeURIComponent(path)}`);
  return res.json();
}

export async function deleteFile(path: string): Promise<any> {
  const res = await fetch('/api/files/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path }),
  });
  return res.json();
}

export async function sendFileToTg(path: string): Promise<any> {
  const res = await fetch('/api/files/send-to-tg', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path }),
  });
  return res.json();
}

export async function uploadFiles(formData: FormData, targetDir?: string): Promise<any> {
  const url = targetDir ? `/api/files/upload?path=${encodeURIComponent(targetDir)}` : '/api/files/upload';
  const res = await fetch(url, {
    method: 'POST',
    body: formData,
  });
  return res.json();
}

export async function createFolder(path: string, folderName: string): Promise<any> {
  const res = await fetch('/api/files/create-folder', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, folder_name: folderName }),
  });
  return res.json();
}
