import { FunctionalComponent } from 'preact';
import { useState } from 'preact/hooks';
import { Handle, Position } from '@xyflow/react';
import { NodeL0Data } from './types';

interface Props {
  data: NodeL0Data;
}

export const NodeL0Ingest: FunctionalComponent<Props> = ({ data }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isVertical = data.ratio === '9:16';
  const fileList = data.files || [];
  const fileCount = fileList.length;
  const currentPreview = data.selectedFile || fileList[0];

  const getMediaUrl = (filePath?: string) => {
    if (!filePath) return '';
    const fileName = filePath.split('/').pop() || '';
    if (filePath.includes('/library')) {
      return `/media/library/${encodeURIComponent(fileName)}`;
    }
    if (filePath.includes('/outputs')) {
      return `/media/outputs/${encodeURIComponent(fileName)}`;
    }
    return `/api/files/download?path=${encodeURIComponent(filePath)}`;
  };

  const previewUrl = getMediaUrl(currentPreview);
  const fileNameShort = currentPreview?.split('/').pop() || '';

  return (
    <div
      className={`bg-[#0f172a]/95 border-2 border-cyan-500/50 rounded-xl p-4 shadow-xl shadow-cyan-950/40 text-gray-200 space-y-3 transition-all duration-200 ${
        isExpanded ? 'w-96' : 'w-88'
      }`}
    >
      <div className="flex items-center justify-between pb-2 border-b border-gray-800 cursor-grab active:cursor-grabbing select-none">
        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 text-xs font-bold bg-cyan-500/20 text-cyan-300 rounded border border-cyan-500/30">
            L0
          </span>
          <span className="font-bold text-sm text-gray-100">素材池与原片预览</span>
        </div>
        <span className="text-[10px] text-cyan-400 font-mono">
          {isVertical ? '9:16 竖屏' : '16:9 横屏'}
        </span>
      </div>

      {/* 原片实时播放窗口 (严格契合横竖屏真实长方形比例) */}
      <div className="bg-black/90 rounded-lg border border-gray-800 overflow-hidden flex flex-col items-center justify-center p-2 relative">
        {previewUrl ? (
          <div className="w-full flex flex-col items-center justify-center space-y-1.5">
            <div className="flex items-center justify-between w-full px-0.5 text-[10px] text-gray-400">
              <span className="truncate max-w-[140px] font-mono" title={fileNameShort}>
                {fileNameShort}
              </span>
              <div className="flex items-center space-x-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="nodrag cursor-pointer px-1.5 py-0.5 bg-gray-800 hover:bg-gray-700 text-cyan-300 rounded text-[10px] border border-gray-700 transition"
                  title={isExpanded ? '收起紧凑视图' : '原地放大视窗'}
                >
                  {isExpanded ? '收起' : '放大'}
                </button>
                <button
                  type="button"
                  onClick={() => data.onOpenPreview?.(previewUrl, `[原片] ${fileNameShort}`)}
                  className="nodrag cursor-pointer px-1.5 py-0.5 bg-cyan-950/80 hover:bg-cyan-850 text-cyan-200 rounded text-[10px] border border-cyan-600/50 transition font-bold"
                  title="打开大画幅高清监视台 (双击画面也可打开)"
                >
                  大屏浏览
                </button>
              </div>
            </div>

            {/* 核心播放视窗 */}
            <div
              className={`transition-all duration-200 flex items-center justify-center bg-black rounded-lg border border-gray-800 overflow-hidden ${
                isVertical
                  ? isExpanded
                    ? 'w-48 aspect-[9/16]'
                    : 'w-32 aspect-[9/16]'
                  : isExpanded
                  ? 'w-full aspect-[16/9]'
                  : 'w-full aspect-[16/9]'
              }`}
            >
              <video
                src={previewUrl}
                controls
                playsInline
                onDblClick={() => data.onOpenPreview?.(previewUrl, `[原片] ${fileNameShort}`)}
                className="w-full h-full object-contain bg-black nodrag cursor-pointer"
                title="双击进入大屏浏览"
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-500 text-xs font-mono py-8 h-32">
            <span>暂无可播放的原片</span>
            <span className="text-[10px] text-gray-600 mt-1">添加素材后在此直接点播</span>
          </div>
        )}
      </div>

      {/* 画幅选择 */}
      <div className="space-y-1 text-xs nodrag">
        <label className="text-gray-400 block text-[11px]">画幅方向</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => data.onUpdate?.({ ratio: '9:16' })}
            className={`nodrag cursor-pointer select-none py-1 px-2 rounded font-semibold border text-center transition text-xs ${
              isVertical
                ? 'bg-cyan-600/30 text-cyan-300 border-cyan-400'
                : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'
            }`}
          >
            9:16 (竖屏短视频)
          </button>
          <button
            type="button"
            onClick={() => data.onUpdate?.({ ratio: '16:9' })}
            className={`nodrag cursor-pointer select-none py-1 px-2 rounded font-semibold border text-center transition text-xs ${
              !isVertical
                ? 'bg-cyan-600/30 text-cyan-300 border-cyan-400'
                : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'
            }`}
          >
            16:9 (横屏长视频)
          </button>
        </div>
      </div>

      {/* 素材列表 */}
      <div className="space-y-1.5 text-xs nodrag">
        <div className="flex justify-between items-center text-gray-400">
          <span>待处理素材 ({fileCount})</span>
          <span className="text-gray-500 text-[10px]">点击切换播放</span>
        </div>

        <div className="bg-gray-900/90 border border-gray-800 rounded p-1.5 max-h-24 overflow-y-auto space-y-1 nodrag">
          {fileCount === 0 ? (
            <div className="text-gray-500 italic text-[11px] text-center py-2">
              暂无素材，请先添加
            </div>
          ) : (
            fileList.map((f, i) => {
              const isSelected = f === currentPreview;
              return (
                <div
                  key={i}
                  onClick={() => data.onSelectFile?.(f)}
                  className={`flex items-center justify-between text-[11px] px-2 py-1 rounded border cursor-pointer transition gap-1.5 nodrag ${
                    isSelected ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-200 font-bold' : 'bg-gray-950/80 border-gray-800 text-gray-300 hover:bg-gray-800/80'
                  }`}
                >
                  <span className="truncate font-mono flex-1" title={f}>
                    {i + 1}. {f.split('/').pop()}
                  </span>
                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); data.onRotateFile?.(i, 90); }}
                      className="nodrag cursor-pointer px-1 py-0.5 bg-gray-800 hover:bg-gray-700 text-cyan-300 rounded text-[10px]"
                      title="画面顺时针转90度"
                    >
                      旋90°
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); data.onRotateFile?.(i, 180); }}
                      className="nodrag cursor-pointer px-1 py-0.5 bg-gray-800 hover:bg-gray-700 text-amber-300 rounded text-[10px]"
                      title="画面翻转180度"
                    >
                      翻180°
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); data.onRemoveFile?.(i); }}
                      className="nodrag cursor-pointer text-red-400 hover:text-red-300 px-1 rounded text-xs font-bold font-mono"
                      title="移除"
                    >
                      X
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            if (data.onAddFiles) data.onAddFiles();
            else if (data.onOpenMediaPicker) data.onOpenMediaPicker();
          }}
          className="nodrag cursor-pointer select-none w-full py-2 px-2.5 bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-200 border border-cyan-500/40 rounded-lg text-xs font-bold transition text-center shadow-md flex items-center justify-center space-x-1.5 active:scale-[0.98]"
        >
          <span>＋ 添加素材 (多选/局域网/外网)</span>
        </button>
      </div>

      {/* 核心流转按钮 */}
      <div className="pt-2 border-t border-gray-800 nodrag">
        <button
          type="button"
          onClick={() => {
            if (data.onGenerateL1) data.onGenerateL1();
            else if (data.onStartWash) data.onStartWash();
          }}
          disabled={fileCount === 0}
          className="nodrag cursor-pointer select-none w-full py-2.5 px-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-gray-800 disabled:to-gray-800 disabled:text-gray-500 text-white rounded-lg font-bold text-xs transition shadow-lg shadow-cyan-950 flex items-center justify-center space-x-1.5 active:scale-[0.98]"
        >
          <span>锁定素材并生成 L1 粗洗 →</span>
        </button>
      </div>

      <Handle type="source" position={Position.Right} className="!bg-cyan-400 !w-3 !h-3" />
    </div>
  );
};
