// web_frontend/src/components/ziwei/vaultDomainData.ts - Canonical 12 Palaces Vault Guidelines (<= 250 lines)
// Strictly <= 250 lines. Zero Emoji. Zero Star icons.

export interface VaultDomainDef {
  title: string;
  coords: string;
  classicalSource: string;
  synergyCoords: string;
  synergyRules: string;
  rules: string;
}

export type DomainKey =
  | 'ming'
  | 'brother'
  | 'marriage'
  | 'children'
  | 'wealth'
  | 'health'
  | 'travel'
  | 'friends'
  | 'career'
  | 'property'
  | 'spirit'
  | 'parents';

export const VAULT_DOMAINS: Record<DomainKey, VaultDomainDef> = {
  ming: {
    title: '命宮 · 立命歸真與核心元神',
    coords: '命宮、身宮、三方四正主星星系、生年祿權科忌',
    classicalSource: '《紫微斗數全書·太微賦》《骨髓賦·立命論》',
    synergyCoords: '遷移宮(對衝表裡)、財帛宮(三合)、官祿宮(三合)、疾厄宮(一六共宗陰陽位)',
    synergyRules: '命遷一體為社會表裡；命財官三合定事業財富上限；命疾同源定體魄性情底色。',
    rules: '1. 命宮為一生人格底色與生命操作系統，主星廟旺見吉化主自主開創力強，見地空地劫主反潮流偏鋒探索；2. 命宮逢生年權主拓荒開疆，逢生年科主清譽自律，逢生年祿主福厚隨和，逢生年忌主執念深沉自我死磕；3. 命無主星借對宮遷移，身段靈活但需修煉內部定力。',
  },
  brother: {
    title: '兄弟宮 · 同儕競合與現金流蓄水池',
    coords: '兄弟宮、交友宮(對衝位)、田宅宮(財庫)、財帛之田宅位',
    classicalSource: '《斗數秘儀·財帛田宅篇》《中州派講義·兄弟宮篇》',
    synergyCoords: '僕役交友宮(對衝)、田宅宮(財庫)、財帛宮(財帛之田宅蓄水池)',
    synergyRules: '兄友線為眾生人脈利益損益軸；兄弟為流動資金池，兄友逢忌衝主短期現金流斷裂。',
    rules: '1. 兄弟宮在商戰數理中為「財帛之田宅」，代表企業與個人的流動資金池與短期現金儲備；2. 見祿存、天府主現金儲備充沛抗風險強；3. 見擎羊、化忌主現金流緊繃、同儕惡性競爭或受朋友借貸拖累；4. 兄弟宮化忌衝交友，主因利益分配與核心同儕翻臉。',
  },
  marriage: {
    title: '夫妻宮 · 婚戀正緣與親密同盟',
    coords: '夫妻宮、官祿宮(對衝位)、福德宮(氣數位)、天同/貪狼/廉貞/太陰',
    classicalSource: '《紫微斗數全書·論夫妻情緣》《欽天門大易源·夫官因果》',
    synergyCoords: '官祿宮(對衝相表裡)、福德宮(氣數位)、遷移宮(外遇桃花位)',
    synergyRules: '夫官一體互為因果，夫妻離心自化忌直射官祿主後院起火毀事業；福德為夫妻氣數定情緣長久。',
    rules: '1. 夫妻宮見生年祿或祿存主配偶自帶財庫聚寶盆；2. 見自化忌或生年忌主前世宿債、溝通錯位，忌出衝官祿嚴禁夫妻共同經商；3. 四煞入夫妻宮宜保持各自獨立事業物理空間，晚婚晚育以避刑傷；4. 向心自化入夫妻主宿命正緣牽引強烈。',
  },
  children: {
    title: '子女宮 · 早期孵化與後代門徒',
    coords: '子女宮、田宅宮(對衝位)、天同/天梁/化科/昌曲/巨門',
    classicalSource: '《紫微斗數全書·子女篇》《中州派深層講義·生殖與門徒》',
    synergyCoords: '田宅宮(子田對衝線)、交友宮(下屬衍生)、父母宮(代際傳承)',
    synergyRules: '子田線為資產動靜轉移之軸，子田逢忌衝主早期投資套牢、家宅變動、散夥析產。',
    rules: '1. 子女宮在商業推演中代表「早期天使投資、新項目孵化、下屬門生弟子」；2. 見吉化主後代聰慧貴顯、早期項目爆發力強；3. 子女宮化忌衝田宅主早期投資易套牢、家族析產離散；4. 見天魁天鉞陀羅主得力徒弟或後代晚得但有實權。',
  },
  wealth: {
    title: '財帛宮 · 進財通路與變現模式',
    coords: '財帛宮、命宮、官祿宮、田宅宮、武曲/太陰/天府/祿存',
    classicalSource: '《全書·財帛指南》《中州派玄空紫微·星系求財論》',
    synergyCoords: '福德宮(對衝求財心態位)、命宮(三合)、官祿宮(三合)、田宅宮(財庫歸宿)',
    synergyRules: '財福線定精神與金錢平衡，財帛化忌衝福德主求財極度焦慮失眠；財入田宅方為落袋真財。',
    rules: '1. 財帛宮代表現金收入模式與變現通路：武曲主實業金融，太陰主策劃營運，廉貞主偏財創意，貪狼主交際投機；2. 見地空地劫宜輕資產虛擬流轉，切忌死守實體；3. 見火貪鈴貪主爆發奇襲，見好就收；4. 財帛化忌衝福德主求財極度焦慮失眠，必須設死止損底線。',
  },
  health: {
    title: '疾厄宮 · 體魄氣血與身心隱疾',
    coords: '疾厄宮、父母宮(相衝位)、命宮主星五行、煞星落位',
    classicalSource: '《太微賦·星曜五行病灶》《中州派講義·疾厄篇》',
    synergyCoords: '父母宮(相衝文書相貌位)、命宮(一六共宗陰陽位)、田宅宮(身心居住氣場)',
    synergyRules: '父疾線為遺傳與情緒外化軸，逢忌衝防火熱急症與情緒抑鬱；命疾互照定體質壽算。',
    rules: '1. 天機逢煞防神經衰弱與失眠抑鬱；2. 巨門逢煞防消化道與隱性慢性病；3. 太陽逢煞防火熱心腦血管與眼目；4. 七殺破軍逢羊陀防火燙外傷與骨折，宜定期洗牙獻血以應血光；5. 疾厄宮化忌入命宮主身體有長期隱疾需內觀調和。',
  },
  travel: {
    title: '遷移宮 · 異地出海與社會舞台',
    coords: '遷移宮、命宮(對衝位)、父母宮(簽證法務)、太陽/天馬/破軍',
    classicalSource: '《骨髓賦·出外吉凶斷》《欽天四化·來因太極論》',
    synergyCoords: '命宮(對衝社會大舞台)、父母宮(出海簽證文書)、福德宮(外出享受因果)',
    synergyRules: '命遷對衝為天命機緣總樞紐，遷移見三奇祿馬主出外威震遠方；逢忌衝命主異地暗箭與水土不服。',
    rules: '1. 遷移宮為社會公共人際、異地開拓、出海跨國與天命來因之所；2. 見祿馬交馳或三奇嘉會，極其利於出海跨國、異地發跡與公信力傳播；3. 遷移宮化忌衝命宮，主異地水土不服、簽證受阻或外出遭小人暗算，宜立足熟悉領域；4. 坐紫微天相主出外得高位貴人庇護。',
  },
  friends: {
    title: '僕役宮 · 團隊協同與防背刺防線',
    coords: '僕役宮、兄弟宮(對衝位)、官祿宮、天機/巨門/火星/鈴星',
    classicalSource: '《全書·交友部屬論》《中州派講義·火鈴夾煞專論》',
    synergyCoords: '兄弟宮(對衝人脈軸)、官祿宮(業務協作合夥)、田宅宮(企業內部團隊)',
    synergyRules: '兄友線見火星鈴星相夾主團隊暗火叢生、親近夥伴背刺；交友化忌入官祿主股權爭議散夥。',
    rules: '1. 僕役宮代表合夥人圈層、外圍團隊、社群大眾與員工部屬；2. 僕役宮逢火星鈴星相夾(火鈴夾害)主團隊內部暗火湧動，防夥伴反目背刺；3. 僕役化忌入官祿或衝官祿，主合夥必生股權糾紛，嚴禁均等股權；4. 見天府天相多得忠實得力幹將。',
  },
  career: {
    title: '官祿宮 · 職場躍升與開疆破浪',
    coords: '官祿宮、命宮、財帛宮、夫妻宮(對衝位)、大限官祿',
    classicalSource: '《全書·官祿篇》《骨髓賦·火貪奇襲暴發》《斗數秘儀》',
    synergyCoords: '夫妻宮(對衝家庭防線)、命宮(三合)、財帛宮(三合)、遷移宮(行業外部大勢)',
    synergyRules: '夫官線對衝定公私平衡，官祿見火貪同宮主突發奇襲，但同逢旬空截路必須止盈落袋防暴破。',
    rules: '1. 官祿見祿權主自立門戶、行業領軍；2. 見機月同梁主大型機構、跨國公司高管幕僚；3. 見火貪同宮主奇襲暴發，突破力極強；4. 官祿逢截路旬空煞曜主暴發後需及時急流勇退固化底倉；5. 官祿化忌衝夫妻主事業動盪衝擊家庭婚姻。',
  },
  property: {
    title: '田宅宮 · 基業財庫與不動產沉澱',
    coords: '田宅宮、子女宮(對衝位)、財帛宮(財源)、太陰/太陽/天府/祿存',
    classicalSource: '《全書·田宅庫位賦》《中州派深層講義·日月同臨照壁篇》',
    synergyCoords: '子女宮(子田對衝線)、財帛宮(資金轉化)、疾厄宮(辦公物理環境)',
    synergyRules: '子田線為財庫總防線，日月同臨田宅主祖蔭沉澱，但生年忌入田宅主庫位承壓、置業多波折勞心。',
    rules: '1. 田宅宮為一生之「根本財庫、不動產物業、家宅氣運、家族祖蔭」；2. 日月同守田宅(日月照壁)主資產雄厚祖蔭深沉；3. 田宅坐生年忌主庫位承壓、家宅生變、置業勞心，不宜重資產加槓桿；4. 田宅化忌衝子女，主物業交易防產權陷阱與合同糾紛。',
  },
  spirit: {
    title: '福德宮 · 精神內核與因果福報',
    coords: '福德宮、財帛宮(對衝位)、命宮(身宮常居地)、武曲/天府/天相/地劫',
    classicalSource: '《全書·福德因果賦》《中州派玄空·身寄福德論》',
    synergyCoords: '財帛宮(對衝金錢焦慮)、命宮(精神自洽)、夫妻宮(情感氣數位)',
    synergyRules: '財福線主心神安頓，福德逢地劫天刑主超凡脫俗極利玄學創新，但逢煞忌衝財帛主物慾內耗。',
    rules: '1. 福德宮主精神世界、心理韌性、潛意識內耗、興趣嗜好與因果福澤，為身宮核心歸宿；2. 福德見生年科或天府主心寬福厚，內心有強大安頓之所；3. 見地劫、天刑主思維超凡脫俗、嗜好玄學形而上，但精神易感孤獨；4. 福德化忌衝財帛主因金錢焦慮嚴重吞噬生活品質。',
  },
  parents: {
    title: '父母宮 · 長輩恩庇與文書合規',
    coords: '父母宮、疾厄宮(對衝位)、天相(印星)/擎羊(刑星)/廉貞(囚星)',
    classicalSource: '《全書·父母文書賦》《斗數秘儀·刑囚夾印格專論》',
    synergyCoords: '疾厄宮(父疾對衝遺傳)、官祿宮(行政地位監管)、遷移宮(外部權威背書)',
    synergyRules: '父疾線主合規文書與官非名譽，見刑囚夾印主防合同陷阱、行政處罰與代簽連帶責任。',
    rules: '1. 父母宮代表父母長輩、體制監管、行政審批、文書公章、合同合規與名譽相貌；2. 見刑囚夾印或化忌衝疾厄，主防合同陷阱、合規灰色處罰與文書詞訟，所有文本嚴禁代簽字；3. 見天同、天梁吉化主深得體制長輩與貴人庇護。',
  },
};

