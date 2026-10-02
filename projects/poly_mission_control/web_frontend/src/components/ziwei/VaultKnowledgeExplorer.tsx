// web_frontend/src/components/ziwei/VaultKnowledgeExplorer.tsx - Private Vault & QA Simulator (<= 250 lines)
// Strictly <= 250 lines. Zero Emoji. Zero Star icons.

import { FunctionalComponent } from 'preact';
import { useState } from 'preact/hooks';
import { MatchedPattern } from './patternTypes';
import { VAULT_DOMAINS, DomainKey, detectDomainFromQuery } from './vaultDomainData';
import { ClassicalCorpusViewer } from './ClassicalCorpusViewer';

interface VaultKnowledgeExplorerProps {
  astrolabe: {
    patterns?: MatchedPattern[];
    raw?: any;
    birthYearStem?: string;
  };
}

const QUICK_TESTS: { label: string; text: string }[] = [
  { label: '命宮', text: '我這輩子最核心的天賦潛能與底層操作系統是什麼？' },
  { label: '兄弟', text: '當前現金流蓄水池如何？會因朋友借貸或同儕競爭破財嗎？' },
  { label: '夫妻', text: '下一任正緣桃花什麼時候出現，配偶自帶財庫嗎？' },
  { label: '子女', text: '未來子女的教育天分如何？適合做早期項目投資孵化嗎？' },
  { label: '財帛', text: '最適合我的變現商業模式是什麼？近期適合炒股博弈嗎？' },
  { label: '疾厄', text: '經常失眠焦慮，身體五行氣血有何隱蔽病灶需要預防？' },
  { label: '遷移', text: '今年適合換城市去異地或海外開拓新市場出海嗎？' },
  { label: '僕役', text: '準備和朋友合夥做項目，團隊協同與股權有何背刺暗礁？' },
  { label: '官祿', text: '2026年我適合辭職自立門戶開拓事業新局嗎？' },
  { label: '田宅', text: '近期適合重倉購置不動產嗎？家宅財庫防守有何暗礁？' },
  { label: '福德', text: '為什麼物質不缺但內心經常空虛內耗？精神歸宿在哪？' },
  { label: '父母', text: '遭遇商業合同爭議、資質審批或潛在官非，該如何合規化解？' },
];

