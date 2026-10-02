// web_frontend/src/components/ziwei/patternDetectorSpecial.ts - Special and Inauspicious Pattern Detector (<= 250 lines)
// Strictly <= 250 lines. Zero Emoji. Zero Star icons.

import { st, SI_HUA_MAP } from './ziweiEngine';
import { DetectorContext } from './patternDetectorShared';

export function detectSpecialAndInauspiciousPatterns(ctx: DetectorContext): void {
  const { mingP, bodyP, guanP, fuP, palaces, luStar, jiStar, parentP, brotherP, hasStar, hasMajor, hasInSanFang, addMatch } = ctx;

  // 1. 機月同梁格
  const jytlCount = ['天機', '太陰', '天同', '天梁'].filter(s => hasInSanFang(s)).length;
  if (jytlCount >= 3 && ['天機', '太陰', '天同', '天梁'].some(s => hasMajor(mingP, s))) {
    addMatch('JI_YUE_TONG_LIANG', mingP.earthlyBranch, ['天機', '太陰', '天同', '天梁']);
  }

  // 2. 命無正曜格
  if ((mingP.majorStars || []).length === 0) {
    addMatch('MING_WU_ZHENG_YAO', mingP.earthlyBranch, ['無主星']);
  }

  // 3. 馬頭帶劍格
  if (mingP.earthlyBranch === '午' && hasStar(mingP, '擎羊')) {
    addMatch('MA_TOU_DAI_JIAN', '午', ['擎羊']);
  }

  // 4. 空劫夾命格 & 火鈴夾命格
  if (parentP && brotherP) {
    if ((hasStar(parentP, '地空') && hasStar(brotherP, '地劫')) || (hasStar(parentP, '地劫') && hasStar(brotherP, '地空'))) {
      addMatch('KONG_JIE_JIA_MING', mingP.earthlyBranch, ['地空', '地劫']);
    }
    if ((hasStar(parentP, '火星') && hasStar(brotherP, '鈴星')) || (hasStar(parentP, '鈴星') && hasStar(brotherP, '火星'))) {
      addMatch('HUO_LING_JIA_MING', mingP.earthlyBranch, ['火星', '鈴星']);
    }
  }

  // 5. 命空身劫格 (命坐地空身坐地劫，或命劫身空)
  if (bodyP) {
    const mingHasKong = hasStar(mingP, '地空');
    const mingHasJie = hasStar(mingP, '地劫');
    const bodyHasKong = hasStar(bodyP, '地空');
    const bodyHasJie = hasStar(bodyP, '地劫');
    if ((mingHasKong && bodyHasJie) || (mingHasJie && bodyHasKong)) {
      addMatch('MING_KONG_SHEN_JIE', mingP.earthlyBranch, ['地空', '地劫'], `命宮坐${mingHasKong ? '地空' : '地劫'}，身宮【${st(bodyP.name)}】坐${bodyHasJie ? '地劫' : '地空'}(命空身劫反潮流，利顛覆創新玄學，防半空折翅)`);
    }
  }

  // 6. 日月照壁格 (日月同在丑未照對宮田宅，或日月居田宅照命)
  const tianZhaiP = palaces.find((p: any) => st(p.name).includes('田宅'));
  if (tianZhaiP) {
    const oppTianZhai = palaces.find((p: any) => p.index === (tianZhaiP.index + 6) % 12);
    const hasSunMoonInTian = hasMajor(tianZhaiP, '太陽') && hasMajor(tianZhaiP, '太陰');
    const hasSunMoonInOpp = oppTianZhai && hasMajor(oppTianZhai, '太陽') && hasMajor(oppTianZhai, '太陰');
    if ((hasSunMoonInTian || hasSunMoonInOpp) && ['丑', '未', '辰', '戌'].includes(tianZhaiP.earthlyBranch)) {
      const desc = hasSunMoonInTian
        ? `太陽太陰同守【${st(tianZhaiP.name)}】(${tianZhaiP.earthlyBranch}宮)(日月同臨田宅日月照壁，主資產雄厚金玉滿堂)`
        : `日月並明坐對宮照【${st(tianZhaiP.name)}】(玉璧生輝，主產業豐盛祖蔭深厚)`;
      addMatch('RI_YUE_ZHAO_BI', tianZhaiP.earthlyBranch, ['太陽', '太陰'], desc);
    }
  }

  // 7. 鈴昌陀武格 (凶局)
  if (hasInSanFang('鈴星') && hasInSanFang('文昌') && hasInSanFang('陀羅') && hasInSanFang('武曲')) {
    addMatch('LING_CHANG_TUO_WU', mingP.earthlyBranch, ['鈴星', '文昌', '陀羅', '武曲']);
  }

  // 8. 巨火羊格 (凶局)
  if (hasInSanFang('巨門') && hasInSanFang('火星') && hasInSanFang('擎羊')) {
    addMatch('JU_HUO_YANG', mingP.earthlyBranch, ['巨門', '火星', '擎羊']);
  }

  // 9. 羊陀夾忌格 (凶局: 深度檢測生年忌與自化忌/祿逢衝破)
  palaces.forEach((p: any) => {
    const pIdx = p.index;
    const leftP = palaces.find((lp: any) => lp.index === (pIdx + 1) % 12);
    const rightP = palaces.find((rp: any) => rp.index === (pIdx + 11) % 12);
    const hasYangTuoClamp = (hasStar(leftP, '擎羊') && hasStar(rightP, '陀羅')) || (hasStar(leftP, '陀羅') && hasStar(rightP, '擎羊'));
    if (hasYangTuoClamp) {
      const hasShengNianJi = jiStar && hasStar(p, jiStar);
      const pStem = p.heavenlyStem;
      const pStemJiStar = SI_HUA_MAP[pStem]?.[3];
      const hasZiHuaJi = pStemJiStar && hasStar(p, pStemJiStar);
      if (hasShengNianJi || hasZiHuaJi) {
        const hasLu = (luStar && hasStar(p, luStar)) || hasStar(p, '祿存');
        const desc = hasLu
          ? `【${st(p.name)}】(${p.earthlyBranch}宮)坐祿逢自化忌，且左右逢擎羊陀羅夾制(祿逢衝破成羊陀夾忌，進退維谷)`
          : `【${st(p.name)}】(${p.earthlyBranch}宮)坐化忌逢擎羊陀羅左右夾制(羊陀夾忌，能量受困如囚)`;
        addMatch('YANG_TUO_JIA_JI', p.earthlyBranch, ['擎羊', '陀羅', hasShengNianJi ? jiStar! : pStemJiStar!], desc);
      }
    }
  });

  // 10. 火鈴夾僕役格 (凶局)
  const puYiP = palaces.find((p: any) => st(p.name).includes('僕役') || st(p.name).includes('仆役') || st(p.name).includes('交友'));
  if (puYiP) {
    const pIdx = puYiP.index;
    const leftP = palaces.find((lp: any) => lp.index === (pIdx + 1) % 12);
    const rightP = palaces.find((rp: any) => rp.index === (pIdx + 11) % 12);
    const isHuoLingClamped = (hasStar(leftP, '火星') && hasStar(rightP, '鈴星')) || (hasStar(leftP, '鈴星') && hasStar(rightP, '火星'));
    if (isHuoLingClamped) {
      addMatch('HUO_LING_JIA_PU_YI', puYiP.earthlyBranch, ['火星', '鈴星'], `僕役宮(${puYiP.earthlyBranch}宮)逢左右火星鈴星夾制(火鈴夾害，合夥團隊防暗火倒戈背刺)`);
    }
  }

  // 11. 庫逢忌破格 (生年忌入田宅衝子女)
  if (tianZhaiP && jiStar && hasStar(tianZhaiP, jiStar)) {
    addMatch('TIAN_ZHAI_HUA_JI', tianZhaiP.earthlyBranch, [jiStar], `生年【${jiStar}化忌】坐守田宅宮衝對宮子女(財庫承壓，置業多波折，家庭長輩責任沉重)`);
  }

  // 12. 火貪逢空煞格
  if (guanP && hasMajor(guanP, '貪狼') && hasStar(guanP, '火星')) {
    const hasKongSha = hasStar(guanP, '旬空') || hasStar(guanP, '截路') || hasStar(guanP, '截空') || hasStar(guanP, '陰煞');
    if (hasKongSha) {
      addMatch('HUO_TAN_FENG_KONG', guanP.earthlyBranch, ['貪狼', '火星', '空煞'], `官祿火貪暴發同宮見旬空、截路、陰煞(火貪逢空暴發防暴破，切忌盲目戀戰，務必階段止盈)`);
    }
  }

  // 13. 自化忌衝事業格 (夫妻離心自化忌衝官祿)
  if (fuP) {
    const pStem = fuP.heavenlyStem;
    const pStemJiStar = SI_HUA_MAP[pStem]?.[3];
    if (pStemJiStar && hasStar(fuP, pStemJiStar)) {
      addMatch('FU_QI_ZI_HUA_JI_CHONG_GUAN', fuP.earthlyBranch, [pStemJiStar, '自化忌'], `夫妻宮廉貞自化忌(離心忌出)，氣數外洩直衝對宮【官祿】(防情感利益內耗反噬事業)`);
    }
  }

  // 14. 刑囚夾印格 (凶局)
  if (hasStar(mingP, '天相') && (hasStar(mingP, '廉貞') || hasInSanFang('廉貞')) && (hasStar(mingP, '擎羊') || hasInSanFang('擎羊'))) {
    addMatch('XING_QIU_JIA_YIN', mingP.earthlyBranch, ['天相', '廉貞', '擎羊']);
  }

  // 15. 劫空照命格 (凶局)
  if (hasInSanFang('地空') && hasInSanFang('地劫')) {
    addMatch('JIE_KONG_ZHAO_MING', mingP.earthlyBranch, ['地空', '地劫']);
  }

  // 16. 廉殺埋屍防險格 (凶局)
  if (['丑', '未'].includes(mingP.earthlyBranch) && hasMajor(mingP, '廉貞') && hasMajor(mingP, '七殺')) {
    const hasSha = hasInSanFang('擎羊') || hasInSanFang('陀羅') || (jiStar && hasInSanFang(jiStar));
    if (hasSha) {
      addMatch('LIAN_SHA_KONG_WANG', mingP.earthlyBranch, ['廉貞', '七殺']);
    }
  }

  // 17. 貪狼化忌奪命格 (凶局)
  if (jiStar === '貪狼') {
    const tanP = palaces.find((p: any) => hasStar(p, '貪狼'));
    if (tanP && (st(tanP.name).includes('命') || st(tanP.name).includes('疾厄') || st(tanP.name).includes('福德'))) {
      addMatch('TAN_LANG_HUA_JI', tanP.earthlyBranch, ['貪狼', '化忌'], `貪狼生年忌落【${st(tanP.name)}】`);
    }
  }

  // 18. 英星入廟格
  if (['子', '午'].includes(mingP.earthlyBranch) && hasMajor(mingP, '破軍') && (mingP.majorStars || []).length === 1) {
    addMatch('YING_XING_RU_MIAO', mingP.earthlyBranch, ['破軍']);
  }

  // 19. 天府朝垣格 & 武曲朝垣格
  if (['子', '午', '丑', '未'].includes(mingP.earthlyBranch) && hasMajor(mingP, '天府') && (mingP.majorStars || []).length === 1) {
    addMatch('TIAN_FU_CHAO_YUAN', mingP.earthlyBranch, ['天府']);
  }
  if (['辰', '戌'].includes(mingP.earthlyBranch) && hasMajor(mingP, '武曲') && (mingP.majorStars || []).length === 1) {
    addMatch('WU_QU_CHAO_YUAN', mingP.earthlyBranch, ['武曲']);
  }

  // 20. 同梁蔭福格
  if (['寅', '申'].includes(mingP.earthlyBranch) && hasMajor(mingP, '天同') && hasMajor(mingP, '天梁')) {
    addMatch('TONG_LIANG_YIN_SHOU', mingP.earthlyBranch, ['天同', '天梁']);
  }

  // 21. 廉貞清白格
  if (['寅', '申', '未'].includes(mingP.earthlyBranch) && hasMajor(mingP, '廉貞')) {
    if (hasStar(mingP, '祿存') || (luStar && hasStar(mingP, luStar)) || hasMajor(mingP, '天府')) {
      if (!hasInSanFang('擎羊') && !hasInSanFang('陀羅') && !hasInSanFang('火星') && !hasInSanFang('鈴星')) {
        addMatch('LIAN_ZHEN_QING_BAI', mingP.earthlyBranch, ['廉貞', '祿/府']);
      }
    }
  }

  // 22. 兩重華蓋格 (凶局: 祿存逢生年忌)
  if (hasStar(mingP, '祿存') && jiStar && hasStar(mingP, jiStar)) {
    addMatch('LIANG_CHONG_HUA_GAI', mingP.earthlyBranch, ['祿存', jiStar]);
  }

  // 23. 火羊格 & 鈴陀格 (凶煞)
  if (hasStar(mingP, '火星') && hasStar(mingP, '擎羊')) {
    addMatch('HUO_YANG_GE', mingP.earthlyBranch, ['火星', '擎羊']);
  }
  if (hasStar(mingP, '鈴星') && hasStar(mingP, '陀羅')) {
    addMatch('LING_TUO_GE', mingP.earthlyBranch, ['鈴星', '陀羅']);
  }

  // 24. 劫空夾財格 (凶局)
  const caiP = palaces.find((p: any) => st(p.name).includes('財帛'));
  if (caiP) {
    const leftP = palaces.find((lp: any) => lp.index === (caiP.index + 1) % 12);
    const rightP = palaces.find((rp: any) => rp.index === (caiP.index + 11) % 12);
    if ((hasStar(leftP, '地空') && hasStar(rightP, '地劫')) || (hasStar(leftP, '地劫') && hasStar(rightP, '地空'))) {
      addMatch('KONG_JIE_JIA_CAI', caiP.earthlyBranch, ['地空', '地劫'], '財帛宮逢地空地劫左右夾制(劫空夾財，財庫漏底)');
    }
  }

  // 25. 巨門化忌暗害格 & 昌曲化忌違約格
  if (jiStar === '巨門' && (hasStar(mingP, '巨門') || hasInSanFang('巨門'))) {
    addMatch('JU_MEN_HUA_JI_SHA', mingP.earthlyBranch, ['巨門', '化忌']);
  }
  if ((jiStar === '文昌' || jiStar === '文曲') && (hasStar(mingP, jiStar) || (parentP && hasStar(parentP, jiStar)))) {
    addMatch('WEN_CHANG_HUA_JI_XIN', mingP.earthlyBranch, [jiStar, '化忌']);
  }

  // 26. 天刑貫命格
  if (hasStar(mingP, '天刑') && (hasStar(mingP, '擎羊') || hasStar(mingP, '陀羅') || hasStar(mingP, '火星'))) {
    addMatch('TIAN_XING_SHA_CHONG', mingP.earthlyBranch, ['天刑', '煞星']);
  }
}
