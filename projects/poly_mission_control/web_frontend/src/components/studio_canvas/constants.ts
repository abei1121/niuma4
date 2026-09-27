import { NodeL0Ingest } from './NodeL0Ingest';
import { NodeL1RoughWash } from './NodeL1RoughWash';
import { NodeL2AgyDirector } from './NodeL2AgyDirector';
import { NodeL3NleEditor } from './NodeL3NleEditor';
import { NodeL4Render } from './NodeL4Render';
import { TrackItem } from './types';

export const STATIC_NODE_TYPES = {
  nodeL0: NodeL0Ingest,
  nodeL1: NodeL1RoughWash,
  nodeL2: NodeL2AgyDirector,
  nodeL3: NodeL3NleEditor,
  nodeL4: NodeL4Render,
};

export const DEFAULT_TRACK_ITEMS: TrackItem[] = [
  {
    id: 'track-v-1',
    trackType: 'video',
    name: '主画面镜头',
    startSec: 0,
    endSec: 15.0,
    color: 'bg-blue-600 border-blue-400',
    detail: '原片保留的高光片段',
  },
  {
    id: 'track-sub-1',
    trackType: 'subtitle',
    name: '黄金前3秒吸睛大花字',
    startSec: 0,
    endSec: 3.5,
    color: 'bg-cyan-600 border-cyan-400',
    detail: '爆款抓人文案',
  },
  {
    id: 'track-a-1',
    trackType: 'audio',
    name: '重低音转场音效 Whoosh',
    startSec: 3.2,
    endSec: 4.5,
    color: 'bg-emerald-600 border-emerald-400',
    detail: '增强听觉卡点',
  },
];

export const STATIC_EDGES = [
  { id: 'e-l0-l1', source: 'node-l0', target: 'node-l1', animated: true, style: { stroke: '#3b82f6', strokeWidth: 2 } },
  { id: 'e-l1-l2', source: 'node-l1', target: 'node-l2', animated: false, style: { stroke: '#10b981', strokeWidth: 2 } },
  { id: 'e-l2-l3', source: 'node-l2', target: 'node-l3', animated: false, style: { stroke: '#8b5cf6', strokeWidth: 2 } },
  { id: 'e-l3-l4', source: 'node-l3', target: 'node-l4', animated: false, style: { stroke: '#f43f5e', strokeWidth: 2 } },
];

export const PLATFORM_RULES = [
  {
    id: 'douyin',
    name: '抖音',
    features: '前3秒完播率生死线，情绪密度极高，节奏快卡点准。',
    pitfallRules: '严禁违禁词、绝对化用语，忌生硬导流与过度营销承诺。',
    pacing: '1.2x~1.5x 快节奏',
    recommendedRatio: '9:16',
  },
  {
    id: 'xiaohongshu',
    name: '小红书',
    features: '封面高审美、强种草与搜索长尾属性，图文美学结合。',
    pitfallRules: '严禁站外引流留微信，忌硬广通篇灌水与无质感滤镜。',
    pacing: '高信息密度精致流',
    recommendedRatio: '3:4 / 9:16',
  },
  {
    id: 'bilibili',
    name: 'B站',
    features: '中长视频高信息量，强逻辑闭环，弹幕与造梗互动文化。',
    pitfallRules: '忌快餐低质营销号解说，严禁掐头去尾假科普与硬恰饭。',
    pacing: '逻辑递进深度沉浸',
    recommendedRatio: '16:9',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    features: '全球长尾分发，强依赖高点击率首图与平均观看时长(AVD)。',
    pitfallRules: '严防音频与画面侵权，前10秒必须直给核心爆点。',
    pacing: 'Hook抓人+平稳交付',
    recommendedRatio: '16:9 / 9:16 Shorts',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    features: '快节奏跨文化视觉流，前2秒极速抓眼球，流行热梗BGM。',
    pitfallRules: '忌非原生语境，界面右侧和下方留出操作遮挡安全区。',
    pacing: '极速视觉轰炸',
    recommendedRatio: '9:16',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    features: 'Reels高质感审美，个人IP轻奢调性，色彩与排版精致。',
    pitfallRules: '带第三方平台水印(如抖音快手标)会被直接限流降权。',
    pacing: '轻快高格调',
    recommendedRatio: '9:16',
  },
  {
    id: 'x_twitter',
    name: 'X (推特)',
    features: '观点极其犀利，数据硬核，评论区深度观点博弈互动。',
    pitfallRules: '忌纯营销机器人话术与低质链接，避免冗长铺垫。',
    pacing: '开门见山直奔痛点',
    recommendedRatio: '16:9 / 1:1',
  },
  {
    id: 'universal',
    name: '全网通用',
    features: '多端全网分发兼容，平衡竖屏与横屏中心安全区。',
    pitfallRules: '剔除单一平台专属黑话与导流语，遵守通用合规底线。',
    pacing: '标准稳健流',
    recommendedRatio: '9:16 / 16:9',
  },
];

export { SECTOR_PLATES } from './sectorPlates';