export const VaultKnowledgeExplorer: FunctionalComponent<VaultKnowledgeExplorerProps> = ({ astrolabe }) => {
  const [question, setQuestion] = useState('2026年我適合辭職去創業開公司嗎？');
  const [activeDomain, setActiveDomain] = useState<'all' | DomainKey>('all');
  const [showCorpus, setShowCorpus] = useState(false);
  const [simResult, setSimResult] = useState<any>(null);

  const activePatterns = astrolabe.patterns || [];

  const handleSimulate = (qText: string) => {
    const rawQ = qText || question;
    const domainKey = detectDomainFromQuery(rawQ);
    const domainDef = domainKey ? VAULT_DOMAINS[domainKey] : null;

    const matchedPatterns = activePatterns.map(p => ({
      name: p.name,
      type: p.type,
      action: p.action,
    }));

    setSimResult({
      question: rawQ,
      domainKey,
      domainDef,
      matchedPatterns,
      isMissingDomain: !domainKey,
    });
  };

  return (
    <div className="space-y-6">
      {/* 頂部交互式叩問模擬與證據鏈診斷器 */}
      <div className="bg-[#0b101b] border border-cyan-900/40 p-5 rounded-2xl space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <span className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
            <h3 className="text-base font-bold text-cyan-200 tracking-wide">
              私有庫叩問證據鏈診斷與推演模擬器
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
              12宮正統全息強閉環
            </span>
          </div>
          <button
            onClick={() => setShowCorpus(!showCorpus)}
            className="px-3 py-1.5 rounded-lg text-xs font-mono border border-cyan-600/60 bg-cyan-950/80 hover:bg-cyan-900 text-cyan-200 transition"
          >
            {showCorpus ? '收起典籍母本' : '查閱明萬曆正統賦文真本 (太微/骨髓/形性)'}
          </button>
        </div>

        {/* 快捷示例提問 */}
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="text-gray-400 py-1 font-semibold">快速測試:</span>
          {QUICK_TESTS.map((t, idx) => (
            <button
              key={idx}
              onClick={() => { setQuestion(t.text); handleSimulate(t.text); }}
              className="px-2 py-1 rounded-lg bg-gray-900 border border-gray-800 text-gray-300 hover:text-cyan-300 hover:border-cyan-600 transition"
            >
              [{t.label}] {t.text.slice(0, 10)}...
            </button>
          ))}
        </div>

        {/* 輸入框與觸發按鈕 */}
        <div className="flex gap-2">
          <input
            type="text"
            value={question}
            onInput={(e: any) => setQuestion(e.target.value)}
            placeholder="輸入你要向造物主叩問的現實困惑..."
            className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-cyan-500"
          />
          <button
            onClick={() => handleSimulate(question)}
            className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs sm:text-sm transition flex items-center gap-1.5 shrink-0"
          >
            <span>模擬推演診斷</span>
          </button>
        </div>

        {/* 模擬推演結果診斷面板 */}
        {simResult && (
          <div className="p-4 rounded-xl border border-gray-800 bg-[#070b14] space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-gray-800">
              <span className="text-gray-300 font-bold">診斷結果透視:</span>
              {simResult.isMissingDomain ? (
                <span className="px-2.5 py-0.5 rounded bg-amber-950/80 border border-amber-500 text-amber-300 font-mono">
                  未命中特定專題 (走通用推演)
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500 text-emerald-300 font-mono">
                  強證據鏈 100% 閉環
                </span>
              )}
            </div>

            {simResult.domainDef ? (
              <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-800/40 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-cyan-400 font-bold">命中私有庫專題: {simResult.domainDef.title}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-900/50 border border-cyan-700/50 text-cyan-200 font-mono">
                    文獻源: {simResult.domainDef.classicalSource}
                  </span>
                </div>
                <div className="text-gray-300 leading-relaxed text-[11px]">{simResult.domainDef.rules}</div>
                <div className="text-[10px] text-amber-300/90 pt-1 font-mono border-t border-cyan-900/30">
                  <strong>三方四正跨宮聯動: </strong>{simResult.domainDef.synergyCoords}
                  <div className="text-gray-400 mt-0.5">{simResult.domainDef.synergyRules}</div>
                </div>
              </div>
            ) : (
              <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-800/40 text-amber-200/90 text-[11px] leading-relaxed">
                <strong>說明: </strong>當前提問屬於泛用人生困惑，系統將結合全盤十二宮與四化動態執行通用高維推演。
              </div>
            )}

            {simResult.matchedPatterns.length > 0 && (
              <div className="p-2.5 rounded-lg bg-gray-900/60 border border-gray-800 space-y-1">
                <div className="text-amber-400 font-bold">本盤格局聯動斷訣:</div>
                {simResult.matchedPatterns.map((p: any, i: number) => (
                  <div key={i} className="text-gray-300 text-[11px]">
                    <strong className="text-amber-300">【{p.name}】: </strong>{p.action}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 正統經典賦文母本文庫展卷 */}
      {showCorpus && <ClassicalCorpusViewer onClose={() => setShowCorpus(false)} />}

      {/* 下方私有知識庫全息目錄 */}
      <div className="bg-[#0b101b] border border-gray-800 p-5 rounded-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-gray-200">私有典籍知識庫全景架構 (knowledge_vault.json v1.1.0)</h4>
            <p className="text-xs text-gray-400 mt-0.5">
              物理駐留在 182 服務端 <code className="text-cyan-300">/home/a/obs_membership_rust/data/</code>，34大正統格局 + 16大欽天公理 + 12宮正統全息典籍指南。
            </p>
          </div>
          <div className="flex flex-wrap rounded-lg overflow-hidden border border-gray-700 text-xs font-mono">
            <button
              onClick={() => setActiveDomain('all')}
              className={`px-3 py-1 ${activeDomain === 'all' ? 'bg-cyan-600 text-white font-bold' : 'bg-gray-800 text-gray-300'}`}
            >
              全部 (12)
            </button>
            {(Object.keys(VAULT_DOMAINS) as DomainKey[]).map((d) => (
              <button
                key={d}
                onClick={() => setActiveDomain(d)}
                className={`px-2.5 py-1 ${activeDomain === d ? 'bg-cyan-600 text-white font-bold' : 'bg-gray-800 text-gray-300'}`}
              >
                {VAULT_DOMAINS[d].title.slice(0, 2)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(VAULT_DOMAINS)
            .filter(([k]) => activeDomain === 'all' || activeDomain === k)
            .map(([k, v]) => (
              <div key={k} className="p-4 rounded-xl border border-gray-800 bg-[#070b14] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyan-300 text-sm">{v.title}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/50 text-cyan-300 font-mono">
                    {v.classicalSource}
                  </span>
                </div>
                <div className="text-[11px] text-gray-400">
                  <strong className="text-gray-300">法定座標位: </strong>{v.coords}
                </div>
                <div className="text-[10px] text-amber-300/80 font-mono">
                  <strong>三方四正跨宮聯動: </strong>{v.synergyCoords}
                </div>
                <p className="text-gray-300 text-[11px] leading-relaxed p-2.5 rounded bg-black/40 border border-gray-800/80">
                  {v.rules}
                </p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
