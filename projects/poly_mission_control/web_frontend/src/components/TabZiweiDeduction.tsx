import { FunctionalComponent } from 'preact';
import { useState, useMemo } from 'preact/hooks';
import { computeAstrolabeData, ProfileInput } from './ziwei/ziweiEngine';
import { FactTreeViewer } from './ziwei/FactTreeViewer';
import { SolarCalibrationCard } from './ziwei/SolarCalibrationCard';
import { PatternMatrixViewer } from './ziwei/PatternMatrixViewer';
import { VaultKnowledgeExplorer } from './ziwei/VaultKnowledgeExplorer';
import { PipelineFlowViewer } from './ziwei/PipelineFlowViewer';
import { DevHotReloadViewer } from './ziwei/DevHotReloadViewer';
import { PayloadViewer } from './ziwei/PayloadViewer';

export const TabZiweiDeduction: FunctionalComponent = () => {
  const [activeTab, setActiveTab] = useState<'facts' | 'patterns' | 'vault' | 'flow' | 'prompts' | 'dev'>('facts');
  const [profile, setProfile] = useState<ProfileInput>({
    birthDate: '1994-11-21',
    birthTime: '14:30',
    gender: '男',
    longitude: 114.17,
  });

  const astrolabe = useMemo(() => computeAstrolabeData(profile), [profile]);

  return (
    <div className="space-y-6">
      {/* 顶部主理人排盘控制台 */}
      <div className="bg-[#0f172a] border border-gray-800 p-5 rounded-2xl space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <span className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
            <h2 className="text-base font-bold text-gray-100 tracking-wide">
              紫微推演 · 数理事实总账本与大模型闭环透视台
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-amber-950/80 border border-amber-500/40 text-amber-300">
              LAN 局域网控制中枢
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setProfile({ birthDate: '1994-11-21', birthTime: '14:30', gender: '男', longitude: 114.17 })}
              className="px-3 py-1 rounded-lg text-xs bg-amber-950/80 border border-amber-500/60 text-amber-300 font-bold transition"
            >
              命主真身: 1994未时(男)
            </button>
            <button
              onClick={() => setProfile({ birthDate: '1995-10-24', birthTime: '08:15', gender: '女', longitude: 116.40 })}
              className="px-3 py-1 rounded-lg text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 transition"
            >
              案例二: 1995辰时(女)
            </button>
          </div>
        </div>

        {/* 输入参数栅格 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-gray-800/80 text-xs">
          <div>
            <label className="block text-gray-400 mb-1">公历出生日期</label>
            <input
              type="date"
              value={profile.birthDate}
              onChange={(e: any) => setProfile({ ...profile, birthDate: e.target.value })}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-gray-200"
            />
          </div>
          <div>
            <label className="block text-gray-400 mb-1">出生钟表时间</label>
            <input
              type="time"
              value={profile.birthTime}
              onChange={(e: any) => setProfile({ ...profile, birthTime: e.target.value })}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-gray-200"
            />
          </div>
          <div>
            <label className="block text-gray-400 mb-1">乾坤性别</label>
            <select
              value={profile.gender}
              onChange={(e: any) => setProfile({ ...profile, gender: e.target.value })}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-gray-200"
            >
              <option value="男">男命 (乾造)</option>
              <option value="女">女命 (坤造)</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-400 mb-1">出生地经度 (真太阳时)</label>
            <input
              type="number"
              step="0.01"
              value={profile.longitude}
              onChange={(e: any) => setProfile({ ...profile, longitude: parseFloat(e.target.value) || 120 })}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-gray-200"
            />
          </div>
        </div>
      </div>

      {/* 子视界导航 */}
      <div className="flex flex-wrap border-b border-gray-800 gap-y-2 space-x-2 text-sm font-medium">
        <button
          onClick={() => setActiveTab('facts')}
          className={`pb-3 px-3 transition border-b-2 flex items-center space-x-1.5 ${
            activeTab === 'facts'
              ? 'border-amber-400 text-amber-300 font-bold'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <span>推演排盘事实树 (三流派总账)</span>
        </button>
        <button
          onClick={() => setActiveTab('patterns')}
          className={`pb-3 px-3 transition border-b-2 flex items-center space-x-1.5 ${
            activeTab === 'patterns'
              ? 'border-emerald-400 text-emerald-300 font-bold'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <span>正统格局判定看板 ({astrolabe?.patterns?.length || 0})</span>
        </button>
        <button
          onClick={() => setActiveTab('vault')}
          className={`pb-3 px-3 transition border-b-2 flex items-center space-x-1.5 ${
            activeTab === 'vault'
              ? 'border-cyan-400 text-cyan-300 font-bold'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <span>私有典籍库与叩问透视</span>
        </button>
        <button
          onClick={() => setActiveTab('flow')}
          className={`pb-3 px-3 transition border-b-2 flex items-center space-x-1.5 ${
            activeTab === 'flow'
              ? 'border-blue-400 text-blue-300 font-bold'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <span>推演全流程链路</span>
        </button>
        <button
          onClick={() => setActiveTab('prompts')}
          className={`pb-3 px-3 transition border-b-2 flex items-center space-x-1.5 ${
            activeTab === 'prompts'
              ? 'border-purple-400 text-purple-300 font-bold'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <span>宗师提示词与 Payload</span>
        </button>
        <button
          onClick={() => setActiveTab('dev')}
          className={`pb-3 px-3 transition border-b-2 flex items-center space-x-1.5 ${
            activeTab === 'dev'
              ? 'border-gray-400 text-gray-200 font-bold'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <span>热加载与运维</span>
        </button>
      </div>

      {/* 视界 1: 排盘数据事实总账本 */}
      {activeTab === 'facts' && astrolabe && (
        <div className="space-y-4">
          <SolarCalibrationCard profile={profile} astrolabe={astrolabe} />
          <FactTreeViewer astrolabe={astrolabe} />
        </div>
      )}

      {/* 视界 2: 正统经典格局判定看板 */}
      {activeTab === 'patterns' && astrolabe && (
        <PatternMatrixViewer astrolabe={astrolabe} />
      )}

      {/* 视界 3: 私有典籍库与叩问透视模拟器 */}
      {activeTab === 'vault' && astrolabe && (
        <VaultKnowledgeExplorer astrolabe={astrolabe} />
      )}

      {/* 视界 4: 全流程链路 */}
      {activeTab === 'flow' && <PipelineFlowViewer />}

      {/* 视界 5: 宗师提示词与 Payload (100% 同步 Rust 后端拼接格式) */}
      {activeTab === 'prompts' && astrolabe && <PayloadViewer astrolabe={astrolabe} />}

      {/* 视界 6: 热加载与面板运维指南 */}
      {activeTab === 'dev' && <DevHotReloadViewer />}
    </div>
  );
};