export function detectDomainFromQuery(query: string): DomainKey | null {
  const q = query.toLowerCase();
  if (q.includes('命') || q.includes('天赋') || q.includes('性格') || q.includes('潜能') || q.includes('本质') || q.includes('操作系统') || q.includes('使命') || q.includes('自身')) {
    return 'ming';
  }
  if (q.includes('现金流') || q.includes('周转') || q.includes('储备') || q.includes('流动资金') || q.includes('手足') || q.includes('私董') || q.includes('借钱')) {
    return 'brother';
  }
  if (q.includes('婚') || q.includes('感情') || q.includes('另一半') || q.includes('恋爱') || q.includes('桃花') || q.includes('分手') || q.includes('离婚') || q.includes('老婆') || q.includes('老公') || q.includes('伴侣')) {
    return 'marriage';
  }
  if (q.includes('子女') || q.includes('孩子') || q.includes('怀孕') || q.includes('生子') || q.includes('后代') || q.includes('门徒') || q.includes('徒弟') || q.includes('天使轮') || q.includes('孵化')) {
    return 'children';
  }
  if (q.includes('财') || q.includes('钱') || q.includes('炒股') || q.includes('理财') || q.includes('收入') || q.includes('变现') || q.includes('盈利') || q.includes('暴富')) {
    return 'wealth';
  }
  if (q.includes('病') || q.includes('健康') || q.includes('身体') || q.includes('失眠') || q.includes('精神') || q.includes('抑郁') || q.includes('手术') || q.includes('气血') || q.includes('隐疾')) {
    return 'health';
  }
  if (q.includes('出海') || q.includes('移民') || q.includes('留学') || q.includes('签证') || q.includes('迁徙') || q.includes('搬家') || q.includes('异地') || q.includes('换城市') || q.includes('远行')) {
    return 'travel';
  }
  if (q.includes('合夥') || q.includes('股权') || q.includes('合伙') || q.includes('股东') || q.includes('拆伙') || q.includes('背叛') || q.includes('背刺') || q.includes('团队') || q.includes('下属') || q.includes('员工') || q.includes('朋友') || q.includes('人脉')) {
    return 'friends';
  }
  if (q.includes('工作') || q.includes('事业') || q.includes('创业') || q.includes('跳槽') || q.includes('升职') || q.includes('公司') || q.includes('赛道') || q.includes('官禄')) {
    return 'career';
  }
  if (q.includes('买房') || q.includes('房产') || q.includes('不动产') || q.includes('物业') || q.includes('田宅') || q.includes('财库') || q.includes('家产') || q.includes('祖产')) {
    return 'property';
  }
  if (q.includes('焦虑') || q.includes('内耗') || q.includes('心境') || q.includes('修行') || q.includes('迷茫') || q.includes('福德') || q.includes('爱好') || q.includes('因果') || q.includes('心灵')) {
    return 'spirit';
  }
  if (q.includes('父母') || q.includes('父亲') || q.includes('母亲') || q.includes('长辈') || q.includes('官司') || q.includes('诉讼') || q.includes('合同') || q.includes('侵权') || q.includes('法务') || q.includes('合规') || q.includes('公章')) {
    return 'parents';
  }
  return null;
}

