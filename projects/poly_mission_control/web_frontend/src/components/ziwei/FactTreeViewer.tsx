// web_frontend/src/components/ziwei/FactTreeViewer.tsx - 3-School Astrolabe Fact Tree Inspector (<= 250 lines)
import { FunctionalComponent } from 'preact';
import { useState } from 'preact/hooks';

interface FactTreeViewerProps {
  astrolabe: {
    zhongzhouTree: string;
    qintianTree: string;
    unifiedTree: string;
  };
}

export const FactTreeViewer: FunctionalComponent<FactTreeViewerProps> = ({ astrolabe }) => {
  const [activeSchool, setActiveSchool] = useState<'zhongzhou' | 'qintian' | 'unified'>('zhongzhou');
  const [copied, setCopied] = useState(false);

  const getTreeContent = () => {
    switch (activeSchool) {
      case 'zhongzhou':
        return astrolabe.zhongzhouTree;
      case 'qintian':
        return astrolabe.qintianTree;
      case 'unified':
        return astrolabe.unifiedTree;
    }
  };

  const currentTreeText = getTreeContent();

  const handleCopy = () => {
    navigator.clipboard.writeText(currentTreeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const schoolMeta = {
    zhongzhou: {
      name: '中州星系事实树',
      subtitle: '纯星系格局 · 四重叠宫 · 零自化干扰',
      badge: '中州正统',
      badgeColor: 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300',
      activeTabClass: 'border-emerald-400 text-emerald-300 bg-emerald-500/10',
      desc: '以十四主星本质、庙旺利陷、三方四正吉煞会照及四重叠宫为核心，严格剔除飞星自化箭头与来因宫，呈现最纯正的中州星系格局与时空起伏。',
      target: '适用于判定宏观人生底色、现实工作财务生活画面与八十年大限环境转换。',
    },
    qintian: {
      name: '钦天象数事实树',
      subtitle: '纯象数因果 · 来因定极 · 零杂曜神煞',
      badge: '钦天秘传',
      badgeColor: 'bg-amber-950/80 border-amber-500/40 text-amber-300',
      activeTabClass: 'border-amber-400 text-amber-300 bg-amber-500/10',
      desc: '以生年干四化、来因宫定极（内外宫归属）、离心/向心自化及宫干飞化为核心，严格剔除神煞与杂曜小星，呈现纯正象数因果定数与时空应期。',
      target: '适用于锁定极端转折大坎之年、爆发机缘引动、业力定数与得失质变。',
    },
    unified: {
      name: '双宗师融合事实树',
      subtitle: '钦天为骨 · 中州为肉 · 全景无损总账',
      badge: '双宗师全景',
      badgeColor: 'bg-indigo-950/80 border-indigo-500/40 text-indigo-300',
      activeTabClass: 'border-indigo-400 text-indigo-300 bg-indigo-500/10',
      desc: '钦天象数定其性（因果定数+自化动静），中州星系断其形（主星庙旺+神煞叠宫），两派精粹全息无损融合，为大模型提供最全面的推演基座。',
      target: '适用于全场景全息推演、复杂命运答疑与综合命理剧本深层解构。',
    },
  };

  const meta = schoolMeta[activeSchool];

  return (
    <div className="bg-[#0b101b] border border-gray-800 p-4 rounded-xl space-y-3">
      {/* 顶部流派切换器 */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-800">
        <div>
          <h4 className="font-bold text-gray-200 text-sm flex items-center gap-2">
            <span>命盘事实树透视检视器 (Astrolabe Fact Tree Ledger)</span>
            <span className={`text-[10px] px-2 py-0.5 rounded font-mono border ${meta.badgeColor}`}>
              {meta.badge}
            </span>
          </h4>
          <p className="text-xs text-gray-400 mt-0.5">
            严格按照所选宗师法门物理隔离生成，大模型以此纯代码事实作为唯一确定性基座。
          </p>
        </div>

        {/* 复制与字符统计 */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-gray-400">
            字符数: <strong className="text-gray-200">{currentTreeText.length.toLocaleString()}</strong> 字
          </span>
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-mono transition border border-gray-700"
          >
            {copied ? '已复制到剪贴板！' : `复制${meta.name}`}
          </button>
        </div>
      </div>

      {/* 3 流派切换标签卡 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <button
          onClick={() => setActiveSchool('zhongzhou')}
          className={`p-2.5 rounded-lg text-left transition border ${
            activeSchool === 'zhongzhou'
              ? 'border-emerald-500/60 bg-emerald-950/40 text-emerald-200'
              : 'border-gray-800 bg-gray-900/50 text-gray-400 hover:text-gray-200'
          }`}
        >
          <div className="font-bold text-xs flex items-center justify-between">
            <span>中州星系事实树</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-900/60 text-emerald-300">纯星系</span>
          </div>
          <div className="text-[11px] text-gray-400 mt-1 truncate">
            三方四正 · 四重叠宫 · 零自化
          </div>
        </button>

        <button
          onClick={() => setActiveSchool('qintian')}
          className={`p-2.5 rounded-lg text-left transition border ${
            activeSchool === 'qintian'
              ? 'border-amber-500/60 bg-amber-950/40 text-amber-200'
              : 'border-gray-800 bg-gray-900/50 text-gray-400 hover:text-gray-200'
          }`}
        >
          <div className="font-bold text-xs flex items-center justify-between">
            <span>钦天象数事实树</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-900/60 text-amber-300">纯因果</span>
          </div>
          <div className="text-[11px] text-gray-400 mt-1 truncate">
            来因定锚 · 生年四化 · 零杂曜
          </div>
        </button>

        <button
          onClick={() => setActiveSchool('unified')}
          className={`p-2.5 rounded-lg text-left transition border ${
            activeSchool === 'unified'
              ? 'border-indigo-500/60 bg-indigo-950/40 text-indigo-200'
              : 'border-gray-800 bg-gray-900/50 text-gray-400 hover:text-gray-200'
          }`}
        >
          <div className="font-bold text-xs flex items-center justify-between">
            <span>双宗师融合事实树</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-900/60 text-indigo-300">全景融合</span>
          </div>
          <div className="text-[11px] text-gray-400 mt-1 truncate">
            钦天为骨 · 中州为肉 · 全息总账
          </div>
        </button>
      </div>

      {/* 流派说明横幅 */}
      <div className="bg-gray-900/60 border border-gray-800/80 p-3 rounded-lg text-xs space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-200">{meta.name}</span>
          <span className="text-gray-400 font-mono text-[11px]">({meta.subtitle})</span>
        </div>
        <p className="text-gray-400 leading-relaxed">{meta.desc}</p>
        <p className="text-amber-400/90 font-medium text-[11px]">推荐场景: {meta.target}</p>
      </div>

      {/* 纯 ASCII 事实树代码区 */}
      <div className="bg-black/90 rounded-lg p-3 max-h-[460px] overflow-y-auto font-mono text-xs text-emerald-400/90 leading-relaxed whitespace-pre-wrap select-all border border-gray-900 shadow-inner">
        {currentTreeText}
      </div>
    </div>
  );
};
