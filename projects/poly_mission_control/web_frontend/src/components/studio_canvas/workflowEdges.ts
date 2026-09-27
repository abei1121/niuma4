export interface WorkflowEdgesParams {
  hasFiles: boolean;
  filesCount: number;
  isL1ToL2Connected: boolean;
  keepCount: number;
  cleanDurationSec: number;
  cleanFile?: string;
  isL2ToL3Connected: boolean;
  trackCount: number;
  isL3ToL4Connected: boolean;
}

export function buildWorkflowEdges(params: WorkflowEdgesParams) {
  const labelCommon = {
    labelBgStyle: { fill: '#0f172a', fillOpacity: 0.95, stroke: '#334155', strokeWidth: 1, rx: 6, ry: 6 },
    labelStyle: { fill: '#e2e8f0', fontSize: 11, fontWeight: 700, fontFamily: 'monospace' },
    labelBgPadding: [6, 4] as [number, number],
  };

  const l0Label = !params.hasFiles
    ? '素材流水线'
    : params.isL1ToL2Connected
    ? `已录入 ${params.filesCount} 个素材 (已流转精洗)`
    : `${params.filesCount} 个素材待粗剪`;

  const l1Label = !params.isL1ToL2Connected
    ? '粗剪待流转'
    : params.cleanDurationSec > 0
    ? `已提纯 ${params.keepCount > 0 ? `${params.keepCount} 个切片` : '成片母带'} (${params.cleanDurationSec}s)`
    : params.cleanFile
    ? `成片母带已就绪 (${params.cleanFile.split('/').pop()?.slice(0, 20)}...)`
    : `已提纯 ${params.keepCount || 1} 个切片`;

  const edges = [
    {
      id: 'e-l0-l1',
      source: 'node-l0',
      target: 'node-l1',
      type: 'smoothstep',
      animated: params.hasFiles && !params.isL1ToL2Connected,
      label: l0Label,
      ...labelCommon,
      style: {
        stroke: params.isL1ToL2Connected ? '#10b981' : params.hasFiles ? '#3b82f6' : '#475569',
        strokeWidth: params.hasFiles ? 3 : 2,
        strokeDasharray: params.hasFiles && !params.isL1ToL2Connected ? '5 5' : undefined,
      },
    },
    {
      id: 'e-l1-l2',
      source: 'node-l1',
      target: 'node-l2',
      type: 'smoothstep',
      animated: params.isL1ToL2Connected,
      label: l1Label,
      ...labelCommon,
      style: {
        stroke: params.isL1ToL2Connected ? '#10b981' : '#475569',
        strokeWidth: params.isL1ToL2Connected ? 3 : 2,
        strokeDasharray: params.isL1ToL2Connected ? undefined : '5 5',
      },
    },
    {
      id: 'e-l2-l3',
      source: 'node-l2',
      target: 'node-l3',
      type: 'smoothstep',
      animated: params.isL2ToL3Connected,
      label: params.isL2ToL3Connected ? `分镜草稿就绪 (${params.trackCount} 轨道)` : '导演待推导',
      ...labelCommon,
      style: {
        stroke: params.isL2ToL3Connected ? '#a855f7' : '#475569',
        strokeWidth: params.isL2ToL3Connected ? 3 : 2,
        strokeDasharray: params.isL2ToL3Connected ? undefined : '5 5',
      },
    },
    {
      id: 'e-l3-l4',
      source: 'node-l3',
      target: 'node-l4',
      type: 'smoothstep',
      animated: params.isL3ToL4Connected,
      label: params.isL3ToL4Connected ? '就绪硬件压制' : '草稿待导出',
      ...labelCommon,
      style: {
        stroke: params.isL3ToL4Connected ? '#f43f5e' : '#475569',
        strokeWidth: params.isL3ToL4Connected ? 3 : 2,
        strokeDasharray: params.isL3ToL4Connected ? undefined : '5 5',
      },
    },
  ];

  return edges;
}
