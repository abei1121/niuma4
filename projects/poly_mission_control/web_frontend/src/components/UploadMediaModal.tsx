import { FunctionalComponent } from 'preact';
import { useState, useRef } from 'preact/hooks';
import { uploadFiles } from '../api/system';

interface UploadMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const UploadMediaModal: FunctionalComponent<UploadMediaModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  if (!isOpen) return null;

  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const targetDir = '/Users/hi/niuma/video_workspace/library';

  const handleFileSelect = (selected: FileList | null) => {
    if (!selected || selected.length === 0) return;
    const list = Array.from(selected);
    setFiles((prev) => [...prev, ...list]);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer?.files) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('请先选择要上传的自媒体素材文件');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      for (const file of files) {
        formData.append('files', file);
      }

      const res = await uploadFiles(formData, targetDir);
      if (res && (res.success || Array.isArray(res.uploaded) || res.files)) {
        onSuccess();
        onClose();
      } else {
        setError(res?.error || '部分或全部素材上传失败');
      }
    } catch (e: any) {
      setError(`上传异常: ${e?.message || e}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0f172a] border border-gray-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-sm font-bold text-white">+ 新增自媒体素材入库</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-base px-2 py-1 rounded"
          >
            &times;
          </button>
        </div>

        <div className="text-xs text-gray-400">
          目标存储路径 (素材库唯一定点): <code className="text-emerald-400 font-mono">{targetDir}</code>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-300 text-xs">
            {error}
          </div>
        )}

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-2 ${
            isDragOver
              ? 'border-emerald-500 bg-emerald-950/20 text-emerald-300'
              : 'border-gray-700 hover:border-gray-500 bg-gray-900/40 text-gray-400'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="video/*,audio/*,image/*,.mov,.mp4,.mkv,.webm,.avi,.mp3,.wav,.aac,.m4a,.png,.jpg,.jpeg"
            className="hidden"
            onChange={(e) => handleFileSelect((e.target as HTMLInputElement).files)}
          />
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <div className="text-xs font-semibold text-gray-200">
            点击选择素材文件，或直接将视频/音频文件拖拽至此处
          </div>
          <div className="text-[11px] text-gray-500">
            支持 MP4, MOV, WebM, MP3, WAV, AAC, PNG, JPG 等格式
          </div>
        </div>

        {files.length > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs text-gray-300">
              <span>待上传列表 ({files.length} 个文件):</span>
              <button
                type="button"
                onClick={() => setFiles([])}
                className="text-[11px] text-gray-500 hover:text-rose-400"
              >
                清空
              </button>
            </div>
            <div className="max-h-36 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
              {files.map((f, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-gray-900/80 px-3 py-1.5 rounded-lg text-xs border border-gray-800"
                >
                  <span className="text-gray-200 truncate max-w-[280px]">{f.name}</span>
                  <span className="text-gray-500 font-mono text-[11px]">
                    {(f.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              ))}
            </div>
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
            type="button"
            disabled={uploading || files.length === 0}
            onClick={handleUpload}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow transition flex items-center space-x-1"
          >
            {uploading ? (
              <>
                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1" />
                <span>正在上传素材中...</span>
              </>
            ) : (
              <span>确认上传入库</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
