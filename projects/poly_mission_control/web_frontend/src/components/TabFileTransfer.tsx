import { FunctionalComponent } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import { getLanFiles, deleteFile, sendFileToTg, uploadFiles, createFolder } from '../api/system';

interface FileItem {
  name: string;
  path: string;
  is_dir: boolean;
  size_bytes: number;
  size_human: string;
  modified_time: string;
  extension: string;
}

const PRESET_PATHS = [
  { label: '视频工作区', path: '/Users/hi/niuma/video_workspace' },
  { label: '素材库', path: '/Users/hi/niuma/video_workspace/library' },
  { label: '成品库', path: '/Users/hi/niuma/video_workspace/outputs' },
  { label: '家目录', path: '/Users/hi/niuma' },
  { label: '控制中枢', path: '/Users/hi/niuma/poly_mission_control' },
  { label: '系统根目录', path: '/' },
];

export const TabFileTransfer: FunctionalComponent = () => {
  const [currentPath, setCurrentPath] = useState('/Users/hi/niuma');
  const [inputPath, setInputPath] = useState('/Users/hi/niuma');
  const [parentPath, setParentPath] = useState<string | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [actionFile, setActionFile] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = async (targetPath?: string) => {
    const p = targetPath !== undefined ? targetPath : currentPath;
    setLoading(true);
    try {
      const res = await getLanFiles(p);
      if (res) {
        setCurrentPath(res.current_path);
        setInputPath(res.current_path);
        setParentPath(res.parent_path);
        setFiles(res.items || []);
      }
    } catch (e) {
      console.error('检索目录异常:', e);
      alert(`无法访问目录: ${e}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData('/Users/hi/niuma');
  }, []);

  const handleUpload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    const formData = new FormData();
    for (let i = 0; i < fileList.length; i++) {
      formData.append('files', fileList[i]);
    }
    try {
      const res = await uploadFiles(formData, currentPath);
      if (res && res.success) {
        await loadData(currentPath);
      } else {
        alert(`上传失败: ${res?.error || '未知错误'}`);
      }
    } catch (e) {
      alert(`上传异常: ${e}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCreateFolder = async () => {
    const name = prompt('请输入新文件夹名称:');
    if (!name || !name.trim()) return;
    try {
      const res = await createFolder(currentPath, name.trim());
      if (res && res.success) {
        await loadData(currentPath);
      } else {
        alert(`创建文件夹失败: ${res?.error || '未知错误'}`);
      }
    } catch (e) {
      alert(`创建文件夹异常: ${e}`);
    }
  };

  const handleSendToTg = async (filePath: string, fileName: string) => {
    setActionFile(filePath);
    try {
      const res = await sendFileToTg(filePath);
      if (res && res.success) {
        alert(`已成功向 Telegram 推送文件: ${fileName}`);
      } else {
        alert(`推送失败: ${res?.error || '未知错误'}`);
      }
    } catch (e) {
      alert(`推送异常: ${e}`);
    } finally {
      setActionFile(null);
    }
  };

  const handleDelete = async (filePath: string, fileName: string, isDir: boolean) => {
    const typeLabel = isDir ? '文件夹' : '文件';
    if (!confirm(`确认物理删除${typeLabel}: ${fileName} 吗？${isDir ? '（包含子内容）' : ''}`)) return;
    setActionFile(filePath);
    try {
      const res = await deleteFile(filePath);
      if (res && res.success) {
        await loadData(currentPath);
      } else {
        alert(`删除失败: ${res?.error || '未知错误'}`);
      }
    } catch (e) {
      alert(`删除异常: ${e}`);
    } finally {
      setActionFile(null);
    }
  };

  const handleDownload = (filePath: string) => {
    window.open(`/api/files/download?path=${encodeURIComponent(filePath)}`, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* 顶部跨端连接指示条 */}
      <div className="bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-900 border border-cyan-500/30 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <h3 className="text-sm font-bold text-gray-100">局域网跨端文件传输中枢</h3>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">局域网直连</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            局域网入口: <code className="text-cyan-300">{typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:8999` : 'http://192.168.1.3:8999'}</code>
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCreateFolder}
            className="px-3 py-1.5 bg-cyan-700/50 hover:bg-cyan-600 text-cyan-200 border border-cyan-500/30 rounded-lg text-xs font-medium transition"
          >
            + 新建文件夹
          </button>
          <button
            onClick={() => loadData(currentPath)}
            disabled={loading}
            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs font-medium transition"
          >
            {loading ? '刷新中...' : '刷新'}
          </button>
        </div>
      </div>

      {/* 常用目录快速跳转 */}
      <div className="flex flex-wrap items-center gap-1.5 bg-gray-900/70 p-2 rounded-xl border border-gray-800 text-xs">
        <span className="text-gray-500 font-mono px-1">快速跳转:</span>
        {PRESET_PATHS.map((item) => (
          <button
            key={item.path}
            onClick={() => loadData(item.path)}
            className={`px-2.5 py-1 rounded-lg transition ${
              currentPath === item.path
                ? 'bg-cyan-600 text-white font-bold shadow-sm'
                : 'bg-gray-800/80 hover:bg-gray-700 text-gray-300'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* 交互式地址栏 */}
      <div className="flex items-center gap-2 bg-[#0f172a] p-2 rounded-xl border border-gray-800 shadow-inner">
        <button
          disabled={!parentPath || loading}
          onClick={() => parentPath && loadData(parentPath)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
            parentPath
              ? 'bg-gray-800 hover:bg-gray-700 text-cyan-300 border border-cyan-500/30'
              : 'bg-gray-900 text-gray-600 cursor-not-allowed border border-gray-800'
          }`}
          title={parentPath ? `返回上一级: ${parentPath}` : '已到达根目录'}
        >
          ⬆️ 返回上一级
        </button>
        <div className="flex-1 flex items-center bg-gray-950 border border-gray-800 rounded-lg px-3 py-1 focus-within:border-cyan-500/60">
          <span className="text-gray-500 text-xs font-mono mr-2">路径:</span>
          <input
            type="text"
            value={inputPath}
            onInput={(e) => setInputPath((e.target as HTMLInputElement).value)}
            onKeyDown={(e) => e.key === 'Enter' && loadData(inputPath)}
            className="flex-1 bg-transparent text-xs font-mono text-cyan-300 focus:outline-none"
            placeholder="/Users/hi/niuma"
          />
        </div>
        <button
          onClick={() => loadData(inputPath)}
          disabled={loading}
          className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold shadow transition"
        >
          跳转
        </button>
      </div>

      {/* 拖拽上传区域 */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          handleUpload(e.dataTransfer?.files || null);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition ${
          isDragOver
            ? 'border-cyan-400 bg-cyan-950/20'
            : 'border-gray-700 hover:border-cyan-500/50 bg-slate-900/40 hover:bg-slate-900/80'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleUpload((e.target as HTMLInputElement).files)}
        />
        <div className="text-xs text-gray-300 space-y-1">
          <p className="font-semibold text-sm text-cyan-300">
            {uploading ? '正在流式上传文件至当前中枢目录...' : '点击选择文件 或 将任意文件拖拽至此处上传'}
          </p>
          <p className="text-gray-500 text-[11px]">
            当前目标目录: <span className="text-cyan-400 font-mono font-bold">{currentPath}</span>（流式落盘，支持大容量视频素材与任意格式）
          </p>
        </div>
      </div>

      {/* 文件与目录列表 */}
      <div className="bg-[#0f172a] border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-6 py-3 border-b border-gray-800 flex items-center justify-between text-xs text-gray-400 font-mono">
          <span>当前目录: <strong className="text-gray-200">{currentPath}</strong></span>
          <span>共计 {files.length} 个条目</span>
        </div>
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-gray-900/60 text-gray-400 border-b border-gray-800">
            <tr>
              <th className="px-6 py-3">名称</th>
              <th className="px-4 py-3">大小</th>
              <th className="px-4 py-3">修改时间</th>
              <th className="px-6 py-3 text-right">管理操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {loading && (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-cyan-400">正在检索目录条目...</td></tr>
            )}
            {!loading && files.length === 0 && (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">当前目录为空，可使用上方区域快速上传文件</td></tr>
            )}
            {!loading && files.map((f, idx) => {
              const isOperating = actionFile === f.path;
              return (
                <tr key={idx} className="hover:bg-gray-800/40 transition">
                  <td className="px-6 py-3 font-sans font-medium">
                    {f.is_dir ? (
                      <button
                        onClick={() => loadData(f.path)}
                        className="text-amber-400 hover:text-amber-300 font-semibold flex items-center space-x-1.5 transition text-left"
                      >
                        <span class="text-cyan-400 font-mono">[目录]</span>
                        <span>{f.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950/60 text-amber-300 border border-amber-500/20 font-mono">文件夹</span>
                      </button>
                    ) : (
                      <span className="text-cyan-300 flex items-center space-x-1.5">
                        <span class="text-gray-400 font-mono">[文件]</span>
                        <span>{f.name}</span>
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-400">{f.size_human || '--'}</td>
                  <td className="px-4 py-3 text-gray-500">{f.modified_time || '--'}</td>
                  <td className="px-6 py-3 text-right space-x-2">
                    {f.is_dir ? (
                      <button
                        onClick={() => loadData(f.path)}
                        className="px-2.5 py-1 bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 border border-amber-500/40 rounded text-[11px] font-semibold transition"
                      >
                        进入目录
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => handleDownload(f.path)}
                          className="px-2.5 py-1 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 rounded text-[11px] font-semibold transition"
                        >
                          下载
                        </button>
                        <button
                          disabled={isOperating}
                          onClick={() => handleSendToTg(f.path, f.name)}
                          className="px-2.5 py-1 bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 border border-cyan-500/40 rounded text-[11px] font-semibold transition"
                        >
                          {isOperating ? '投递中...' : '推至 TG'}
                        </button>
                      </>
                    )}
                    <button
                      disabled={isOperating}
                      onClick={() => handleDelete(f.path, f.name, f.is_dir)}
                      className="px-2.5 py-1 bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/30 rounded text-[11px] font-semibold transition"
                    >
                      删除
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
