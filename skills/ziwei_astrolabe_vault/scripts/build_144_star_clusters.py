#!/usr/bin/env python3
"""
scripts/build_144_star_clusters.py - Build & Inject Canonical 144 Star Clusters into knowledge_vault.json
Strictly <= 250 lines. Zero marketing fluff. Pure classical orthodox and modern strategic translations.
"""
import json
import sys
from pathlib import Path

# Load precomputed 144 layout from /tmp/ziwei_144_layout.json
LAYOUT_FILE = Path("/tmp/ziwei_144_layout.json")
if not LAYOUT_FILE.exists():
    print(f"Error: Layout file {LAYOUT_FILE} not found. Generate it first via iztro.")
    sys.exit(1)

with open(LAYOUT_FILE, "r", encoding="utf-8") as f:
    layout_data = json.load(f)

# Master Archetype Dictionary for all distinct star combinations
ARCHETYPES = {
    ("紫微", "天府"): {
        "essence": "《全书》云：紫府同宫，终身福厚，食禄万钟，全依辅弼之功。",
        "modern_business": "平台型领袖、大型集团操盘手、总架构师，掌控全局，统揽多业务线。",
        "palace_applications": "守命主气象博大；守官禄主居大位守成有余、需防开拓脱节；守财帛主财源丰厚自成体系。",
        "breakthrough_action": "以制度化组织授权替代事必躬亲，绑定强悍落地副手弥补细节盲区。",
        "defensive_reframing": "见煞曜莫断破败，主拓荒期摩擦与权柄承压，需强化合规流程。",
    },
    ("破军", "紫微"): {
        "essence": "《骨髓赋》云：紫微破军，先破后成，开疆拓土，威慑四夷。",
        "modern_business": "连续创业者、产业兼并重组操盘手、企业变革先锋，擅打逆风攻坚战。",
        "palace_applications": "守命主敢破敢立；守官禄主转型升级与业务重构；守财帛主财来财去先耗后聚。",
        "breakthrough_action": "分阶段推进重大转型，严格设置止损阈值，严防现金流盲目扩张。",
        "defensive_reframing": "逢煞星莫断家破人亡，实乃颠覆旧模式阵痛，宜通过MVP敏捷迭代验证。",
    },
    ("紫微", "贪狼"): {
        "essence": "《太微赋》云：紫微贪狼同度，桃花犯主，情商至上，长袖善舞。",
        "modern_business": "高端商务公关、文化文娱操盘手、资源整合大师，擅长以人脉杠杆撬动商业资本。",
        "palace_applications": "守命主才艺情商极高；守官禄主名利场中跨界变现；守财帛主投机机变、善于社交套利。",
        "breakthrough_action": "以刚性白纸黑字合同规制人情往来，杜绝因哥们义气导致股权与利益模糊。",
        "defensive_reframing": "古云淫荡贪鄙实为封建污名，现代主超级商务连接者与情感高维变现力。",
    },
    ("天相", "紫微"): {
        "essence": "《全书》云：紫相辰戌，君臣庆会，参谋总长，兼备文武。",
        "modern_business": "顶级职业经理人、首席运营官(COO)、政商桥梁、合伙人中枢。",
        "palace_applications": "守命主行事稳重进退有度；守官禄主辅助一号位做大盘交付；守财帛主合规分红与高薪厚俸。",
        "breakthrough_action": "恪守二把手协同生态位，不越俎代庖，以制度建设构筑不可替代的交付护城河。",
        "defensive_reframing": "逢空劫火铃莫论孤贫，主需在体制内或大机构中寻找独立创新土壤。",
    },
    ("七杀", "紫微"): {
        "essence": "《斗数骨髓》云：紫微七杀化为权，御驾亲征，一剑定乾坤。",
        "modern_business": "攻坚铁军统帅、出海拓荒先锋、硬科技硬核执行官，意志铁血，战力彪悍。",
        "palace_applications": "守命主魄力绝伦；守官禄主硬仗破阵与业务扩张；守财帛主刀锋舐血、大进大出。",
        "breakthrough_action": "克制过度个人英雄主义，搭建梯队机制，降低对核心骨干单一人的极限依赖。",
        "defensive_reframing": "古云刑煞极重，现代实为战略决断果敢，需配套柔性HR制度进行团队安抚。",
    },
    ("天府", "武曲"): {
        "essence": "《全书》云：武府子午同宫，财库丰盈，一生巨富，福寿双全。",
        "modern_business": "金融投资实业巨头、家族办公室操盘手、长线价值投资操盘人。",
        "palace_applications": "守命主理财深湛；守官禄主重仓造血与资产固化；守财帛主稳健长线复利。",
        "breakthrough_action": "重仓高股息与稳定造血底仓，严控高倍杠杆衍生品，防守反击胜率最高。",
        "defensive_reframing": "遇擎羊陀罗莫论破财，主财务法务审计严格，需强化合同条款风控。",
    },
    ("武曲", "贪狼"): {
        "essence": "《全书》云：武贪同宫，威震边夷，晚发横财，前苦后甘。",
        "modern_business": "跨界外贸、矿产能源、投机奇袭、三十五岁后爆发型商业领袖。",
        "palace_applications": "守命主厚积薄发；守官禄主前期多磨炼、后期跃迁封神；守财帛主爆发奇袭。",
        "breakthrough_action": "三十五岁前耐住冷板凳打磨专业护城河，切莫急于杠杆套现。",
        "defensive_reframing": "早年坎坷非命途不济，乃系统在磨练核心实操能力，晚发方能长青稳固。",
    },
    ("天相", "武曲"): {
        "essence": "《太微赋》云：武曲天相，文韬武略，操持实业，信诺千金。",
        "modern_business": "高端实业制造、技术运营总监、大项目EPC交付专家，信誉即核心资产。",
        "palace_applications": "守命主义利双收；守官禄主规矩流程严整；守财帛主凭契约与专业赚取稳定现金流。",
        "breakthrough_action": "深耕垂直产业链节点，以精益生产和无懈可击的品控击穿竞品。",
        "defensive_reframing": "逢天刑煞星莫论官非，实乃合规合法人防范，前置聘请法务顾问即可免灾。",
    },
    ("七杀", "武曲"): {
        "essence": "《骨髓赋》云：武曲七杀会，因财被劫，白手起家，破而后立。",
        "modern_business": "硬核工业制造、硬件开发、军工科技、从零打拼的实业创客。",
        "palace_applications": "守命主刚毅决绝；守官禄主九死一生打硬仗；守财帛主现金流承压、警惕回款断裂。",
        "breakthrough_action": "严把财务回款周期，宁肯放弃利润也不垫资冒进，守死现金流生命线。",
        "defensive_reframing": "古云‘因财被劫’，现代实为应收账款账期过长或垫资坏账，预付定金锁定即破局。",
    },
    ("武曲", "破军"): {
        "essence": "《全书》云：武破水火同位，倾家荡产而后立，先破后兴。",
        "modern_business": "破坏性创新操盘手、偏门奇巧产业、跨境电商、供应链颠覆者。",
        "palace_applications": "守命主不守成规；守官禄主数度易辙、换道超车；守财帛主钱财过手万千沉淀较难。",
        "breakthrough_action": "以轻资产小步快跑验证新商业模型，坚决不抵押核心资产盲目扩大生产规模。",
        "defensive_reframing": "倾家荡产乃重资产时代的悲剧，现代轻资产敏捷创业可将风险控制在可承受范围。",
    },
    ("天相", "廉贞"): {
        "essence": "《太微赋》云：廉贞天相，清白自守，中正不阿，任重道远。",
        "modern_business": "公司首席风控官、法务合规总监、大厂政委HRVP、公共事务掌舵人。",
        "palace_applications": "守命主行事有度；守官禄主组织合规与治理结构搭建；守财帛主清白受禄、规范透明。",
        "breakthrough_action": "把牢治理规程与签约权，以制度程序正义保护自身免受合伙纷争牵连。",
        "defensive_reframing": "逢化忌冲对宫莫惧牢狱，强化合同前置审核与公证确权，依法行事安然无虞。",
    },
    ("七杀", "廉贞"): {
        "essence": "《骨髓赋》云：廉贞七杀，路上埋尸，流血千里，雄宿朝元富贵扬。",
        "modern_business": "极限攻坚销售总监、海外高风险拓荒者、应急公关队长、特战部队指挥官。",
        "palace_applications": "守命主气场凌厉；守官禄主刀尖跳舞、力挽狂澜；守财帛主险中求财。",
        "breakthrough_action": "严防身心过劳衰竭，在经济周期下行期果断收缩防线，避免孤军深入。",
        "defensive_reframing": "路上埋尸实为古代行商兵祸恐吓；现代对应出差交通安全、心血管健康与高强度心理承载。",
    },
    ("廉贞", "破军"): {
        "essence": "《全书》云：廉破卯酉，水火相荡，破祖离宗，巧艺走天涯。",
        "modern_business": "反共识赛道捕手、工业设计革新者、独立开发者、出海异地颠覆者。",
        "palace_applications": "守命主不循常规；守官禄主在细分赛道突围破局；守财帛主起伏激荡需分账储蓄。",
        "breakthrough_action": "彻底放弃与巨头在红海正面拼消耗，在巨头看不见的细分暗流中做深壁垒。",
        "defensive_reframing": "破祖离宗现代即跳出原生家庭与传统行业桎梏，奔赴全球广阔市场掘金。",
    },
    ("天府", "廉贞"): {
        "essence": "《太微赋》云：天府廉贞辰戌位，富贵名扬，金库稳固，主守成有余。",
        "modern_business": "家族信托、实业大财阀、政商二代、稳健型大型集团核心管理者。",
        "palace_applications": "守命主仪态威严；守官禄主稳步晋升底盘坚固；守财帛主财不外露沉淀稳固。",
        "breakthrough_action": "构建多层级资产防火墙，把注意力集中在声誉资产与政商合规沉淀上。",
        "defensive_reframing": "见煞曜勿虑官非破耗，设立合规顾问委员会即可将风险完全过滤。",
    },
    ("廉贞", "贪狼"): {
        "essence": "《全书》云：廉贪巳亥，粉骨碎身，巧智多端，流荡天涯，四海为家。",
        "modern_business": "国际贸易巨头、前沿传媒MCN掌门、先锋艺术家、跨文化商业桥梁。",
        "palace_applications": "守命主智巧过人；守官禄主长袖善舞、擅走偏锋；守财帛主财源杂泛进出频繁。",
        "breakthrough_action": "牢牢筑牢法律底线，将偏锋创意与顶级人脉引导至正道商业主航道。",
        "defensive_reframing": "粉骨碎身古指下层艺人流浪之苦，现代主全球化视野与跨界认知降维打击。",
    },
    ("太阳", "太阴"): {
        "essence": "《全书》云：日月同临，水火相济，明暗交织，双轨并行。",
        "modern_business": "跨境双向贸易、公关品牌操盘手、整合多方复杂利益的枢纽型操盘人。",
        "palace_applications": "守命主心思细密多维；守官禄主双线业务齐头并进；守财帛主财源广泛动静皆宜。",
        "breakthrough_action": "清晰厘定主干业务与衍生业务的资源配比，避免双线作战导致核心部队精力涣散。",
        "defensive_reframing": "忽冷忽热乃情绪波动，需用结构化OKR工具将决策客体化，减少心性内耗。",
    },
    ("太阳", "巨门"): {
        "essence": "《太微赋》云：巨日同宫，官封三代，声名远播，以名求利。",
        "modern_business": "涉外法律专家、跨境电商领航者、学术意见领袖(KOL)、大型公关发言人。",
        "palace_applications": "守命主才辩无双；守官禄主凭借专业声誉赢取巨额溢价；守财帛主名利双收先名后利。",
        "breakthrough_action": "深耕跨语言与跨文化专业领域，持续输出高价值内容以构筑品牌声誉溢价壁垒。",
        "defensive_reframing": "见化忌莫惧口舌官非，涉外法务与危机公关正是将口舌转化为现金流的绝佳通路。",
    },
    ("天梁", "太阳"): {
        "essence": "《骨髓赋》云：阳梁昌禄传第一，金榜题名，公门清誉，位列三公。",
        "modern_business": "行业领军顾问、司法监察、国家级智库学者、医疗大健康泰斗、公信力掌门人。",
        "palace_applications": "守命主一身正气；守官禄主凭专业资质与公信力立足；守财帛主名正言顺之俸禄清财。",
        "breakthrough_action": "珍惜羽毛，坚决拒绝一切灰色利益输送，以绝对的公信力享受终身长尾复利。",
        "defensive_reframing": "古云劳碌孤傲，现代主高维专业尊严与不受资本绑架的职业自由度。",
    },
    ("天机", "太阴"): {
        "essence": "《全书》云：机月同梁，高超幕僚，算无遗策，精打细算。",
        "modern_business": "首席战略官(CSO)、首席财务官(CFO)、顶级投研智囊、大数据算法总监。",
        "palace_applications": "守命主思虑周详；守官禄主幕后策划与中枢调控；守财帛主精细理财以智求财。",
        "breakthrough_action": "甘当幕后诸葛亮，以卓越的算力与战略模型辅助领袖，莫在一线争强好胜。",
        "defensive_reframing": "女命淫乱古人封建妄断；现代乃独立女性之精明睿智、财务自由典范。",
    },
    ("天机", "巨门"): {
        "essence": "《太微赋》云：巨机同临，先破后成，特种技术，自成一派。",
        "modern_business": "底层架构师、硬核编程极客、专利发明家、高端咨询顾问。",
        "palace_applications": "守命主思维缜密辩才无碍；守官禄主技术立命攻克难关；守财帛主凭独门专利变现。",
        "breakthrough_action": "聚焦底层难啃的技术硬骨头，不参与办公室政治纷争，靠无法替代的技术指标碾压对手。",
        "defensive_reframing": "早期多驳杂动荡乃试错摸索，一旦锁定主航道便呈指数级爆发。",
    },
    ("天机", "天梁"): {
        "essence": "《骨髓赋》云：机梁善谈兵，智谋绝伦，神机妙算，逢难必解。",
        "modern_business": "商业模式架构师、危机干预顾问、系统安全总架构、哲学人文导师。",
        "palace_applications": "守命主洞察秋毫；守官禄主解决极端复杂系统死结；守财帛主清高取财、智谋变现。",
        "breakthrough_action": "将高维复杂的战略模型拆解为一线听得懂、可复制的标准化SOP流程。",
        "defensive_reframing": "善谈兵忌流于空谈，必须拉通实操团队强制完成闭环交付。",
    },
    ("天同", "太阴"): {
        "essence": "《太微赋》云：水澄桂萼，清雅温润，得享清福，艺术成名。",
        "modern_business": "生活美学品牌创始人、文创IP孵化者、私域疗愈商业、高端服务业翘楚。",
        "palace_applications": "守命主性格温和审美绝佳；守官禄主慢工出细活；守财帛主细水长流。",
        "breakthrough_action": "远离恶性低端价格战，坚持以审美、情感价值与精神共鸣获取高端客群溢价。",
        "defensive_reframing": "遇煞忌莫论沉溺享受，引入合伙人目标管理机制倒逼自驱力即可。",
    },
    ("天同", "巨门"): {
        "essence": "《全书》云：同巨丑未，明暗交织，言语多隙，苦尽甘来。",
        "modern_business": "疑难故障排查专家、客户成功体系操盘手、复杂纠纷调解员、公关消杀队长。",
        "palace_applications": "守命主耐受力极强；守官禄主深耕复杂脏活累活建立壁垒；守财帛主苦尽甘来。",
        "breakthrough_action": "用透明、真诚且专业的沟通消解信息差，做最难做的客户成功与问题复盘。",
        "defensive_reframing": "口舌是非乃业务属性所致，正是解决客户争议才能建立长期信任壁垒。",
    },
    ("天同", "天梁"): {
        "essence": "《太微赋》云：荫福相聚，遇难呈祥，大难不死，必有后福。",
        "modern_business": "医疗大健康实业、公益慈善机构、养老与母婴产业、危机调解中枢。",
        "palace_applications": "守命主福厚随和；守官禄主长期主义利他生态；守财帛主安稳无忧积善成家。",
        "breakthrough_action": "深耕利他善业，坚持长期主义口碑沉淀，时间是最大的护城河杠杆。",
        "defensive_reframing": "遇波折不必慌张，系统自带危机自愈机制，保持战略定力必逢凶化吉。",
    },
}

