import { FunctionalComponent } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import { AspectRatio } from './types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title: string;
  ratio: AspectRatio;
}

export const StudioMasterViewer: FunctionalComponent<Props> = ({
  isOpen,
  onClose,
  videoUrl,
  title,
  ratio,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !videoUrl) return null;

  const isVertical = ratio === '9:16';

  const handleFullScreen = () => {
    if (videoRef.current?.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 transition-all animate-fade-in"
      onClick={onClose}
    >
      {/* 
        外框尺寸根据视频画幅严格计算:
        竖屏 9:16: 高度 82vh, 宽度按 9/16 计算 (约 46vh / ~460px), 呈修长立体手机视窗
        横屏 16:9: 宽度 82vw (max-w-5xl), 高度按 16/9 计算, 呈影院宽银幕
        彻底根绝正方形与多余黑边!
      */}
      <div
        className={`relative flex flex-col bg-[#0b1120] border-2 ${
          isVertical ? 'border-cyan-500/60' : 'border-emerald-500/60'
        } rounded-3xl shadow-2xl overflow-hidden`}
        style={
          isVertical
            ? { height: '82vh', width: 'calc(82vh * 9 / 16 + 4px)', maxWidth: '92vw' }
            : { width: '82vw', maxWidth: '1080px', height: 'auto', maxHeight: '88vh' }
        }
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部悬浮控制栏 */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-gray-900/95 border-b border-gray-800/80 shrink-0">
          <div className="flex items-center space-x-2 min-w-0">
            <span
              className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                isVertical ? 'bg-cyan-500/20 text-cyan-300' : 'bg-emerald-500/20 text-emerald-300'
              }`}
            >
              {isVertical ? '9:16 竖屏大画幅' : '16:9 横屏影院级'}
            </span>
            <span className="text-xs font-semibold text-gray-100 truncate max-w-[200px]" title={title}>
              {title || '高清监视'}
            </span>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleFullScreen}
              className="px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-cyan-300 rounded border border-gray-700 transition"
              title="切换系统物理全屏"
            >
              全屏
            </button>
            <button
              onClick={onClose}
              className="px-2 py-1 text-xs bg-gray-800 hover:bg-red-900/60 hover:text-red-300 text-gray-400 rounded border border-gray-700 font-bold transition"
              title="关闭大屏监看 (Esc)"
            >
              关闭 (Esc)
            </button>
          </div>
        </div>

        {/* 核心大画幅播放视窗 (100% 紧密贴合长方形比例) */}
        <div
          className={`relative bg-black flex items-center justify-center overflow-hidden ${
            isVertical ? 'flex-1 w-full' : 'w-full aspect-[16/9]'
          }`}
        >
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            autoPlay
            playsInline
            className="w-full h-full object-contain bg-black"
          />
        </div>

        {/* 底部信息与快捷键指南 */}
        <div className="px-4 py-2 bg-gray-950/95 border-t border-gray-800/80 flex items-center justify-between text-[11px] text-gray-400 font-mono shrink-0">
          <span className="truncate max-w-[280px]">高保真大屏监看</span>
          <span className="text-gray-500 shrink-0">空格暂停 / 方向键快进 / Esc退出</span>
        </div>
      </div>
    </div>
  );
};
