import { FunctionalComponent } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { GeminiAccount } from '../types/system';
import {
  getGeminiAccounts,
  switchGeminiAccount,
  unblockGeminiAccount,
  unblockAllGeminiAccounts,
  updateGeminiAccountName,
  removeGeminiAccount,
} from '../api/system';
import { AddAccountModal } from './AddAccountModal';

export const TabGeminiAccounts: FunctionalComponent = () => {
  const [accounts, setAccounts] = useState<GeminiAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getGeminiAccounts();
      setAccounts(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEditName = async (acc: GeminiAccount) => {
    const newName = window.prompt(
      `请输入账号 [${acc.id.toUpperCase()}] 的新备注名称:`,
      acc.name || ''
    );
    if (newName === null || newName.trim() === '') return;
    try {
      const res = await updateGeminiAccountName(acc.id, newName.trim());
      if (res && res.success) {
        loadData();
      } else {
        alert(`修改备注失败: ${res?.error || '未知错误'}`);
      }
    } catch (e) {
      alert(`网络请求异常: ${e}`);
    }
  };

  const handleRemove = async (acc: GeminiAccount) => {
    if (!window.confirm(`确定要从大模型轮换池中移除账号 [${acc.id.toUpperCase()}] 吗？`)) {
      return;
    }
    try {
      const res = await removeGeminiAccount(acc.id);
      if (res && res.success) {
        loadData();
      } else {
        alert(`移除失败: ${res?.error || '未知错误'}`);
      }
    } catch (e) {
      alert(`网络请求异常: ${e}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" />
            <h3 className="text-sm font-bold text-gray-100">大模型矩阵轮换与动态冷却池</h3>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            多账号隔离环境 • 智能降温与故障轮换 • 账号全生命周期管理
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={() => setModalOpen(true)}
            className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-purple-950/40 transition flex items-center space-x-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>+ 添加新账号</span>
          </button>
          <button
            onClick={async () => {
              await unblockAllGeminiAccounts();
              loadData();
            }}
            className="px-3 py-1.5 bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-medium transition flex items-center space-x-1"
          >
            <span>强制解除全部冷却</span>
          </button>
          <button
            onClick={loadData}
            disabled={loading}
            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs font-medium transition"
          >
            {loading ? '查询中...' : '刷新状态'}
          </button>
        </div>
      </div>

      <div className="bg-[#0f172a] border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-gray-900/80 text-gray-400 border-b border-gray-800">
            <tr>
              <th className="px-6 py-3">账号标识</th>
              <th className="px-4 py-3">账号别名 / 邮箱</th>
              <th className="px-4 py-3">运行状态</th>
              <th className="px-4 py-3">冷却降温详情</th>
              <th className="px-6 py-3 text-right">管理操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/80">
            {loading && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                  正在查询大模型账号矩阵与冷却状态...
                </td>
              </tr>
            )}
            {!loading && (accounts || []).length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  暂无登记的大模型账号，点击右上角「+ 添加新账号」进行录入
                </td>
              </tr>
            )}
            {!loading &&
              (accounts || []).map((acc) => (
                <tr key={acc.id} className="hover:bg-gray-800/40 transition">
                  <td className="px-6 py-3 font-semibold text-gray-200">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono">{acc.id}</span>
                      {acc.is_active && (
                        <span className="px-1.5 py-0.5 text-[9px] uppercase tracking-wider rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold">
                          主号
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-sans text-gray-300">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-200">{acc.name || '未命名账号'}</span>
                      <button
                        onClick={() => handleEditName(acc)}
                        className="text-gray-500 hover:text-purple-400 text-[10px] transition"
                        title="修改备注名"
                      >
                        [编辑]
                      </button>
                    </div>
                    <div className="text-[11px] text-gray-500 font-mono">{acc.email || '未获取到邮箱'}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        acc.is_active
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                          : acc.is_cooling
                          ? 'bg-amber-950/80 text-amber-400 border border-amber-500/30'
                          : 'bg-gray-800/80 text-gray-400 border border-gray-700/50'
                      }`}
                    >
                      {acc.is_active ? '当前活跃主号' : acc.is_cooling ? '冷却降温中' : '候命中 (空闲就绪)'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-[11px]">
                    {acc.cooldown_status_text || '就绪'}
                  </td>
                  <td className="px-6 py-3 text-right space-x-2">
                    {!acc.is_active && (
                      <button
                        onClick={async () => {
                          await switchGeminiAccount(acc.id);
                          loadData();
                        }}
                        className="px-2.5 py-1 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 rounded text-[11px] transition"
                      >
                        设为主号
                      </button>
                    )}
                    {acc.is_cooling && (
                      <button
                        onClick={async () => {
                          await unblockGeminiAccount(acc.id);
                          loadData();
                        }}
                        className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 rounded text-[11px] transition"
                      >
                        单号解封
                      </button>
                    )}
                    {!acc.is_active && accounts.length > 1 && (
                      <button
                        onClick={() => handleRemove(acc)}
                        className="px-2 py-1 text-gray-500 hover:text-rose-400 hover:bg-rose-950/30 rounded text-[11px] transition"
                        title="从轮换池移除"
                      >
                        移除
                      </button>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <AddAccountModal
        isOpen={modalOpen}
        existingAccounts={accounts}
        onClose={() => setModalOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
};
