import { FunctionalComponent } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { getMediaLibrary, MediaItem } from '../../api/video';
import { BatchUploadTab } from './BatchUploadTab';
import { RemoteUrlTab } from './RemoteUrlTab';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAddFiles: (newFiles: string[]) => void;
}

export const MediaPickerModal: FunctionalComponent<Props> = ({ isOpen, onClose, onAddFiles }) => {
  if (!isOpen) return null;

  const [tab, setTab] = useState<'upload' | 'remote' | 'library' | 'manual'>('upload');
  const [library, setLibrary] = useState<MediaItem[]>([]);
  const [selectedPaths, setSelectedPaths] = useState<string[]>([]);
  const [manualPath, setManualPath] = useState('');
  const [autoFixOrientation, setAutoFixOrientation] = useState(true);

  useEffect(() => {
    getMediaLibrary().then((res) => setLibrary(res)).catch(console.error);
  }, [isOpen]);

  const toggleSelect = (p: string) => {
    setSelectedPaths((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0f172a] border border-cyan-500/40 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden text-gray-200">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800 bg-gray-900/90">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <h3 className="font-bold text-sm text-gray-100">批量添加素材 (局域网/外网/多条上传/自动正向)</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200 font-bold">X</button>
        </div>

        {/* 自动方向纠偏全局开关 */}
        <div className="bg-cyan-950/40 border-b border-cyan-500/20 px-5 py-2 flex items-center justify-between text-xs">
          <span className="text-cyan-300 font-medium">智能画面倒置检测与自动纠偏 (物理旋转摆正)</span>
          <label className="flex items-center space-x-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={autoFixOrientation}
              onChange={(e: any) => setAutoFixOrientation(e.target.checked)}
              className="rounded bg-gray-800 border-gray-700 text-cyan-500 focus:ring-0"
            />
            <span className="text-[11px] text-gray-300">默认启用</span>
          </label>
        </div>

        <div className="flex border-b border-gray-800 bg-gray-950/60 text-xs font-semibold">
          <button
            onClick={() => setTab('upload')}
            className={`flex-1 py-2.5 text-center transition ${tab === 'upload' ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-950/20 font-bold' : 'text-gray-400 hover:text-gray-200'}`}
          >
            批量上传 (多视频)
          </button>
          <button
            onClick={() => setTab('remote')}
            className={`flex-1 py-2.5 text-center transition ${tab === 'remote' ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-950/20 font-bold' : 'text-gray-400 hover:text-gray-200'}`}
          >
            外网/局域网URL拉取
          </button>
          <button
            onClick={() => setTab('library')}
            className={`flex-1 py-2.5 text-center transition ${tab === 'library' ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-950/20 font-bold' : 'text-gray-400 hover:text-gray-200'}`}
          >
            素材库已有 ({library.length})
          </button>
          <button
            onClick={() => setTab('manual')}
            className={`flex-1 py-2.5 text-center transition ${tab === 'manual' ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-950/20 font-bold' : 'text-gray-400 hover:text-gray-200'}`}
          >
            绝对路径
          </button>
        </div>

        <div className="p-5 min-h-[240px]">
          {tab === 'upload' && (
            <BatchUploadTab
              autoFixOrientation={autoFixOrientation}
              onAdded={onAddFiles}
              onClose={onClose}
            />
          )}

          {tab === 'remote' && (
            <RemoteUrlTab
              onAdded={onAddFiles}
              onClose={onClose}
            />
          )}

          {tab === 'library' && (
            <div className="space-y-3">
              <div className="max-h-52 overflow-y-auto space-y-1.5 border border-gray-800 rounded-lg p-2 bg-gray-950/60">
                {library.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-xs">素材库暂无视频，请使用上方“批量上传”或“URL拉取”</div>
                ) : (
                  library.map((item) => (
                    <div
                      key={item.path}
                      onClick={() => toggleSelect(item.path)}
                      className={`flex items-center justify-between p-2 rounded cursor-pointer transition text-xs border ${
                        selectedPaths.includes(item.path) ? 'bg-cyan-950/50 border-cyan-500/50 text-cyan-200' : 'bg-gray-900/60 border-gray-800 text-gray-300 hover:bg-gray-800/80'
                      }`}
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <input type="checkbox" checked={selectedPaths.includes(item.path)} readOnly className="rounded bg-gray-800 border-gray-700 text-cyan-500" />
                        <span className="font-mono truncate">{item.name}</span>
                      </div>
                      <span className="text-[10px] text-gray-500 font-mono ml-2">{item.size_mb}</span>
                    </div>
                  ))
                )}
              </div>
              <button
                onClick={() => {
                  onAddFiles(selectedPaths);
                  setSelectedPaths([]);
                  onClose();
                }}
                disabled={selectedPaths.length === 0}
                className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-lg text-xs font-bold transition"
              >
                添加选中素材 ({selectedPaths.length})
              </button>
            </div>
          )}

          {tab === 'manual' && (
            <div className="space-y-3">
              <input
                type="text"
                placeholder="/Users/hi/niuma/video_workspace/library/shot.mp4"
                value={manualPath}
                onInput={(e: any) => setManualPath(e.target.value)}
                className="w-full bg-gray-950 border border-gray-700 rounded-lg p-2.5 text-xs font-mono text-gray-100"
              />
              <button
                onClick={() => {
                  if (manualPath.trim()) {
                    onAddFiles([manualPath.trim()]);
                    setManualPath('');
                    onClose();
                  }
                }}
                disabled={!manualPath.trim()}
                className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition"
              >
                添加此绝对路径
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