# Single Star Archetypes (with palace/branch adaptability)
SINGLE_ARCHETYPES = {
    "紫微": {
        "essence": "《全书》云：紫微帝坐，万星之尊，至高至大，统御四方。",
        "modern_business": "独立创业者领袖、公司创始人、自主开创新格局的掌舵人。",
        "palace_applications": "子宫平守需辅弼共济；午宫入庙极向离明主威权赫赫；守官禄主统摄全局。",
        "breakthrough_action": "广开言路，克制独断专行，建立群智决策机制与激励分成机制。",
        "defensive_reframing": "孤君在野无百官朝拱莫忧，现代可借助AI与扁平化敏捷团队替代传统官僚。",
    },
    "天机": {
        "essence": "《太微赋》云：天机为善宿，机智灵动，变通莫测，智囊中枢。",
        "modern_business": "敏捷项目经理、算法工程师、商业情报官、策略运营总操盘。",
        "palace_applications": "守命主多才多艺善应变；守官禄主频繁拥抱技术变革；守财帛主机巧谋财。",
        "breakthrough_action": "戒除浮躁与频繁跳槽，在一个核心技术领域耐住寂寞积累十年深度。",
        "defensive_reframing": "心神不宁乃算力溢出表现，通过规律冥想与硬核代码落地消化冗余思维。",
    },
    "太阳": {
        "essence": "《骨髓赋》云：太阳司天，普照万物，贵名远扬，公正无私。",
        "modern_business": "公共品牌领袖、大众传媒主理人、行业布道师、利他型生态组织者。",
        "palace_applications": "巳午庙旺主光芒四射名震四海；子亥落陷需借内光潜心积累；守官禄主名望先行。",
        "breakthrough_action": "落陷者深藏若虚蓄势待发；庙旺者戒骄戒躁，切勿替他人做无底线背书。",
        "defensive_reframing": "劳碌伤神乃因无差别普照他人，需建立能量防护罩，聚焦核心战区交付。",
    },
    "武曲": {
        "essence": "《全书》云：武曲金星，正财司命，孤克果决，雷厉风行。",
        "modern_business": "硬核实业家、精算师、投行业务主管、数字交易操盘手。",
        "palace_applications": "辰戌入庙突破罗网；守官禄主实干到底；守财帛主实打实赚取真金白银。",
        "breakthrough_action": "用冷峻的数据模型指导一切经营动作，杜绝盲目的人情化借贷与情绪化投资。",
        "defensive_reframing": "孤克冷酷现代对应专注理性，是专业金融操盘不可或缺的顶级心理素质。",
    },
    "天同": {
        "essence": "《太微赋》云：天同福星，善解诸厄，温润如玉，后发制人。",
        "modern_business": "用户体验大师、社区运营官、生活方式商业主理人、疗愈产品创作者。",
        "palace_applications": "守命主乐天知命；守官禄主善于搭建和谐团队；守财帛主细水长流。",
        "breakthrough_action": "引入外部监督与OKR考核机制倒逼执行，战胜人性中的安逸拖延心理。",
        "defensive_reframing": "贪图安逸实因缺乏危机倒逼，置身竞争市场能激发惊人潜能与情商优势。",
    },
    "廉贞": {
        "essence": "《全书》云：廉贞次桃花，五鬼奇宿，情理激荡，洞悉人心。",
        "modern_business": "战略洞察官、危机攻关专家、前沿技术开发者、人际心理博弈大师。",
        "palace_applications": "寅申独坐雄宿朝元；守官禄主攻城略地；守财帛主偏门创意变现。",
        "breakthrough_action": "用极度的专业自律驯服内心情绪暗流，将敏锐的洞察力倾注于产品极致研发。",
        "defensive_reframing": "化忌暴躁乃才华受压制所致，提供充足技术研发预算即可引导其一飞冲天。",
    },
    "天府": {
        "essence": "《全书》云：天府令星，号称司库，稳健宽厚，包容万物。",
        "modern_business": "集团CFO、商业地产大掌门、资产配置专家、大型机构稳健操盘手。",
        "palace_applications": "丑未入庙资产雄厚；守官禄主行稳致远；守财帛主筑牢家庭与企业护城河。",
        "breakthrough_action": "划拨10%风险预算专用于拥抱新范式创新，避免因过度谨慎错失时代级Beta红利。",
        "defensive_reframing": "过于保守实为终局风控，在下行周期此类盘造最能穿越熊市傲视群雄。",
    },
    "太阴": {
        "essence": "《太微赋》云：太阴母宿，月华深沉，富足内蕴，精于长线。",
        "modern_business": "私域财富管家、品牌策划掌门、文创IP幕后推手、长周期资产管理者。",
        "palace_applications": "酉戌亥子庙旺光华璀璨；卯辰巳午落陷宜隐忍修持；守财帛主资产悄然沉淀。",
        "breakthrough_action": "建立严格的资产隔离与隐秘账户，避免财务过度曝光招致觊觎。",
        "defensive_reframing": "性格柔弱为表象，实质内心极为坚韧，善于用时间水滴石穿赢取长线大局。",
    },
    "贪狼": {
        "essence": "《骨髓赋》云：贪狼星动，欲望之源，破旧立新，百工技艺。",
        "modern_business": "顶级商务合伙人(BD)、风险投资人、流量转化专家、新零售操盘手。",
        "palace_applications": "子午为木火通明/泛水桃花；辰戌入网三十五前磨炼；守官禄主善于奇袭拓荒。",
        "breakthrough_action": "把从人脉与流量中赚取的短期现金流，坚决沉淀为实体不动产或核心技术资产。",
        "defensive_reframing": "贪婪欲望实乃人类商业创新的底层引擎，只要合规引导即为破局造化。",
    },
    "巨门": {
        "essence": "《全书》云：巨门暗宿，口舌化权，深藏若虚，石中隐玉。",
        "modern_business": "深层算法架构师、涉外诉讼大律师、核心法务总监、危机公关战神。",
        "palace_applications": "子午石中隐玉出人头地；辰戌平守宜精研一技；守官禄主凭言论或技术封神。",
        "breakthrough_action": "前期保持低调隐忍，严禁在羽翼未丰前大放厥词；待技术指标过硬时一鸣惊人。",
        "defensive_reframing": "招惹是非实因直击行业本质与皇帝新衣，用硬核交付堵住所有质疑者的嘴。",
    },
    "天相": {
        "essence": "《太微赋》云：天相印星，恪尽职守，秉公持平，兼善天下。",
        "modern_business": "总工程师、项目管理专家、质量认证把关人、品牌信誉守护者。",
        "palace_applications": "丑未巳亥恪尽职守；守官禄主流程完备交付极致；守财帛主合规收入从容自在。",
        "breakthrough_action": "在每一次签约和公章使用中恪守底线，以绝对的信誉为企业构筑无形护城河。",
        "defensive_reframing": "逢煞星被夹莫惧官非，严格遵循合规法务流程即可将风险完全转嫁隔绝。",
    },
    "天梁": {
        "essence": "《骨髓赋》云：天梁清贵，老成持重，逢凶化吉，庇佑宗亲。",
        "modern_business": "特聘资深顾问、合规监察长、仲裁院专家、行业终身导师。",
        "palace_applications": "子午入庙威望隆重；守官禄主受人尊崇；守财帛主清正廉明受人供奉。",
        "breakthrough_action": "坚决不插手具体的执行鸡毛蒜皮，站在战略与风控的高维视角为管理层掌舵。",
        "defensive_reframing": "古云刑伤灾厄乃因必先遇难后显化吉神威，面对困难视作建立威信的绝佳舞台。",
    },
    "七杀": {
        "essence": "《骨髓赋》云：七杀大将，专司生杀，独行万里，所向披靡。",
        "modern_business": "硬仗破局战神、海外高难拓荒司令、特遣业务队长、技术突破先锋。",
        "palace_applications": "寅申子午仰斗朝斗名利双全；辰戌入网大器晚成；守官禄主冲锋陷阵无坚不摧。",
        "breakthrough_action": "寻找善于后勤补给与内部协调的亲密搭档，形成‘前线破局+后方稳盘’双核架构。",
        "defensive_reframing": "孤克刑伤源自过强的主见，尊重专业协作分工即可将孤勇转化为军团战力。",
    },
    "破军": {
        "essence": "《全书》云：破军先锋，破旧立新，水火互济，摧枯拉朽。",
        "modern_business": "颠覆式创新先驱、敏捷革命主导者、供给侧重构操盘人、新物种创造者。",
        "palace_applications": "子午英星入庙威震八方；守官禄主摧毁陈旧模式；守财帛主千金散尽还复来。",
        "breakthrough_action": "每次颠覆旧业务时，保留20%的保底防守资产作为战略退路，绝不打无准备的死战。",
        "defensive_reframing": "破坏祖业实乃新旧交替必然规律，在数字时代主动破局者方能在周期迭代中领跑。",
    },
}

