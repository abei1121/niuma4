import { FunctionalComponent } from 'preact';
import { MediaItem } from '../api/video';

interface MediaPlayerModalProps {
  item: MediaItem | null;
  onClose: () => void;
}

export const MediaPlayerModal: FunctionalComponent<MediaPlayerModalProps> = ({ item, onClose }) => {
  if (!item) return null;

  const streamUrl = `/api/files/stream?path=${encodeURIComponent(item.path)}`;
  const ext = item.name.split('.').pop()?.toLowerCase() || '';

  const isVideo = ['mp4', 'mov', 'webm', 'mkv', 'avi', 'flv', 'm4v'].includes(ext);
  const isAudio = ['mp3', 'wav', 'aac', 'm4a', 'flac', 'ogg'].includes(ext);
  const isImage = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(ext);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0f172a] border border-gray-700 rounded-2xl max-w-4xl w-full p-5 space-y-4 shadow-2xl flex flex-col max-h-[92vh]"
      >
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <span
              className={`px-2 py-0.5 text-xs font-semibold rounded shrink-0 ${
                item.category === '成品'
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                  : 'bg-blue-950/80 text-blue-300 border border-blue-500/30'
              }`}
            >
              {item.category}
            </span>
            <h3 className="text-sm font-bold text-gray-100 truncate">{item.name}</h3>
            <span className="text-xs font-mono text-gray-400 shrink-0">({item.size_mb})</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-base px-2 py-1 rounded transition"
          >
            &times;
          </button>
        </div>

        <div className="flex-1 min-h-0 bg-black/90 rounded-xl overflow-hidden flex items-center justify-center border border-gray-800 relative">
          {isVideo && (
            <video
              src={streamUrl}
              controls
              autoPlay
              className="max-h-[65vh] w-auto max-w-full rounded-lg object-contain focus:outline-none"
            >
              您的浏览器暂不支持此视频格式直接播放，可使用下方按钮下载。
            </video>
          )}

          {isAudio && (
            <div className="p-8 w-full max-w-md space-y-4 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <div className="text-sm font-medium text-gray-200 truncate">{item.name}</div>
              <audio src={streamUrl} controls autoPlay className="w-full focus:outline-none" />
            </div>
          )}

          {isImage && (
            <img
              src={streamUrl}
              alt={item.name}
              className="max-h-[65vh] w-auto max-w-full object-contain rounded-lg"
            />
          )}

          {!isVideo && !isAudio && !isImage && (
            <div className="p-8 text-center text-gray-400 space-y-2">
              <p className="text-sm">此文件类型 ({ext.toUpperCase() || '未知'}) 暂不支持在线流式预览</p>
              <p className="text-xs text-gray-500">建议点击下方「下载文件」或「推送到 TG」在本地播放</p>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pt-1 border-t border-gray-800">
          <div className="text-gray-500 font-mono truncate max-w-md" title={item.path}>
            路径: {item.path}
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <a
              href={`/api/files/download?path=${encodeURIComponent(item.path)}`}
              download
              className="px-3.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg border border-gray-700 font-medium transition"
            >
              下载文件
            </a>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-semibold transition"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
