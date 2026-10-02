// web_frontend/src/components/ziwei/ClassicalCorpusViewer.tsx - Full-Text Classical Texts Viewer (<= 250 lines)
import { h, FunctionalComponent } from 'preact';
import { useState, useMemo } from 'preact/hooks';
import { CLASSICAL_CORPUS, ClassicalText } from './classicalCorpusData';

interface ClassicalCorpusViewerProps {
  onClose?: () => void;
}

export const ClassicalCorpusViewer: FunctionalComponent<ClassicalCorpusViewerProps> = ({ onClose }) => {
  const [selectedTextId, setSelectedTextId] = useState<string>('gushui');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const currentText: ClassicalText = useMemo(() => {
    return CLASSICAL_CORPUS[selectedTextId] || CLASSICAL_CORPUS['gushui'];
  }, [selectedTextId]);

  const filteredVerses = useMemo(() => {
    if (!searchQuery.trim()) return currentText.verses;
    const q = searchQuery.trim().toLowerCase();
    return currentText.verses.filter(v => v.text.toLowerCase().includes(q));
  }, [currentText, searchQuery]);

  return (
    <div className="bg-[#0b101b] border border-cyan-900/60 rounded-2xl p-5 space-y-4 text-xs shadow-2xl">
      {/* 头部元信息 */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-800 pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <h3 className="text-sm font-bold text-gray-100 font-serif tracking-wide">
              正统经典赋文母本文库 (明万历潘子贞本 / 中州派定本)
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 font-mono">
              全篇一字不易 · 零营销纯正典籍
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            本库为全栈系统「法医级命盘溯源协议」最高权威母本，杜绝任何地摊伪诗歌与营销套路。
          </p>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 transition"
          >
            收起文库
          </button>
        )}
      </div>

      {/* 典籍选择 Tab 与 搜索 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap rounded-lg overflow-hidden border border-gray-700 text-xs font-mono">
          {Object.values(CLASSICAL_CORPUS).map((text) => (
            <button
              key={text.id}
              onClick={() => { setSelectedTextId(text.id); setSearchQuery(''); }}
              className={`px-3 py-1.5 transition ${
                selectedTextId === text.id
                  ? 'bg-cyan-600 text-white font-bold shadow-md'
                  : 'bg-gray-800/80 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {text.title}
              <span className="ml-1 text-[10px] opacity-75 font-normal">({text.category})</span>
            </button>
          ))}
        </div>

        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="在赋文中检索关键字 (如: 禄马、日照、火贪)..."
            value={searchQuery}
            onInput={(e: any) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-700 text-gray-200 text-xs focus:border-cyan-500 focus:outline-none"
          />
        </div>
      </div>

      {/* 当前典籍提要卡片 */}
      <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800 flex flex-wrap items-center justify-between gap-2 text-[11px]">
        <div>
          <span className="font-bold text-cyan-300 mr-2">【{currentText.title}】</span>
          <span className="text-gray-300">{currentText.desc}</span>
        </div>
        <div className="text-gray-500 font-mono text-[10px]">
          校勘底本: <span className="text-gray-400">{currentText.edition}</span>
        </div>
      </div>

      {/* 赋文逐句正文展示区 */}
      <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
        {filteredVerses.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            赋文中未检索到包含 "{searchQuery}" 的句段。
          </div>
        ) : (
          filteredVerses.map((verse) => (
            <div
              key={verse.idx}
              className="p-2.5 rounded-lg bg-[#070b14] border border-gray-800/80 hover:border-cyan-800/60 transition flex items-start space-x-3 text-xs"
            >
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-800 text-cyan-400 font-bold shrink-0 mt-0.5">
                第 {verse.idx.toString().padStart(2, '0')} 句
              </span>
              <p className="text-gray-200 leading-relaxed font-serif tracking-wide selection:bg-cyan-900">
                {verse.text}
              </p>
            </div>
          ))
        )}
      </div>

      {/* 底部权威公理声明 */}
      <div className="pt-2 border-t border-gray-800/80 flex items-center justify-between text-[10px] text-gray-500 font-mono">
        <span>全本共收录 {currentText.verses.length} 句正统原文 · 明万历刻本定音</span>
        <span>严谨数理 · 杜绝营销 · 法医级对账</span>
      </div>
    </div>
  );
};
