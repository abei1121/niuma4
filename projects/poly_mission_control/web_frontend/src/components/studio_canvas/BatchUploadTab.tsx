import { FunctionalComponent } from 'preact';
import { useState } from 'preact/hooks';
import { detectVideoRotation } from '../../api/video';

interface Props {
  autoFixOrientation: boolean;
  onAdded: (paths: string[]) => void;
  onClose: () => void;
}

export const BatchUploadTab: FunctionalComponent<Props> = ({ autoFixOrientation, onAdded, onClose }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [uploadPercent, setUploadPercent] = useState(0);

  const uploadSingleFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append('file', file);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setUploadPercent(percent);
          setStatusMsg(`正在上传: ${file.name} (${percent}%)`);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(`/Users/hi/niuma/video_workspace/library/${file.name}`);
        } else {
          reject(new Error(`HTTP ${xhr.status}`));
        }
      };

      xhr.onerror = () => reject(new Error('网络传输中断'));

      xhr.open('POST', '/api/files/upload?path=/Users/hi/niuma/video_workspace/library');
      xhr.send(formData);
    });
  };

  const handleBatchUpload = async (e: Event) => {
    const input = e.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const fileList = Array.from(input.files);
    setIsProcessing(true);
    setStatusMsg(`开始传输 ${fileList.length} 个视频文件...`);

    const added: string[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      try {
        const savedPath = await uploadSingleFile(file);
        added.push(savedPath);
      } catch (err) {
        console.error('上传异常:', err);
      }
    }

    if (added.length > 0) {
      onAdded(added);
      setStatusMsg(`成功接入 ${added.length} 条视频素材！`);
      setTimeout(() => {
        setIsProcessing(false);
        onClose();
      }, 600);
    } else {
      setStatusMsg('上传未能成功保存视频，请检查网络连接');
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <label className="border-2 border-dashed border-cyan-500/40 hover:border-cyan-400 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition bg-cyan-950/10 group">
        
        <span className="text-sm font-bold text-cyan-300">点击多选或批量拖拽视频文件到此处</span>
        <span className="text-[11px] text-gray-400 mt-1">
          支持同时多选批量上传 · 原生支持百兆/吉字节级大视频 · 零卡顿直达
        </span>
        <input
          type="file"
          multiple
          accept="video/*"
          onChange={handleBatchUpload}
          className="hidden"
          disabled={isProcessing}
        />
      </label>

      {/* 实时上传进度条 */}
      {isProcessing && (
        <div className="space-y-1.5 bg-gray-950 p-3 rounded-lg border border-gray-800">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-cyan-300 truncate max-w-xs">{statusMsg}</span>
            <span className="text-emerald-400 font-bold">{uploadPercent}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-500 to-emerald-500 h-2 transition-all duration-150 rounded-full"
              style={{ width: `${uploadPercent}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="text-[11px] text-gray-500 font-mono bg-gray-950/80 p-2.5 rounded-lg border border-gray-800">
        局域网传输通道: 手机或同局域网设备打开 <span className="text-cyan-400">http://192.168.1.181:8999</span> 即可无线秒传素材。
      </div>
    </div>
  );
};
