// web_frontend/src/components/ziwei/patternRegistrySpecial.ts - 32 Special & Inauspicious Patterns (<= 250 lines)
// Strictly <= 250 lines. Zero Emoji. Zero Star icons.
import { AstrolabePatternDef } from './patternTypes';

export const SPECIAL_AND_INAUSPICIOUS_PATTERNS: Record<string, AstrolabePatternDef> = {
  // 12 特格
  JI_YUE_TONG_LIANG: {
    id: 'JI_YUE_TONG_LIANG', name: '機月同梁格', type: 'mixed',
    brief: '天機、太陰、天同、天梁齊會命宮三方四正',
    description: '邏輯周密，守成合規，極利體制內任職、跨國高管、技術幕僚與專業服務。',
    action: '依託成熟大平台借勢發展，深耕專業門檻，切忌舉債重資產盲目創業。',
  },
  MING_WU_ZHENG_YAO: {
    id: 'MING_WU_ZHENG_YAO', name: '命無正曜格', type: 'mixed',
    brief: '命宮無十四正曜主星，借對宮星曜推算',
    description: '身段靈活，極具彈性，擅長借力打力、借殼生蛋與多方資源整合。',
    action: '深度綁定強實力平台或領路人借勢前行，注重內部定力修煉防迷失。',
  },
  MA_TOU_DAI_JIAN: {
    id: 'MA_TOU_DAI_JIAN', name: '馬頭帶劍格', type: 'mixed',
    brief: '擎羊在午宮坐命',
    description: '凶星入廟險中求貴，吉則出將入相立大功，煞忌多則刑傷波折極重。',
    action: '宜從事技術攻堅、高度競爭、軍警律法等剛性領域，戒驕戒躁防傷殘。',
  },
  KONG_JIE_JIA_MING: {
    id: 'KONG_JIE_JIA_MING', name: '空劫夾命格', type: 'mixed',
    brief: '地空、地劫分居命宮兩鄰(父母、兄弟宮)夾命',
    description: '物質層面起伏劇烈或半空折翅，但在哲學宗教、前沿科技創新上有絕頂悟性。',
    action: '將創意轉化為專利或知識產權，個人資產配置穩健年金信托保底。',
  },
  RI_YUE_ZHAO_BI: {
    id: 'RI_YUE_ZHAO_BI', name: '日月照壁格', type: 'mixed',
    brief: '破軍在丑未坐命，太陽太陰在辰戌同照田宅宮',
    description: '主不動產家底深厚，祖蔭沉澱，在物業投資、園區營運上具備天然優勢。',
    action: '不動產產權設立信托隔離防護，破軍喜創新但切忌過度質押加重槓桿。',
  },
  MING_KONG_SHEN_JIE: {
    id: 'MING_KONG_SHEN_JIE', name: '命空身劫格', type: 'mixed',
    brief: '命宮坐地空，身宮坐地劫(或命劫身空)',
    description: '思維天馬行空反傳統，具極高玄學哲思與底層顛覆天賦；但人生起伏劇烈。',
    action: '深耕硬核技術與自主知識產權，收入強制劃撥保本隔離資產，不循常規自限。',
  },
  HUO_TAN_FENG_KONG: {
    id: 'HUO_TAN_FENG_KONG', name: '火貪逢空煞格', type: 'mixed',
    brief: '官祿火貪暴發格同宮逢旬空、截路或空亡煞曜',
    description: '事業奇襲暴發力極猛，但同宮逢空亡煞曜暗伏，最忌暴發後盲目連環加槓桿。',
    action: '暴發之時果斷階段性止盈落袋，將奇襲利潤轉入防守型底倉。',
  },
  YING_XING_RU_MIAO: {
    id: 'YING_XING_RU_MIAO', name: '英星入廟格', type: 'mixed',
    brief: '破軍在子午獨坐守命',
    description: '化耗為權，大將威嚴，破舊立新之拓荒主帥，擅長逆境重構落後體系。',
    action: '衝鋒在前但務必配備理性風控與CFO團隊，及時將戰果移交正規軍守成。',
  },
  TIAN_FU_CHAO_YUAN: {
    id: 'TIAN_FU_CHAO_YUAN', name: '天府朝垣格', type: 'mixed',
    brief: '天府獨守子午丑未，廉貞天相來會',
    description: '守財有道，食祿千鐘，供應鏈管理、實業倉儲與大型金融信貸中樞。',
    action: '保持嚴謹審計底線，在主營基本盤之外設立小規模創新天使基金對沖風險。',
  },
  TONG_LIANG_YIN_SHOU: {
    id: 'TONG_LIANG_YIN_SHOU', name: '同梁蔭福格', type: 'mixed',
    brief: '天同天梁同在申寅宮坐命',
    description: '福蔭深厚，一生多逢凶化吉，天生適合醫療保障、社會福利與公益事業。',
    action: '以利他之心經營長青事業，重大博弈適度讓利，將福氣轉化為公信力。',
  },
  WU_QU_CHAO_YUAN: {
    id: 'WU_QU_CHAO_YUAN', name: '武曲朝垣格', type: 'mixed',
    brief: '武曲在辰戌獨坐，對宮貪狼拱照',
    description: '財帛強硬，雷厲風行，大宗商品、金屬材料、銀行風控之硬派操盤手。',
    action: '切忌唯利益論得罪合作方，商業談判留一成利潤，建立長期生態聯盟。',
  },
  LIAN_ZHEN_QING_BAI: {
    id: 'LIAN_ZHEN_QING_BAI', name: '廉貞清白格', type: 'mixed',
    brief: '廉貞在寅申未逢祿存或天府無煞',
    description: '剛正不阿，清白立身，天生具備紀檢司法天賦，公信力與口碑極佳。',
    action: '嚴守法律合規底線，處事講求制度透明，不參與任何私下利益輸送。',
  },

  // 20 凶格 / 煞格
  LING_CHANG_TUO_WU: {
    id: 'LING_CHANG_TUO_WU', name: '鈴昌陀武格', type: 'inauspicious',
    brief: '鈴星、文昌、陀羅、武曲四曜齊會三方四正',
    description: '重大挫折與財務絕境凶格，若逢武曲化忌或限流引發，易陷絕境。',
    action: '嚴禁任何形式之高槓桿借貸與投機，逢凶運宜收縮防守、保本為王。',
  },
  JU_HUO_YANG: {
    id: 'JU_HUO_YANG', name: '巨火羊格', type: 'inauspicious',
    brief: '巨門、火星、擎羊齊會命宮或三方四正',
    description: '易發口舌是非、惡性訴訟或突發肢體損傷，言多必失防官非。',
    action: '凡事白紙黑字嚴守法規合約，克制情緒避免爭執，宜定時體檢洗牙。',
  },
  YANG_TUO_JIA_JI: {
    id: 'YANG_TUO_JIA_JI', name: '羊陀夾忌格', type: 'inauspicious',
    brief: '化忌坐命或重要宮位，左右兩鄰為擎羊陀羅相夾',
    description: '進退維谷，左右掣肘，能量受困如囚室，最忌衝動突圍反遭重創。',
    action: '切莫孤注一擲硬闖，宜低調蛰伏、尋求外部第三方資源斡旋破局。',
  },
  XING_QIU_JIA_YIN: {
    id: 'XING_QIU_JIA_YIN', name: '刑囚夾印格', type: 'inauspicious',
    brief: '天相與廉貞、擎羊同宮或會合相夾',
    description: '易受制度、法規、合同或他人過失牽連，引發官非詞訟或信用受損。',
    action: '嚴格審查一切法律文本，切忌為他人擔保或代簽字，遠離合規灰色地帶。',
  },
  HUO_LING_JIA_MING: {
    id: 'HUO_LING_JIA_MING', name: '火鈴夾命格', type: 'inauspicious',
    brief: '火星、鈴星分居命宮兩鄰(父母、兄弟宮)夾命',
    description: '早年成長環境動盪或精神壓力巨大，人生初期常感孤立無援。',
    action: '主動遠離原生家庭負能量場，獨立開拓人生天地，建立自我支持系統。',
  },
  JIE_KONG_ZHAO_MING: {
    id: 'JIE_KONG_ZHAO_MING', name: '劫空照命格', type: 'inauspicious',
    brief: '地空地劫同在命宮或三方四正對照拱衝',
    description: '財富如過眼雲煙，做事常半途生變，易在關鍵轉折點遭遇突發意外歸零。',
    action: '專注純腦力創作與專業技能，收入強制配置保本型金融資產或主權不動產。',
  },
  LIAN_SHA_KONG_WANG: {
    id: 'LIAN_SHA_KONG_WANG', name: '廉殺路上埋屍格', type: 'inauspicious',
    brief: '廉貞七殺同在丑未坐命，三方見擎羊陀羅化忌煞曜',
    description: '性格孤勇剛烈，古訣防路上埋屍，現代防交通事故或激烈商戰報復。',
    action: '嚴防疲勞駕駛與涉黑灰爭端，從事高技術職業化解煞氣，出差隨身防護。',
  },
  TAN_LANG_HUA_JI: {
    id: 'TAN_LANG_HUA_JI', name: '貪狼化忌奪命格', type: 'inauspicious',
    brief: '貪狼化忌守命宮或疾厄宮，三方見煞曜',
    description: '慾望受挫，防桃色陷阱、商業欺詐、名譽侵權或過度空虛導致精神重創。',
    action: '戒除不良嗜好，遠離高風險情感與投資騙局，將慾望轉移至文化藝術修煉。',
  },
  HUO_LING_JIA_PU_YI: {
    id: 'HUO_LING_JIA_PU_YI', name: '火鈴夾僕役格', type: 'inauspicious',
    brief: '火星鈴星分居僕役宮兩鄰相夾(火鈴夾害)',
    description: '交友合夥暗流洶湧，團隊內部易生突發暗火反目，極易遭遇合夥人背刺。',
    action: '合夥與團隊協同務必白紙黑字簽訂嚴苛權責協議，核心資產物理隔離。',
  },
  TIAN_ZHAI_HUA_JI: {
    id: 'TIAN_ZHAI_HUA_JI', name: '庫逢忌破格', type: 'inauspicious',
    brief: '生年化忌坐守田宅宮衝子女(庫衝外位)',
    description: '田宅為根本財庫，生年忌坐庫主家宅動盪、置業勞心承壓、家族緣分沉重。',
    action: '物業投資戒除過度槓桿與產權模糊，家宅環境保持清爽化解煞氣。',
  },
  FU_QI_ZI_HUA_JI_CHONG_GUAN: {
    id: 'FU_QI_ZI_HUA_JI_CHONG_GUAN', name: '自化忌衝事業格', type: 'inauspicious',
    brief: '夫妻宮離心自化忌直衝對宮官祿宮(夫官線忌出衝破)',
    description: '感情婚姻或核心內部合夥產生重大情緒內耗或利益分歧，氣數直衝事業。',
    action: '事業決策與私人情感嚴格物理隔離，重大股權設立婚變鎖定條款。',
  },
  LIANG_CHONG_HUA_GAI: {
    id: 'LIANG_CHONG_HUA_GAI', name: '兩重華蓋格', type: 'inauspicious',
    brief: '祿存與生年化忌同宮坐命或重要宮位',
    description: '羊陀夾忌且利祿成枷鎖，因貪暴利反成牢獄陷阱，常遭重大合規稽查。',
    action: '嚴格自查財稅合規，杜絕一切灰色返傭套現，堅決走陽光陽光坦途。',
  },
  HUO_YANG_GE: {
    id: 'HUO_YANG_GE', name: '火羊格(火擎格)', type: 'inauspicious',
    brief: '火星與擎羊同度或對衝守命',
    description: '性急如火，激烈衝撞，易在突發爭執中情緒失控傷人，防意外創傷。',
    action: '養成遇事深呼吸三分鐘再決策之習慣，透過高強度體能運動宣洩火氣。',
  },
  LING_TUO_GE: {
    id: 'LING_TUO_GE', name: '鈴陀格', type: 'inauspicious',
    brief: '鈴星與陀羅同度或對衝守命',
    description: '陰鷙暗耗，小人暗疾糾纏，常陷於長週期冷暴力、慢性心理壓抑。',
    action: '定期做深度微循環與防癌體檢，遇暗中小人果斷斷捨離不予糾纏。',
  },
  KONG_JIE_JIA_CAI: {
    id: 'KONG_JIE_JIA_CAI', name: '劫空夾財格', type: 'inauspicious',
    brief: '地空地劫分居子女疾厄二宮夾財帛宮',
    description: '財庫漏底，過手財空，帳面利潤可觀但實際資金如流水蒸發，呆帳多。',
    action: '建立剛性現款現貨結算紀律，應收帳款必須投保商業信用險保本。',
  },
  XING_CHONG_PO_HAO: {
    id: 'XING_CHONG_PO_HAO', name: '擎羊化忌衝命格', type: 'inauspicious',
    brief: '擎羊與生年或大運忌同度衝命或重要三方',
    description: '刀刃加霜，突發刑傷破敗，防行政重罰、資質被吊銷或突發重創。',
    action: '全面收縮激進戰線，主動配合行業監管合規自查，閉門靜修避風頭。',
  },
  JU_MEN_HUA_JI_SHA: {
    id: 'JU_MEN_HUA_JI_SHA', name: '巨門化忌暗害格', type: 'inauspicious',
    brief: '巨門化忌守命或官祿逢陰煞等暗曜',
    description: '是非滔天，遭惡性造謠誹謗、網絡暴力或商業競業不正當競爭暗害。',
    action: '聘請常年公關與名譽權維權律師，重要公開發言必經三審，慎言謹行。',
  },
  WEN_CHANG_HUA_JI_XIN: {
    id: 'WEN_CHANG_HUA_JI_XIN', name: '昌曲化忌違約格', type: 'inauspicious',
    brief: '文昌或文曲化忌守命、財帛或父母宮',
    description: '文書破損，合同違約陷阱，假合同暴雷或遭冒用簽名詐騙。',
    action: '重大商業交易實行雙律師交叉審核簽字，公證存證，確保法律程序閉環。',
  },
  TIAN_XING_SHA_CHONG: {
    id: 'TIAN_XING_SHA_CHONG', name: '天刑貫命格', type: 'inauspicious',
    brief: '天刑同擎羊逢煞入命或官祿',
    description: '刑憲加身，法網森嚴，極易觸犯行業反壟斷或非法經營合規紅線。',
    action: '設立獨立合規官一票否決權，所有業務開展前出具法律可行性意見書。',
  },
  BAI_HU_SANG_MEN: {
    id: 'BAI_HU_SANG_MEN', name: '喪吊臨限格', type: 'inauspicious',
    brief: '喪門吊客白虎天哭聚會限運父母或疾厄',
    description: '直系長輩健康危機、重大悼念，伴隨巨大精神哀傷與不可抗力虛耗。',
    action: '提前為全家直系長輩配置重疾意外險，定期陪同做深度全身體檢。',
  },
};
