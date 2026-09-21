import { FunctionalComponent } from 'preact';
import { useState, useEffect, useMemo } from 'preact/hooks';
import { SkillItem, WikiItem } from '../types/system';
import { getSkillsList, getWikiList, getWikiFile, saveWikiFile } from '../api/system';

export const TabWikiSkills: FunctionalComponent = () => {
  const [subTab, setSubTab] = useState<'skills' | 'wiki'>('skills');
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [wikiFiles, setWikiFiles] = useState<WikiItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [wikiSearch, setWikiSearch] = useState('');
  const [loadingFile, setLoadingFile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    getSkillsList().then((res) => setSkills(Array.isArray(res) ? res : [])).catch(console.error);
    getWikiList().then((res) => setWikiFiles(Array.isArray(res) ? res : [])).catch(console.error);
  }, []);

  const handleSelectWiki = async (path: string) => {
    setSelectedFile(path);
    setLoadingFile(true);
    setSaveStatus(null);
    try {
      const res = await getWikiFile(path);
      setFileContent(res?.content || '');
    } catch (e: any) {
      console.error(e);
      setFileContent(`读取笔记失败: ${e.message || e}`);
    } finally {
      setLoadingFile(false);
    }
  };

  const handleSaveWiki = async () => {
    if (!selectedFile) return;
    setSaving(true);
    setSaveStatus(null);
    try {
      const res = await saveWikiFile(selectedFile, fileContent);
      if (res?.success) {
        setSaveStatus('保存成功！');
        setTimeout(() => setSaveStatus(null), 3000);
      } else {
        setSaveStatus('保存失败');
      }
    } catch (e: any) {
      setSaveStatus(`保存异常: ${e.message || e}`);
    } finally {
      setSaving(false);
    }
  };

  const filteredWiki = useMemo(() => {
    if (!wikiSearch.trim()) return wikiFiles;
    const q = wikiSearch.trim().toLowerCase();
    return wikiFiles.filter(
      (w) =>
        (w.relative_path || '').toLowerCase().includes(q) ||
        (w.title || '').toLowerCase().includes(q)
    );
  }, [wikiFiles, wikiSearch]);

  return (
    <div className="space-y-4">
      <div className="flex space-x-2 bg-gray-900 p-1 rounded-xl border border-gray-800 w-fit">
        <button
          onClick={() => setSubTab('skills')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            subTab === 'skills' ? 'bg-cyan-600 text-white shadow' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          技能生态库 ({skills.length})
        </button>
        <button
          onClick={() => setSubTab('wiki')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            subTab === 'wiki' ? 'bg-cyan-600 text-white shadow' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          Wiki 知识图谱 ({wikiFiles.length})
        </button>
      </div>

      {subTab === 'skills' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {skills.map((s) => (
            <div key={s.name} className="bg-[#0f172a] border border-gray-800 p-4 rounded-2xl space-y-2.5 shadow-md flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-cyan-300 font-bold text-xs">{s.name}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] border ${
                      s.is_executable_present
                        ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
                        : 'bg-amber-950/80 text-amber-400 border-amber-800'
                    }`}
                  >
                    {s.is_executable_present ? '执行体已就绪' : '文档沉淀'}
                  </span>
                </div>
                <div className="text-xs font-sans font-medium text-gray-200">{s.title || s.name}</div>
                <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{s.description || '暂无描述'}</p>
              </div>

              <div className="pt-2 border-t border-gray-800/80 space-y-1.5 text-[11px] font-mono">
                {s.triggers && s.triggers.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {s.triggers.slice(0, 3).map((tr, idx) => (
                      <span key={idx} className="px-1.5 py-0.2 rounded bg-gray-800 text-gray-300 text-[10px]">
                        #{tr}
                      </span>
                    ))}
                  </div>
                )}
                <div className="text-gray-500 truncate" title={s.reference_path}>
                  冷备: {s.reference_path ? s.reference_path.split('/').pop() : '--'} ({s.ref_lines || 0} 行)
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {subTab === 'wiki' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#0f172a] border border-gray-800 rounded-2xl p-3 max-h-[650px] flex flex-col space-y-2 shadow-md">
            <div className="px-1">
              <input
                type="text"
                placeholder="快速搜索 350+ 篇 Wiki 笔记..."
                value={wikiSearch}
                onInput={(e: any) => setWikiSearch(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-gray-200 font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="flex-1 overflow-y-auto space-y-1 pr-1">
              {filteredWiki.map((w) => {
                const path = w.relative_path;
                const isSelected = selectedFile === path;
                return (
                  <button
                    key={path}
                    onClick={() => handleSelectWiki(path)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs truncate transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 font-semibold'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                    }`}
                  >
                    <span className="truncate">{w.title || path}</span>
                    <span className="text-[10px] text-gray-500 font-mono ml-1 shrink-0">
                      {w.size_bytes ? `${Math.round(w.size_bytes / 1024)}K` : ''}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="md:col-span-2 bg-[#0f172a] border border-gray-800 rounded-2xl p-4 flex flex-col space-y-3 shadow-md">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
              <div className="flex items-center space-x-2 truncate">
                <span className="text-xs font-mono text-cyan-400 truncate">{selectedFile || '请选择左侧笔记文件'}</span>
                {saveStatus && (
                  <span className="text-xs font-semibold text-emerald-400 px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800">
                    {saveStatus}
                  </span>
                )}
              </div>
              {selectedFile && (
                <button
                  onClick={handleSaveWiki}
                  disabled={saving || loadingFile}
                  className="px-3.5 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition shrink-0"
                >
                  {saving ? '保存中...' : '保存更改'}
                </button>
              )}
            </div>
            {loadingFile ? (
              <div className="py-24 text-center text-xs text-cyan-400 animate-pulse">正在加载 Wiki 笔记内容...</div>
            ) : (
              <textarea
                value={fileContent}
                onInput={(e: any) => setFileContent(e.target.value)}
                className="w-full flex-1 min-h-[520px] bg-gray-900 border border-gray-800 rounded-xl p-3 text-xs font-mono text-gray-200 resize-none focus:outline-none focus:border-cyan-500 leading-relaxed"
                placeholder="选择左侧知识图谱笔记后在此查看与编辑..."
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
