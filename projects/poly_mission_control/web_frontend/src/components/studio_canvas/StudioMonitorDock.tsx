import { FunctionalComponent } from 'preact';
import { useState, useRef } from 'preact/hooks';
import { AspectRatio } from './types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title: string;
  ratio: AspectRatio;
}

export const StudioMonitorDock: FunctionalComponent<Props> = ({
  isOpen,
  onClose,
  videoUrl,
  title,
  ratio,
}) => {
  const [minimized, setMinimized] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  if (!isOpen || !videoUrl) return null;

  const isVertical = ratio === '9:16';

  return (
    <div
      className={`absolute bottom-4 right-4 z-40 bg-[#0b1120]/95 border-2 ${
        isVertical ? 'border-cyan-500/60' : 'border-emerald-500/60'
      } rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden transition-all duration-300 flex flex-col`}
      style={{
        width: minimized ? '260px' : isVertical ? '240px' : '420px',
      }}
    >
      <div className="flex items-center justify-between px-3 py-2 bg-gray-900/90 border-b border-gray-800 select-none">
        <div className="flex items-center space-x-1.5 min-w-0">
          <span
            className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
              isVertical ? 'bg-cyan-500/20 text-cyan-300' : 'bg-emerald-500/20 text-emerald-300'
            }`}
          >
            {isVertical ? '9:16 竖屏' : '16:9 横屏'}
          </span>
          <span className="text-xs font-semibold text-gray-200 truncate" title={title}>
            {title || '监视器'}
          </span>
        </div>
        <div className="flex items-center space-x-1 shrink-0 ml-1">
          <button
            onClick={() => setMinimized(!minimized)}
            className="px-1.5 py-0.5 text-[10px] bg-gray-800 hover:bg-gray-700 text-gray-300 rounded transition"
            title={minimized ? '展开监视器' : '最小化'}
          >
            {minimized ? '展开' : '折叠'}
          </button>
          <button
            onClick={onClose}
            className="px-1.5 py-0.5 text-[10px] bg-gray-800 hover:bg-red-900/60 hover:text-red-300 text-gray-400 rounded font-bold transition"
            title="关闭监看"
          >
            X
          </button>
        </div>
      </div>

      {!minimized && (
        <div
          className={`relative bg-black flex items-center justify-center overflow-hidden ${
            isVertical ? 'aspect-[9/16] w-full' : 'aspect-[16/9] w-full'
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
      )}

      {!minimized && (
        <div className="px-2.5 py-1 bg-gray-950/90 border-t border-gray-800/80 flex items-center justify-between text-[10px] text-gray-400 font-mono">
          <span className="truncate">非侵入式画布监视台</span>
          <span className="text-gray-500 shrink-0">自由调参无阻断</span>
        </div>
      )}
    </div>
  );
};
