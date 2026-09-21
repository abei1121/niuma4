import { FunctionalComponent } from 'preact';
import { useState } from 'preact/hooks';
import { downloadRemoteVideos } from '../../api/video';

interface Props {
  onAdded: (paths: string[]) => void;
  onClose: () => void;
}

export const RemoteUrlTab: FunctionalComponent<Props> = ({ onAdded, onClose }) => {
  const [remoteUrlsText, setRemoteUrlsText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const handleDownloadRemote = async () => {
    const urls = remoteUrlsText.split('\n').map((u) => u.trim()).filter(Boolean);
    if (urls.length === 0) return;

    setIsProcessing(true);
    setStatusMsg(`正在从远端 (外网/局域网) 批量拉取 ${urls.length} 个视频...`);

    try {
      const res = await downloadRemoteVideos(urls);
      if (res.success && res.downloaded && res.downloaded.length > 0) {
        const paths = res.downloaded.map((d: any) => d.path);
        onAdded(paths);
        setStatusMsg(`成功拉取 ${paths.length} 条远端视频并探测正向！`);
        setTimeout(() => {
          setIsProcessing(false);
          onClose();
        }, 700);
      } else {
        setStatusMsg(`拉取失败: ${res.errors?.join('; ') || '目标链接不可访问'}`);
        setIsProcessing(false);
      }
    } catch (e) {
      setStatusMsg(`网络拉取异常: ${e}`);
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="text-xs text-gray-400">输入外网直链或局域网 NAS/手机共享的视频 URL (支持多行批量输入)：</div>
      <textarea
        rows={4}
        value={remoteUrlsText}
        onInput={(e: any) => setRemoteUrlsText(e.target.value)}
        placeholder={"http://192.168.1.50:5000/nas_video_01.mp4\nhttps://example.com/demo.mov"}
        className="w-full bg-gray-950 border border-gray-700 rounded-lg p-2.5 text-xs font-mono text-gray-100 focus:border-cyan-500"
      />
      <button
        onClick={handleDownloadRemote}
        disabled={isProcessing || !remoteUrlsText.trim()}
        className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-lg text-xs font-bold transition"
      >
        从远端并发拉取视频到素材库
      </button>
      {statusMsg && (
        <div className="p-2 bg-cyan-950/60 border border-cyan-500/30 rounded text-center text-xs font-mono text-cyan-300 animate-pulse">
          {statusMsg}
        </div>
      )}
    </div>
  );
};
