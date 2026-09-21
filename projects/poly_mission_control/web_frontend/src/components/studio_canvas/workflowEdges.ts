export interface WorkflowEdgesParams {
  hasFiles: boolean;
  filesCount: number;
  isL1ToL2Connected: boolean;
  keepCount: number;
  cleanDurationSec: number;
  isL2ToL3Connected: boolean;
  trackCount: number;
  isL3ToL4Connected: boolean;
}

export function buildWorkflowEdges(params: WorkflowEdgesParams) {
  const edges = [
    {
      id: 'e-l0-l1',
      source: 'node-l0',
      target: 'node-l1',
      animated: params.hasFiles,
      label: params.hasFiles ? `${params.filesCount} 个素材待处理` : undefined,
      style: {
        stroke: params.hasFiles ? '#3b82f6' : '#334155',
        strokeWidth: 2,
      },
    },
    {
      id: 'e-l1-l2',
      source: 'node-l1',
      target: 'node-l2',
      animated: params.isL1ToL2Connected,
      label: params.isL1ToL2Connected ? `已提纯 ${params.keepCount} 个切片 (${params.cleanDurationSec}s)` : undefined,
      style: {
        stroke: params.isL1ToL2Connected ? '#10b981' : '#334155',
        strokeWidth: 2,
      },
    },
    {
      id: 'e-l2-l3',
      source: 'node-l2',
      target: 'node-l3',
      animated: params.isL2ToL3Connected,
      label: params.isL2ToL3Connected ? `分镜草稿就绪 (${params.trackCount} 轨道)` : undefined,
      style: {
        stroke: params.isL2ToL3Connected ? '#8b5cf6' : '#334155',
        strokeWidth: 2,
      },
    },
    {
      id: 'e-l3-l4',
      source: 'node-l3',
      target: 'node-l4',
      animated: params.isL3ToL4Connected,
      label: params.isL3ToL4Connected ? '就绪压制' : undefined,
      style: {
        stroke: params.isL3ToL4Connected ? '#f43f5e' : '#334155',
        strokeWidth: 2,
      },
    },
  ];

  return edges;
}
