import { FunctionalComponent } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { GeminiAccount } from '../types/system';
import { addGeminiAccount, startPkceOAuth, exchangePkceCode } from '../api/system';

interface AddAccountModalProps {
  isOpen: boolean;
  existingAccounts: GeminiAccount[];
  onClose: () => void;
  onSuccess: () => void;
}

export const AddAccountModal: FunctionalComponent<AddAccountModalProps> = ({
  isOpen,
  existingAccounts,
  onClose,
  onSuccess,
}) => {
  if (!isOpen) return null;

  const [accId, setAccId] = useState('');
  const [name, setName] = useState('');
  const [authUrl, setAuthUrl] = useState('');
  const [codeVerifier, setCodeVerifier] = useState('');
  const [stateToken, setStateToken] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pkce' | 'manual'>('pkce');
  const [manualToken, setManualToken] = useState('');

  const initPkce = async () => {
    setLoadingAuth(true);
    setError(null);
    try {
      const res = await startPkceOAuth();
      if (res && res.success && res.auth_url) {
        setAuthUrl(res.auth_url);
        setCodeVerifier(res.code_verifier);
        setStateToken(res.state);
      } else {
        setError('生成官方 PKCE 授权链接失败');
      }
    } catch (e: any) {
      setError(`初始化授权失败: ${e?.message || e}`);
    } finally {
      setLoadingAuth(false);
    }
  };

  useEffect(() => {
    const allIds = existingAccounts.map((a) => a.id);
    let nextNum = allIds.length + 1;
    while (allIds.includes(`acc${nextNum}`)) {
      nextNum++;
    }
    setAccId(`acc${nextNum}`);
    setName(`分身${nextNum}号`);
    setAuthCode('');
    setManualToken('');
    setError(null);
    initPkce();
  }, [isOpen]);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (!accId.trim()) {
      setError('请输入账号标识 (例如 acc4)');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (activeTab === 'pkce') {
        if (!authCode.trim()) {
          setError('请粘贴授权后跳转的地址栏完整链接或其中的 Code');
          setSubmitting(false);
          return;
        }
        const res = await exchangePkceCode({
          id: accId.trim(),
          name: name.trim() || undefined,
          code: authCode.trim(),
          code_verifier: codeVerifier || undefined,
          state: stateToken || undefined,
        } as any);
        if (res && res.success) {
          onSuccess();
          onClose();
        } else {
          setError(res?.error || 'Token 换票失败，请检查授权码是否超时或尝试重新生成链接');
        }
      } else {
        const res = await addGeminiAccount({
          id: accId.trim(),
          name: name.trim() || undefined,
          token_json: manualToken.trim() || undefined,
        });
        if (res && res.success) {
          onSuccess();
          onClose();
        } else {
          setError(res?.error || '添加账号失败');
        }
      }
    } catch (err: any) {
      setError(err?.message || '网络请求失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0f172a] border border-gray-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold text-xs">
              大模型矩阵
            </span>
            <h3 className="text-sm font-bold text-white">+ 添加新账号</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-base px-2 py-1 rounded"
          >
            &times;
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-300 text-xs break-all">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-300 font-semibold mb-1">账号标识</label>
              <input
                type="text"
                value={accId}
                onInput={(e) => setAccId((e.target as HTMLInputElement).value)}
                placeholder="例如: acc4"
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white font-mono focus:outline-none focus:border-purple-500"
              />
              <p className="text-[10px] text-gray-500 mt-1">存储于 /root/.gemini_accounts/ 独立环境</p>
            </div>
            <div>
              <label className="block text-gray-300 font-semibold mb-1">账号备注名</label>
              <input
                type="text"
                value={name}
                onInput={(e) => setName((e.target as HTMLInputElement).value)}
                placeholder="例如: 分身4号"
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
              />
              <p className="text-[10px] text-gray-500 mt-1">用于控制台与日志直观识别</p>
            </div>
          </div>

          <div className="flex border-b border-gray-800 space-x-4 pt-1">
            <button
              type="button"
              onClick={() => setActiveTab('pkce')}
              className={`pb-2 text-xs font-semibold transition border-b-2 ${
                activeTab === 'pkce'
                  ? 'border-purple-500 text-purple-300'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              Google 官方 PKCE 极速授权 (推荐)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('manual')}
              className={`pb-2 text-xs font-semibold transition border-b-2 ${
                activeTab === 'manual'
                  ? 'border-purple-500 text-purple-300'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              手动粘贴 Token 凭据
            </button>
          </div>

          {activeTab === 'pkce' ? (
            <div className="space-y-3">
              <div className="p-3 bg-purple-950/20 border border-purple-900/40 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-purple-300 font-bold">第一步：点击链接登录 Google 授权</span>
                  <button
                    type="button"
                    onClick={initPkce}
                    disabled={loadingAuth}
                    className="text-[11px] text-gray-400 hover:text-purple-300 underline"
                  >
                    {loadingAuth ? '生成中...' : '重新生成链接'}
                  </button>
                </div>
                <div className="break-all bg-gray-950/60 p-2 rounded-lg border border-purple-950">
                  {authUrl ? (
                    <a
                      href={authUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-purple-400 hover:text-purple-300 underline font-medium flex items-center space-x-1"
                    >
                      <span className="truncate">打开官方授权页 (已生成专属安全挑战)</span>
                      <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  ) : (
                    <span className="text-gray-500">正在生成官方授权凭据...</span>
                  )}
                </div>
                <p className="text-[11px] text-gray-400">
                  选择账号（例如 chenbeitong1121@gmail.com）并同意授权。
                </p>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">
                  第二步：粘贴跳转后的【浏览器地址栏整条链接】或【Code】
                </label>
                <input
                  type="text"
                  value={authCode}
                  onInput={(e) => setAuthCode((e.target as HTMLInputElement).value)}
                  placeholder="直接粘贴整个 https://antigravity.google/oauth-callback?code=... 地址或单个 Code"
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white font-mono focus:outline-none focus:border-purple-500 text-xs"
                />
                <p className="text-[10px] text-gray-500 mt-1">
                  提示：最稳妥的做法是直接复制地址栏的完整网址粘贴，系统会自动匹配安全挑战并走专线代理向 Google 换取 Token。
                </p>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-gray-300 font-semibold mb-1">
                Token JSON 或 refresh_token 字符串
              </label>
              <textarea
                value={manualToken}
                onInput={(e) => setManualToken((e.target as HTMLTextAreaElement).value)}
                placeholder='粘贴 antigravity-oauth-token 的 JSON 内容或 1//... 刷新 Token'
                className="w-full h-28 bg-gray-900 text-gray-200 font-mono text-xs p-3 rounded-lg border border-gray-700 focus:outline-none focus:border-purple-500 custom-scrollbar"
              />
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-2 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs font-semibold transition"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow transition flex items-center space-x-1"
            >
              {submitting ? (
                <>
                  <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1" />
                  <span>正在走代理换票入库...</span>
                </>
              ) : (
                <span>确认绑定并同步</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
