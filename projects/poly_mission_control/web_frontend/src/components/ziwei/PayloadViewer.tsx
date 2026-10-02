// web_frontend/src/components/ziwei/PayloadViewer.tsx - Full LLM Payload & Prompt Inspector (<= 250 lines)
import { FunctionalComponent } from 'preact';
import { useState } from 'preact/hooks';
import {
  ZHONGZHOU_MASTER_PROMPT,
  QINTIAN_MASTER_PROMPT,
  UNIFIED_MASTER_PROMPT,
  CREATOR_QA_PROMPT,
} from './ziweiPrompts';

interface PayloadViewerProps {
  astrolabe: {
    zhongzhouTree: string;
    qintianTree: string;
    unifiedTree: string;
  };
}

export const PayloadViewer: FunctionalComponent<PayloadViewerProps> = ({ astrolabe }) => {
  const [activeSchool, setActiveSchool] = useState<'unified' | 'qintian' | 'zhongzhou' | 'qa'>('unified');
  const [viewMode, setViewMode] = useState<'payload' | 'prompt'>('payload');
  const [qaQuestion, setQaQuestion] = useState('请问我这一生在财富与事业上最大的风险在哪里？如何化解？');
  const [copied, setCopied] = useState(false);

  // 100% 还原 Rust 后端 (src/fortune.rs) 的 base_prompt 组装逻辑
  const getFullPayload = () => {
    if (activeSchool === 'qa') {
      return `${CREATOR_QA_PROMPT}\n\n【命盘与推演摘要】:\n${astrolabe.unifiedTree}\n\n【造物主叩问】:\n${qaQuestion}`;
    }
    if (activeSchool === 'zhongzhou') {
      return `${ZHONGZHOU_MASTER_PROMPT}\n\n【中州派命盘事实树数据】:\n${astrolabe.zhongzhouTree}`;
    }
    if (activeSchool === 'unified') {
      return `${UNIFIED_MASTER_PROMPT}\n\n【双宗师全景事实树数据】:\n${astrolabe.unifiedTree}`;
    }
    return `${QINTIAN_MASTER_PROMPT}\n\n【钦天门命盘事实树数据】:\n${astrolabe.qintianTree}`;
  };

  const getSystemPromptOnly = () => {
    if (activeSchool === 'qa') return CREATOR_QA_PROMPT;
    if (activeSchool === 'zhongzhou') return ZHONGZHOU_MASTER_PROMPT;
    if (activeSchool === 'unified') return UNIFIED_MASTER_PROMPT;
    return QINTIAN_MASTER_PROMPT;
  };

  const displayText = viewMode === 'payload' ? getFullPayload() : getSystemPromptOnly();

  const handleCopy = () => {
    navigator.clipboard.writeText(displayText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#0b101b] border border-gray-800 p-5 rounded-2xl space-y-4">
      {/* 顶部控制栏 */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-800">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-gray-900 p-1 rounded-xl border border-gray-800">
            <button
              onClick={() => setActiveSchool('unified')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeSchool === 'unified' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              双宗师全景法门
            </button>
            <button
              onClick={() => setActiveSchool('qintian')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeSchool === 'qintian' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              钦天门宗师法门
            </button>
            <button
              onClick={() => setActiveSchool('zhongzhou')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeSchool === 'zhongzhou' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              中州派宗师法门
            </button>
            <button
              onClick={() => setActiveSchool('qa')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeSchool === 'qa' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              造物主叩问答疑
            </button>
          </div>

          {/* 模式切换: 完整 Payload vs 仅核心 Prompt */}
          <div className="flex bg-gray-900 p-1 rounded-xl border border-gray-800 text-xs">
            <button
              onClick={() => setViewMode('payload')}
              className={`px-2.5 py-1 rounded-lg font-mono transition ${
                viewMode === 'payload' ? 'bg-gray-800 text-amber-300 font-bold' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              完整拼装 Payload (Prompt + 事实树)
            </button>
            <button
              onClick={() => setViewMode('prompt')}
              className={`px-2.5 py-1 rounded-lg font-mono transition ${
                viewMode === 'prompt' ? 'bg-gray-800 text-amber-300 font-bold' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              仅核心 Prompt 法门
            </button>
          </div>
        </div>

        {/* 复制与字数统计 */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-gray-400">
            {viewMode === 'payload' ? 'Payload 总字数: ' : 'Prompt 字数: '}
            <strong className="text-gray-200">{displayText.length.toLocaleString()}</strong> 字
          </span>
          <button
            onClick={handleCopy}
            className="px-3.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-mono transition border border-gray-700 shadow-sm"
          >
            {copied ? '已复制！' : viewMode === 'payload' ? '复制完整 Payload' : '复制核心 Prompt'}
          </button>
        </div>
      </div>

      {/* QA 叩问问题输入框 (仅在选择叩问答疑且处于 payload 模式时显示) */}
      {activeSchool === 'qa' && viewMode === 'payload' && (
        <div className="bg-gray-900/60 p-3 rounded-xl border border-gray-800 flex items-center gap-3 text-xs">
          <span className="text-sky-400 font-bold shrink-0">造物主叩问问题:</span>
          <input
            type="text"
            value={qaQuestion}
            onChange={(e: any) => setQaQuestion(e.target.value)}
            className="flex-1 bg-black/60 border border-gray-700 rounded-lg px-3 py-1.5 text-gray-200 focus:border-sky-500 outline-none"
            placeholder="输入想要模拟叩问的具体问题..."
          />
        </div>
      )}

      {/* 提示条说明 */}
      <div className="bg-gray-900/40 px-3 py-2 rounded-lg text-[11px] text-gray-400 flex items-center justify-between border border-gray-800/60">
        <span>
          {viewMode === 'payload'
            ? '⚡ 100% 严丝合缝对齐 Rust 后端 (src/fortune.rs: base_prompt) 传递给大模型的输入文本，可直接一键复制喂给 AI 测试。'
            : '🔒 固化在后端 Rust 二进制 (src/prompts.rs) 中的核心宗师提示词，全篇零表情符号、正统繁体术语。'}
        </span>
        <span className="text-emerald-400 font-mono text-[10px] shrink-0">与 Rust 后端同步一致</span>
      </div>

      {/* 代码显示区 */}
      <div className="bg-black/90 rounded-lg p-4 max-h-[520px] overflow-y-auto font-mono text-xs text-gray-300 leading-relaxed whitespace-pre-wrap border border-gray-900 select-all shadow-inner">
        {displayText}
      </div>
    </div>
  );
};
