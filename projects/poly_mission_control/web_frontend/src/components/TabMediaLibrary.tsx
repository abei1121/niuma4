import { FunctionalComponent } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { getMediaLibrary, MediaItem } from '../api/video';
import { deleteFile } from '../api/system';
import { MediaPlayerModal } from './MediaPlayerModal';
import { UploadMediaModal } from './UploadMediaModal';

export const TabMediaLibrary: FunctionalComponent = () => {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterCategory, setFilterCategory] = useState<'all' | '素材' | '成品'>('all');
  const [playerItem, setPlayerItem] = useState<MediaItem | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const list = await getMediaLibrary();
      setItems(list || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSendToTg = async (path: string) => {
    try {
      const res = await fetch('/api/files/send-to-tg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path }),
      });
      const data = await res.json();
      if (data.success) {
        alert('已成功发送至 Telegram！');
      } else {
        alert('发送失败: ' + (data.error || '未知异常'));
      }
    } catch (e) {
      alert('请求错误: ' + e);
    }
  };

  const handleDelete = async (item: MediaItem) => {
    if (!window.confirm(`确定要物理删除文件 [${item.name}] 吗？此操作无法撤销。`)) {
      return;
    }
    try {
      const res = await deleteFile(item.path);
      if (res && res.success) {
        loadData();
      } else {
        alert('删除失败: ' + (res?.error || '未知错误'));
      }
    } catch (e) {
      alert('请求异常: ' + e);
    }
  };

  const filteredItems = items.filter((item) => {
    if (filterCategory === 'all') return true;
    return item.category === filterCategory;
  });

  const libraryCount = items.filter((i) => i.category === '素材').length;
  const outputsCount = items.filter((i) => i.category === '成品').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-900/80 p-4 rounded-2xl border border-gray-800 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <h2 className="text-base font-bold text-gray-100">媒体资产库 (素材 & 成品)</h2>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            素材库: <code className="text-blue-300 font-mono">/Users/hi/niuma/video_workspace/library</code> • 成品库: <code className="text-emerald-300 font-mono">outputs</code>
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={() => setUploadOpen(true)}
            className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-emerald-950/40 transition flex items-center space-x-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>+ 新增自媒体素材</span>
          </button>
          <div className="flex bg-gray-950/60 p-0.5 rounded-lg border border-gray-800 text-xs">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-2.5 py-1 rounded-md transition ${filterCategory === 'all' ? 'bg-gray-800 text-gray-100 font-semibold' : 'text-gray-400 hover:text-gray-200'}`}
            >
              全部 ({items.length})
            </button>
            <button
              onClick={() => setFilterCategory('素材')}
              className={`px-2.5 py-1 rounded-md transition ${filterCategory === '素材' ? 'bg-blue-950 text-blue-300 border border-blue-500/30 font-semibold' : 'text-gray-400 hover:text-gray-200'}`}
            >
              素材 ({libraryCount})
            </button>
            <button
              onClick={() => setFilterCategory('成品')}
              className={`px-2.5 py-1 rounded-md transition ${filterCategory === '成品' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-semibold' : 'text-gray-400 hover:text-gray-200'}`}
            >
              成品 ({outputsCount})
            </button>
          </div>
          <button
            onClick={loadData}
            disabled={loading}
            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs rounded-lg border border-gray-700 font-medium transition"
          >
            {loading ? '刷新中...' : '刷新'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.length === 0 ? (
          <div className="col-span-full bg-gray-900/40 p-12 text-center text-gray-500 rounded-2xl border border-gray-800 space-y-2">
            <div>暂无符合筛选条件的媒体资产</div>
            <div className="text-xs text-gray-600">点击右上角「+ 新增自媒体素材」可直接上传视频/音频素材</div>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div key={item.path} className="bg-[#0f172a] p-4 rounded-2xl border border-gray-800 space-y-3 shadow-lg hover:border-gray-700 transition">
              <div className="flex justify-between items-start">
                <span className={`px-2 py-0.5 text-[11px] font-semibold rounded ${item.category === '成品' ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30' : 'bg-blue-950/80 text-blue-300 border border-blue-500/30'}`}>
                  {item.category}
                </span>
                <span className="text-xs font-mono text-gray-400">{item.size_mb}</span>
              </div>
              <div className="font-medium text-sm text-gray-100 break-all line-clamp-2" title={item.name}>
                {item.name}
              </div>
              <div className="text-[11px] font-mono text-gray-500 truncate" title={item.path}>
                {item.path}
              </div>
              <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-gray-800/80">
                <button
                  onClick={() => setPlayerItem(item)}
                  className="col-span-1 py-1.5 bg-purple-600/20 hover:bg-purple-600/40 text-xs text-purple-300 rounded-lg border border-purple-500/30 transition flex items-center justify-center space-x-1 font-semibold"
                  title="在线流式播放与预览"
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
                  </svg>
                  <span>播放</span>
                </button>
                <a
                  href={`/api/files/download?path=${encodeURIComponent(item.path)}`}
                  download
                  className="col-span-1 text-center py-1.5 bg-gray-800 hover:bg-gray-700 text-xs text-gray-200 rounded-lg border border-gray-700 transition font-medium"
                >
                  下载
                </a>
                <button
                  onClick={() => handleSendToTg(item.path)}
                  className="col-span-1 py-1.5 bg-cyan-950/60 hover:bg-cyan-900/60 text-xs text-cyan-300 rounded-lg border border-cyan-500/30 transition font-medium"
                  title="推送到 Telegram"
                >
                  TG推送
                </button>
                <button
                  onClick={() => handleDelete(item)}
                  className="col-span-1 py-1.5 bg-rose-950/30 hover:bg-rose-950/60 text-xs text-rose-300 rounded-lg border border-rose-500/30 transition font-medium"
                  title="删除物理素材"
                >
                  删除
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <MediaPlayerModal item={playerItem} onClose={() => setPlayerItem(null)} />
      <UploadMediaModal isOpen={uploadOpen} onClose={() => setUploadOpen(false)} onSuccess={loadData} />
    </div>
  );
};
