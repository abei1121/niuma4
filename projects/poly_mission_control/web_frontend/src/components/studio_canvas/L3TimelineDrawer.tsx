import { FunctionalComponent } from 'preact';
import { useState } from 'preact/hooks';
import { TrackItem, AspectRatio } from './types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  items: TrackItem[];
  ratio: AspectRatio;
  onUpdateItems: (items: TrackItem[]) => void;
  onSavePreference: () => void;
}

export const L3TimelineDrawer: FunctionalComponent<Props> = ({
  isOpen,
  onClose,
  items,
  ratio,
  onUpdateItems,
  onSavePreference,
}) => {
  if (!isOpen) return null;

  const [selectedId, setSelectedId] = useState<string | null>(items[0]?.id || null);
  const selectedItem = items.find((i) => i.id === selectedId);
  const isVertical = ratio === '9:16';

  const tracks: { type: TrackItem['trackType']; label: string; bg: string }[] = [
    { type: 'video', label: '画面', bg: 'bg-blue-900/30' },
    { type: 'subtitle', label: '花字', bg: 'bg-cyan-900/30' },
    { type: 'audio', label: '音效', bg: 'bg-emerald-900/30' },
    { type: 'effect', label: '动效', bg: 'bg-amber-900/30' },
    { type: 'ai_gen', label: '插图/音色', bg: 'bg-purple-900/30' },
  ];

  const handleDelete = (id: string) => {
    onUpdateItems(items.filter((i) => i.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col justify-end">
      <div className="bg-[#0b101b] border-t border-gray-700 w-full h-[85vh] flex flex-col rounded-t-2xl shadow-2xl overflow-hidden">
        {/* 抽屉顶部栏 */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-800 bg-gray-900/80">
          <div className="flex items-center space-x-3">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
            <h2 className="text-base font-bold text-gray-100">
              L3 剪映式多轨精修工作台 <span className="text-xs font-normal text-gray-400">(手工微调与网感审校)</span>
            </h2>
            <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
              画幅: {ratio}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onSavePreference}
              className="px-3 py-1.5 bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-bold transition flex items-center space-x-1"
            >
              <span>沉淀精修习惯 (越用越懂我)</span>
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs font-bold transition"
            >
              返回画布
            </button>
          </div>
        </div>

        {/* 中间区：预览器 + 属性检查器 */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 min-h-0 overflow-y-auto">
          {/* 模拟播放器 */}
          <div className="md:col-span-2 flex items-center justify-center bg-black/80 rounded-xl border border-gray-800 p-2 relative">
            <div
              className={`bg-gray-950 border border-gray-700 rounded-lg flex flex-col items-center justify-center relative overflow-hidden shadow-2xl ${
                isVertical ? 'w-56 h-96' : 'w-full max-w-lg h-72'
              }`}
            >
              <div className="text-gray-500 font-mono text-xs">实时自适应预览窗口</div>
              <div className="absolute top-2 left-2 text-[10px] text-gray-400 font-mono">
                {isVertical ? '9:16 短视频' : '16:9 宽画幅'}
              </div>
              {selectedItem && (
                <div className="absolute bottom-6 px-3 py-1 bg-black/75 rounded text-cyan-300 text-xs font-bold border border-cyan-500/40">
                  {selectedItem.name}
                </div>
              )}
            </div>
          </div>

          {/* 选中的片段属性微调 */}
          <div className="bg-gray-900/90 border border-gray-800 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-gray-200 border-b border-gray-800 pb-2 mb-3">
                选中轨道元素属性微调
              </div>
              {selectedItem ? (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-gray-400 block mb-1">元素名称/文案</label>
                    <input
                      type="text"
                      value={selectedItem.name}
                      onInput={(e: any) => {
                        const val = e.target.value;
                        onUpdateItems(items.map((i) => (i.id === selectedItem.id ? { ...i, name: val } : i)));
                      }}
                      className="w-full bg-gray-950 border border-gray-700 rounded px-2.5 py-1.5 text-gray-100"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-gray-400 block mb-1">起始秒</label>
                      <input
                        type="number"
                        step="0.1"
                        value={selectedItem.startSec}
                        onInput={(e: any) => {
                          const val = Number(e.target.value);
                          onUpdateItems(items.map((i) => (i.id === selectedItem.id ? { ...i, startSec: val } : i)));
                        }}
                        className="w-full bg-gray-950 border border-gray-700 rounded px-2 py-1.5 text-gray-100"
                      />
                    </div>
                    <div>
                      <label className="text-gray-400 block mb-1">结束秒</label>
                      <input
                        type="number"
                        step="0.1"
                        value={selectedItem.endSec}
                        onInput={(e: any) => {
                          const val = Number(e.target.value);
                          onUpdateItems(items.map((i) => (i.id === selectedItem.id ? { ...i, endSec: val } : i)));
                        }}
                        className="w-full bg-gray-950 border border-gray-700 rounded px-2 py-1.5 text-gray-100"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1">细节标注 / 平台提示</label>
                    <div className="text-gray-300 bg-gray-950 p-2 rounded border border-gray-800 text-[11px]">
                      {selectedItem.detail || '大模型生成的爆款卡点项'}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(selectedItem.id)}
                    className="w-full py-1.5 bg-red-900/40 hover:bg-red-800/50 text-red-300 border border-red-500/40 rounded text-xs font-bold transition"
                  >
                    删除此轨道元素
                  </button>
                </div>
              ) : (
                <div className="text-gray-500 text-xs italic text-center py-8">
                  在下方多轨道中点击任意片段进行手工微调
                </div>
              )}
            </div>

            <div className="text-[11px] text-gray-500 border-t border-gray-800 pt-2 font-mono">
              Tip: 精修时所做的删改，将自动成为牛马4号的学习语料。
            </div>
          </div>
        </div>

        {/* 下部：剪映式多轨道时间线 */}
        <div className="h-44 bg-gray-950 border-t border-gray-800 p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] text-gray-400 pb-1 border-b border-gray-800/60 font-mono">
            <span>00:00 (开始)</span>
            <span>00:15 (黄金转折)</span>
            <span>00:30 (高潮留白)</span>
            <span>00:45 (收束转化)</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 pt-1">
            {tracks.map((track) => {
              const trackItems = items.filter((i) => i.trackType === track.type);
              return (
                <div key={track.type} className="flex items-center space-x-2 h-6">
                  <span className="w-20 text-[11px] font-bold text-gray-400 truncate">{track.label}</span>
                  <div className={`flex-1 h-full ${track.bg} border border-gray-800/80 rounded relative flex items-center px-1 overflow-hidden`}>
                    {trackItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setSelectedId(item.id)}
                        className={`h-4 text-[10px] font-bold px-2 rounded truncate transition shadow mr-1 ${
                          selectedId === item.id ? 'ring-2 ring-white ' + item.color : item.color
                        }`}
                        style={{ minWidth: '4rem' }}
                      >
                        {item.name} ({item.startSec}s~{item.endSec}s)
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
