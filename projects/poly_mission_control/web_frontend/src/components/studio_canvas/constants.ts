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

export const SECTOR_PLATES = [
  {
    id: 'xuanxue',
    name: '玄学',
    subOptions: [
      { id: 'xx_mingpan', name: '名人命盘解密', roleTitle: '爆款自媒体玄学名人命盘视频导演', desc: '拆解公众人物八字紫微，揭秘命运周期' },
      { id: 'xx_fengshui', name: '阳宅空间风水', roleTitle: '爆款自媒体空间风水布局视频导演', desc: '避开家居煞位，打造吸金聚气磁场' },
      { id: 'xx_dayun', name: '流年大运排盘', roleTitle: '爆款自媒体流年大运分析视频导演', desc: '把脉个人运势转折点，顺势而为' },
      { id: 'xx_mianxiang', name: '面相气场能量', roleTitle: '爆款自媒体面相气场解析视频导演', desc: '观人于微，透过五官看福泽与心智' },
      { id: 'xx_gongwei', name: '办公工位聚气', roleTitle: '爆款自媒体工位防小人招贵人视频导演', desc: '职场防背刺，工位极简催旺风水' },
      { id: 'xx_cichang', name: '数字能量磁场', roleTitle: '爆款自媒体手机号数字能量视频导演', desc: '数字规律揭秘，调整财富震动频率' },
    ],
  },
  {
    id: 'fangchan',
    name: '房产',
    subOptions: [
      { id: 'fc_daikan', name: '实拍房源带看', roleTitle: '爆款房产沉浸式带看视频导演', desc: '第一视角沉浸看房，直击真实户型痛点' },
      { id: 'fc_sunpan', name: '捡漏笋盘急售', roleTitle: '爆款房产笋盘爆料视频导演', desc: '房东急用钱底价抛售，高ROI捡漏' },
      { id: 'fc_bikeng', name: '买房避坑算账', roleTitle: '爆款房产购房算账避坑视频导演', desc: '算清贷款与杠杆，撕开置业套路' },
      { id: 'fc_haozhai', name: '豪宅空间鉴赏', roleTitle: '爆款顶奢豪宅空间美学视频导演', desc: '亿级顶豪生活方式沉浸式品鉴' },
      { id: 'fc_gaizao', name: '老破小改造逆袭', roleTitle: '爆款老破小极简改造视频导演', desc: '小户型榨干空间，低成本高质感变身' },
      { id: 'fc_fapai', name: '法拍房捡漏排雷', roleTitle: '爆款法拍房排雷实战视频导演', desc: '穿透产权瑕疵，安全拿下7折笋盘' },
    ],
  },
  {
    id: 'jinrong',
    name: '金融',
    subOptions: [
      { id: 'jr_zhouqi', name: '宏观周期博弈', roleTitle: '爆款自媒体宏观周期视频导演', desc: '用康波周期看资产沉浮，看懂财富收割' },
      { id: 'jr_gaoqian', name: '搞钱防割避坑', roleTitle: '爆款自媒体搞钱底层防割视频导演', desc: '揭露常见金融陷阱，守护普通人本金' },
      { id: 'jr_yidong', name: '实盘标的异动', roleTitle: '爆款盘口资金异动追踪视频导演', desc: '追踪主力大单足迹，研判博弈胜率' },
      { id: 'jr_peizhi', name: '财富资产配置', roleTitle: '爆款家庭资产防御配置视频导演', desc: '穿越滞胀周期的核心资产组合' },
      { id: 'jr_lianshang', name: '加密链上侦探', roleTitle: '爆款自媒体加密链上侦探视频导演', desc: '穿透巨鲸链上钱包，破解异动真相' },
      { id: 'jr_xianjinliu', name: '存钱与现金流', roleTitle: '爆款极简现金流保命视频导演', desc: '高息与逆周期环境下的安全垫打造' },
    ],
  },
  {
    id: 'shitidian',
    name: '实体店',
    subOptions: [
      { id: 'st_zhangben', name: '餐饮开店账本', roleTitle: '爆款实体餐饮真账本拆解视频导演', desc: '晒真实客单与房租毛利，劝退盲目创业' },
      { id: 'st_bidian', name: '闭店调研复盘', roleTitle: '爆款街头闭店调研排雷视频导演', desc: '复盘失败教训，探寻活下去的核心壁垒' },
      { id: 'st_paidui', name: '爆款排队探店', roleTitle: '爆款神仙实体探店视频导演', desc: '剖析现象级排队背后的营销与产品密码' },
      { id: 'st_chuangye', name: '小本实体创业', roleTitle: '爆款低成本轻实体创业视频导演', desc: '万元起步摆摊/轻档口实操方法论' },
      { id: 'st_tuoke', name: '同城拓客引流', roleTitle: '爆款同城本地生活引流视频导演', desc: '实体商家同城流量裂变与私域留存' },
      { id: 'st_gongying', name: '供应链暴利内幕', roleTitle: '爆款实体源头供应链揭秘视频导演', desc: '穿透中间商差价，还原真实出厂底价' },
    ],
  },
  {
    id: 'lvyou',
    name: '旅游',
    subOptions: [
      { id: 'ly_qiongyou', name: '穷游避坑攻略', roleTitle: '爆款穷游极限省钱避坑视频导演', desc: '用最少的预算打卡最震撼的风景' },
      { id: 'ly_dapian', name: '自然奇观大片', roleTitle: '爆款国家地理级自然奇观视频导演', desc: '震撼视觉视听，带观众看未涉足之境' },
      { id: 'ly_xiaozhong', name: '深度小众旅居', roleTitle: '爆款小众隐世村落旅居视频导演', desc: '逃离城市内卷，探索慢节奏栖息地' },
      { id: 'ly_shehua', name: '高端奢华度假', roleTitle: '爆款顶奢野奢酒店鉴赏视频导演', desc: '品味全球顶级居停美学与极致服务' },
      { id: 'ly_zijia', name: '亲子自驾路线', roleTitle: '爆款大美自驾公路行程视频导演', desc: '路书级节点规划与沿途食宿真实体验' },
      { id: 'ly_chujing', name: '出境行前保命指南', roleTitle: '爆款出国旅游排雷保命视频导演', desc: '签证/汇率/治安防坑全流程避雷' },
    ],
  },
  {
    id: 'meishi',
    name: '美食',
    subOptions: [
      { id: 'ms_xiaochi', name: '街头烟火小吃', roleTitle: '爆款街头深夜烟火小吃视频导演', desc: '寻找隐藏在巷弄角落的平民地道美味' },
      { id: 'ms_fuke', name: '独家烹饪复刻', roleTitle: '爆款米其林级家庭复刻视频导演', desc: '拆解大厨秘方，厨房小白秒出硬菜' },
      { id: 'ms_honghei', name: '真实排雷红黑榜', roleTitle: '爆款真实网红餐厅测评视频导演', desc: '不充值无恰饭，撕下虚假宣传滤镜' },
      { id: 'ms_lanren', name: '懒人神仙吃法', roleTitle: '爆款一锅出快手懒人美食视频导演', desc: '极简备菜与神仙调味，打工人的救赎' },
      { id: 'ms_feiyi', name: '非遗特色硬菜', roleTitle: '爆款中华非遗传统菜肴纪录片视频导演', desc: '传承匠心手艺，记录地道中华老味' },
      { id: 'ms_jianzhi', name: '科学减脂餐单', roleTitle: '爆款好吃不挨饿减脂餐单视频导演', desc: '控糖控卡兼具绝佳口感的科学餐盘' },
    ],
  },
  {
    id: 'huhuai',
    name: '户外',
    subOptions: [
      { id: 'hw_tubu', name: '荒野徒步露营', roleTitle: '爆款野性山野徒步露营视频导演', desc: '背上行囊扎进山林，记录纯粹野趣' },
      { id: 'hw_yediao', name: '野钓路亚高光', roleTitle: '爆款野钓路亚巨物搏击视频导演', desc: '水边高光时刻，捕捉大物咬钩拉竿瞬间' },
      { id: 'hw_yueye', name: '极限探险越野', roleTitle: '爆款硬派越野脱困实战视频导演', desc: '沙漠泥地极限穿越，机械力量美学' },
      { id: 'hw_jingzhi', name: '精致营地生活', roleTitle: '爆款Glamping精致美学露营视频导演', desc: '咖啡火堆氛围感，户外生活美学天花板' },
      { id: 'hw_qiusheng', name: '荒野求生技能', roleTitle: '爆款荒野庇护所与生火技能视频导演', desc: '刀与火的艺术，野外自给自足生存指南' },
      { id: 'hw_qixing', name: '公路长途骑行', roleTitle: '爆款长途公路骑行追风视频导演', desc: '两轮承载肉体与灵魂，看沿途辽阔风景' },
    ],
  },
  {
    id: 'yundong',
    name: '运动',
    subOptions: [
      { id: 'yd_genlian', name: '减脂暴汗跟练', roleTitle: '爆款燃脂暴汗全身跟练视频导演', desc: '无器械无噪音，强节奏感居家跟练' },
      { id: 'yd_qiulei', name: '球类实战高光', roleTitle: '爆款篮球足球精彩过人高光视频导演', desc: '燃系慢动作卡点，战术与身体对抗' },
      { id: 'yd_liliang', name: '力量器械教学', roleTitle: '爆款健身房黄金三大项教学视频导演', desc: '纠正发力代偿，无伤打造肌肉线条' },
      { id: 'yd_zhuangbei', name: '运动装备测评', roleTitle: '爆款跑鞋运动黑科技横评视频导演', desc: '拆解回弹与碳板支撑，教你把钱花在刀刃上' },
      { id: 'yd_paobu', name: '科学心率跑法', roleTitle: '爆款超慢跑有氧低心率训练视频导演', desc: '告别气喘吁吁，无痛减脂降心率秘诀' },
      { id: 'yd_titai', name: '体态与肩颈修复', roleTitle: '爆款久坐族圆肩驼背矫正视频导演', desc: '每天5分钟拉伸，快速缓解颈椎与腰背酸痛' },
    ],
  },
  {
    id: 'qiche',
    name: '汽车',
    subOptions: [
      { id: 'qc_ceshi', name: '新车实测红黑榜', roleTitle: '爆款新车深度动静态测评视频导演', desc: '真实续航加速测试，不偏不倚客观打分' },
      { id: 'qc_kanjia', name: '买车避坑砍价', roleTitle: '爆款4S店落地底价拆解视频导演', desc: '扒光各种出库费金融服务费套路' },
      { id: 'qc_zhijia', name: '智驾座舱实测', roleTitle: '爆款端到端智能驾驶极限接管视频导演', desc: '多路况无图高阶领航极限实测' },
      { id: 'qc_ershou', name: '二手车水深鉴别', roleTitle: '爆款事故车泡水调表排雷视频导演', desc: '漆膜仪验车实录，防踩二手深坑' },
      { id: 'qc_yangche', name: '用车养车省钱经', roleTitle: '爆款汽修保养防过度维修视频导演', desc: '自己动手省大钱，告别4S店过度保养' },
      { id: 'qc_qinghuai', name: '老车情怀与改装', roleTitle: '爆款老车翻新改装声浪视频导演', desc: '燃油车最后的浪漫，机械质感与声浪狂欢' },
    ],
  },
  {
    id: 'shuma',
    name: '科技数码',
    subOptions: [
      { id: 'sm_chaijie', name: '数码微距拆解', roleTitle: '爆款硬核数码微距拆解视频导演', desc: '微距镜头下的主板堆叠与工业美学' },
      { id: 'sm_aitool', name: '实用AI搞钱工具', roleTitle: '爆款前沿AI神器工作流实战视频导演', desc: '普通人用AI提效搞钱的落地打法' },
      { id: 'sm_zhuomian', name: '极客桌面生态', roleTitle: '爆款氛围感极客数码桌面改造视频导演', desc: '走线收纳与无线化桌面搭建灵感' },
      { id: 'sm_fanxin', name: '翻新陷阱避坑', roleTitle: '爆款华强北翻新机鉴别排雷视频导演', desc: '爱思全绿暗藏玄机，教你练就火眼金睛' },
      { id: 'sm_sheying', name: '手机摄影电影感', roleTitle: '爆款手机拍出电影质感实战视频导演', desc: '运镜构图与Log曲线调色技巧速成' },
      { id: 'sm_heike', name: '效率神器黑客', roleTitle: '爆款小众神级生产力软件推荐视频导演', desc: '一键释放电脑潜能，效率翻倍' },
    ],
  },
  {
    id: 'qinggan',
    name: '两性情感',
    subOptions: [
      { id: 'qg_goutong', name: '亲密关系沟通', roleTitle: '爆款亲密关系非暴力沟通视频导演', desc: '停止冷战内耗，走进伴侣内心的说话技巧' },
      { id: 'qg_renxing', name: '扎心人性清醒', roleTitle: '爆款两性博弈与人性真相视频导演', desc: '看透感情背后的利益交换与人性本质' },
      { id: 'qg_duhai', name: '深夜情感独白', roleTitle: '爆款情感共鸣深夜扎心文案视频导演', desc: '娓娓道来戳中泪点，治愈被辜负的心' },
      { id: 'qg_xiyin', name: '相处吸引法则', roleTitle: '爆款高位者恋爱框架吸引力视频导演', desc: '摆脱讨好型人格，建立自身磁场' },
      { id: 'qg_duanlian', name: '断联戒断自愈', roleTitle: '爆款分手失恋彻底放下自愈视频导演', desc: '心理学戒断指南，从情伤中快速涅槃' },
      { id: 'qg_xiangqin', name: '婚恋相亲防雷', roleTitle: '爆款相亲婚恋排雷避坑视频导演', desc: '识别妈宝家暴老赖，相亲桌上的识人术' },
    ],
  },
  {
    id: 'chuhai',
    name: '出海',
    subOptions: [
      { id: 'ch_dianshang', name: '跨境电商爆品', roleTitle: '爆款跨境电商选品出海视频导演', desc: '挖掘海外冷门暴利刚需爆品' },
      { id: 'ch_duanju', name: '短剧出海爽点', roleTitle: '爆款欧美出海微短剧编剧视频导演', desc: '精准击中海外老外的抓马狗血爽点' },
      { id: 'ch_pengzhuang', name: '海外生活碰撞', roleTitle: '爆款华人出海真实文化碰撞视频导演', desc: '还原真实的海外租房、看病与生活成本' },
      { id: 'ch_moshi', name: '出海搞钱模式', roleTitle: '爆款全球化信息差搞钱视频导演', desc: '借内卷红利赚美金，利用全球不对称优势' },
      { id: 'ch_tiktok', name: 'TikTok海外带货', roleTitle: '爆款TikTok美区短视频带货视频导演', desc: '纯美语话术与海外用户冲动消费刺激' },
      { id: 'ch_youmin', name: '数字游民与身份', roleTitle: '爆款全球数字游民身份规划视频导演', desc: '旅居全球拿绿卡，实现地理套利' },
    ],
  },
];