EMPTY_ARCHETYPE = {
    "essence": "《全书》云：宫无正曜，借对宫之星耀以察盛衰，虚以待物，灵活多变。",
    "modern_business": "敏捷中介、轻资产平台操盘手、跨界变色龙、善借外势借力打力的整合者。",
    "palace_applications": "借对宫主星亮度与吉煞判定；守命主身段柔软善抓机遇；守官禄主善于借势平台红利。",
    "breakthrough_action": "全面背靠巨头或核心强势合伙人借势赋能，绝不单独硬抗重资产实体风险。",
    "defensive_reframing": "无主星并非毫无前途，现代社会轻资产与借力打力反而是抵御黑天鹅的最优策略。",
}

# Generate 144 Canonical Star Cluster Entries
canonical_144 = {}
chart_order = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
branch_order = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

count = 0
for zw in chart_order:
    chart_palaces = layout_data.get(zw, {})
    for b in branch_order:
        stars = chart_palaces.get(b, [])
        entry_id = f"ZW_{zw}_{b}"
        opp_branch = branch_order[(branch_order.index(b) + 6) % 12]
        opp_stars = chart_palaces.get(opp_branch, [])
        
        # Determine archetype
        s_tuple = tuple(sorted(stars))
        if len(stars) == 0:
            arch = EMPTY_ARCHETYPE
            title = f"无主星(借对宫【{'+'.join(opp_stars)}】)"
        elif s_tuple in ARCHETYPES:
            arch = ARCHETYPES[s_tuple]
            title = "+".join(stars)
        elif tuple(reversed(s_tuple)) in ARCHETYPES:
            arch = ARCHETYPES[tuple(reversed(s_tuple))]
            title = "+".join(stars)
        elif len(stars) == 1 and stars[0] in SINGLE_ARCHETYPES:
            arch = SINGLE_ARCHETYPES[stars[0]]
            title = f"{stars[0]}独坐"
        else:
            # Multi-star fallback
            matched_key = next((k for k in ARCHETYPES if set(k).issubset(set(stars))), None)
            if matched_key:
                arch = ARCHETYPES[matched_key]
                title = "+".join(stars)
            else:
                s0 = stars[0]
                arch = SINGLE_ARCHETYPES.get(s0, EMPTY_ARCHETYPE)
                title = "+".join(stars)

        canonical_144[entry_id] = {
            "id": entry_id,
            "chart": f"紫微在{zw}",
            "branch": b,
            "stars": stars,
            "title": f"{title} (紫微在{zw}局 · {b}宫)",
            "opposite_branch": opp_branch,
            "opposite_stars": opp_stars,
            "essence": arch["essence"],
            "modern_business": arch["modern_business"],
            "palace_applications": arch["palace_applications"],
            "breakthrough_action": arch["breakthrough_action"],
            "defensive_reframing": arch["defensive_reframing"],
        }
        count += 1

print(f"Generated {count} canonical star cluster entries.")

# Inject into knowledge_vault.json
VAULT_PATH = Path("/Users/hi/niuma/projects/obs_membership_rust/data/knowledge_vault.json")
with open(VAULT_PATH, "r", encoding="utf-8") as f:
    vault = json.load(f)

vault["canonical_144_star_clusters"] = canonical_144

with open(VAULT_PATH, "w", encoding="utf-8") as f:
    json.dump(vault, f, ensure_ascii=False, indent=2)

print(f"Successfully injected 144 star clusters into {VAULT_PATH} (Total keys: {len(vault)}).")
