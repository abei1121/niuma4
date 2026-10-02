// web_frontend/src/components/ziwei/patternDetectorAuspicious.ts - Auspicious Pattern Detector (<= 250 lines)
// Strictly <= 250 lines. Zero Emoji. Zero Star icons.

import { SI_HUA_MAP, st } from './ziweiEngine';
import { DetectorContext } from './patternDetectorShared';

export function detectAuspiciousPatterns(ctx: DetectorContext): void {
  const { mingP, guanP, fuP, palaces, luStar, quanStar, keStar, jiStar, hasStar, hasMajor, hasInSanFang, addMatch } = ctx;

  // 1. 三奇嘉會格 (命宮或遷移宮三方四正齊會生年祿權科)
  if (luStar && quanStar && keStar) {
    if (hasInSanFang(luStar) && hasInSanFang(quanStar) && hasInSanFang(keStar)) {
      const hasJi = jiStar && hasInSanFang(jiStar);
      addMatch('SAN_QI_JIA_HUI', mingP.earthlyBranch, [luStar, quanStar, keStar], hasJi ? '生年祿權科會合(但逢生年忌衝照，吉處藏暗礁)' : undefined);
    } else if (ctx.oppP) {
      const oppP = ctx.oppP;
      const qianGuan = palaces.find((p: any) => p.index === (oppP.index + 4) % 12);
      const qianCai = palaces.find((p: any) => p.index === (oppP.index + 8) % 12);
      const qianSanFang = [oppP, mingP, qianGuan, qianCai].filter(Boolean);
      const hasInQian = (name: string) => qianSanFang.some((p: any) => hasStar(p, name));
      if (hasInQian(luStar) && hasInQian(quanStar) && hasInQian(keStar)) {
        addMatch('SAN_QI_JIA_HUI', oppP.earthlyBranch, [luStar, quanStar, keStar], `遷移宮(${oppP.earthlyBranch}宮)三方四正會齊生年祿權科(三奇坐遷移朝命，出外大吉威震遠方)`);
      }
    }
  }

  // 2. 火貪格 / 鈴貪格 (嚴格以貪狼所在宮位立極: 必須同宮或在貪狼自身三方四正照會)
  const tanP = palaces.find((p: any) => hasMajor(p, '貪狼') || hasStar(p, '貪狼'));
  if (tanP) {
    const oppTan = palaces.find((p: any) => p.index === (tanP.index + 6) % 12);
    const guanTan = palaces.find((p: any) => p.index === (tanP.index + 4) % 12);
    const caiTan = palaces.find((p: any) => p.index === (tanP.index + 8) % 12);
    const tanSanFang = [tanP, oppTan, guanTan, caiTan].filter(Boolean);
    const hasNearTan = (name: string) => tanSanFang.some((p: any) => hasStar(p, name));

    if (hasNearTan('火星')) {
      const isSame = hasStar(tanP, '火星');
      addMatch('HUO_TAN', tanP.earthlyBranch, ['貪狼', '火星'], isSame ? `【${st(tanP.name)}】(${tanP.earthlyBranch}宮)坐火貪同宮(正宗火貪暴發格，突破奇襲力極強)` : `火星於三方會照【${st(tanP.name)}】貪狼(火貪交會格)`);
    }
    if (hasNearTan('鈴星')) {
      const isSame = hasStar(tanP, '鈴星');
      addMatch('LING_TAN', tanP.earthlyBranch, ['貪狼', '鈴星'], isSame ? `【${st(tanP.name)}】(${tanP.earthlyBranch}宮)坐鈴貪同宮(正宗鈴貪暗發格，長線深謀)` : `鈴星於三方會照【${st(tanP.name)}】貪狼(鈴貪交會格)`);
    }
  }

  // 3. 日照雷門格 & 月朗天門格
  if (mingP.earthlyBranch === '卯' && hasMajor(mingP, '太陽')) addMatch('RI_ZHAO_LEI_MEN', '卯', ['太陽']);
  if (mingP.earthlyBranch === '亥' && hasMajor(mingP, '太陰')) addMatch('YUE_LANG_TIAN_MEN', '亥', ['太陰']);

  // 4. 日月並明格
  const sunP = palaces.find((p: any) => hasMajor(p, '太陽'));
  const moonP = palaces.find((p: any) => hasMajor(p, '太陰'));
  if (sunP && moonP) {
    const isSunBright = ['巳', '午', '辰', '卯'].includes(sunP.earthlyBranch);
    const isMoonBright = ['酉', '戌', '亥', '子'].includes(moonP.earthlyBranch);
    if (isSunBright && isMoonBright && (hasInSanFang('太陽') || hasInSanFang('太陰'))) {
      addMatch('RI_YUE_BING_MING', mingP.earthlyBranch, ['太陽', '太陰']);
    }
  }

  // 5. 巨日同宮格
  if (['寅', '申'].includes(mingP.earthlyBranch) && hasMajor(mingP, '太陽') && hasMajor(mingP, '巨門')) {
    addMatch('JU_RI_TONG_GONG', mingP.earthlyBranch, ['太陽', '巨門']);
  }

  // 6. 石中隱玉格
  if (['子', '午'].includes(mingP.earthlyBranch) && hasMajor(mingP, '巨門')) {
    const hasGoodMod = (luStar && hasInSanFang(luStar)) || (quanStar && hasInSanFang(quanStar)) || (keStar && hasInSanFang(keStar)) || hasInSanFang('祿存');
    if (hasGoodMod) addMatch('SHI_ZHONG_YIN_YU', mingP.earthlyBranch, ['巨門']);
  }

  // 7. 陽梁昌祿格
  if (hasInSanFang('太陽') && hasInSanFang('天梁') && hasInSanFang('文昌') && (hasInSanFang('祿存') || (luStar && hasInSanFang(luStar)))) {
    addMatch('YANG_LIANG_CHANG_LU', mingP.earthlyBranch, ['太陽', '天梁', '文昌', '祿存']);
  }

  // 8. 祿馬交馳格
  if ((hasInSanFang('祿存') || (luStar && hasInSanFang(luStar))) && hasInSanFang('天馬')) {
    addMatch('LU_MA_JIAO_CHI', mingP.earthlyBranch, ['祿存', '天馬']);
  } else if (fuP && (hasStar(fuP, '祿存') || (luStar && hasStar(fuP, luStar))) && hasStar(fuP, '天馬')) {
    addMatch('LU_MA_JIAO_CHI', fuP.earthlyBranch, ['祿存', '天馬'], '夫妻宮祿馬同鄉正照官祿(夫官線祿馬交馳)');
  } else if (guanP && fuP) {
    const guanHasMa = hasStar(guanP, '天馬');
    const fuHasLu = hasStar(fuP, '祿存') || (luStar && hasStar(fuP, luStar));
    const fuHasMa = hasStar(fuP, '天馬');
    const guanHasLu = hasStar(guanP, '祿存') || (luStar && hasStar(guanP, luStar));
    if ((guanHasMa && fuHasLu) || (fuHasMa && guanHasLu)) {
      addMatch('LU_MA_JIAO_CHI', guanP.earthlyBranch, ['天馬', '祿存'], '官祿與夫妻對宮祿馬交馳(正馬對正祿，因事業奔波而大發利市)');
    }
  }

  // 9. 紫府同宮格 & 極向離明格
  if (['寅', '申'].includes(mingP.earthlyBranch) && hasMajor(mingP, '紫微') && hasMajor(mingP, '天府')) {
    addMatch('ZI_FU_TONG_GONG', mingP.earthlyBranch, ['紫微', '天府']);
  }
  if (mingP.earthlyBranch === '午' && hasMajor(mingP, '紫微') && (mingP.majorStars || []).length === 1) {
    addMatch('JI_XIANG_LI_MING', '午', ['紫微']);
  }

  // 10. 七殺朝鬥格
  if (['子', '午', '寅', '申'].includes(mingP.earthlyBranch) && hasMajor(mingP, '七殺') && (mingP.majorStars || []).length === 1) {
    addMatch('QI_SHA_CHAO_DOU', mingP.earthlyBranch, ['七殺']);
  }

  // 11. 武貪同行格
  if (['丑', '未'].includes(mingP.earthlyBranch) && hasMajor(mingP, '武曲') && hasMajor(mingP, '貪狼')) {
    addMatch('WU_TAN_TONG_XING', mingP.earthlyBranch, ['武曲', '貪狼']);
  }

  // 12. 府相朝垣格
  if (hasInSanFang('天府') && (hasInSanFang('天相') || hasMajor(mingP, '天相'))) {
    addMatch('FU_XIANG_CHAO_YUAN', mingP.earthlyBranch, ['天府', '天相']);
  }

  // 13. 機梁加會格
  if (['辰', '戌'].includes(mingP.earthlyBranch) && hasMajor(mingP, '天機') && hasMajor(mingP, '天梁')) {
    addMatch('JI_LIANG_JIA_HUI', mingP.earthlyBranch, ['天機', '天梁']);
  }

  // 14. 昌曲同宮格
  if (hasStar(mingP, '文昌') && hasStar(mingP, '文曲')) {
    addMatch('CHANG_QU_TONG_GONG', mingP.earthlyBranch, ['文昌', '文曲']);
  }

  // 15. 輔弼拱命格
  if (hasInSanFang('左輔') && hasInSanFang('右弼')) {
    addMatch('FU_BI_GONG_MING', mingP.earthlyBranch, ['左輔', '右弼']);
  }

  // 16. 壽星入廟格
  if (['午', '子'].includes(mingP.earthlyBranch) && hasMajor(mingP, '天梁') && (mingP.majorStars || []).length === 1) {
    addMatch('SHOU_XING_RU_MIAO', mingP.earthlyBranch, ['天梁']);
  }

  // 17. 權祿巡逢格
  if (luStar && quanStar && hasInSanFang(luStar) && hasInSanFang(quanStar)) {
    addMatch('QUAN_LU_XUN_FENG', mingP.earthlyBranch, [luStar, quanStar]);
  }

  // 18. 雙祿朝垣格
  if (luStar && hasInSanFang('祿存') && hasInSanFang(luStar)) {
    addMatch('SHUANG_LU_CHAO_YUAN', mingP.earthlyBranch, ['祿存', luStar]);
  }

  // 19. 鴛鴦化祿格 (夫妻坐雙祿，或夫官互化祿)
  if (fuP) {
    const hasDoubleLuInFu = hasStar(fuP, '祿存') && (luStar && hasStar(fuP, luStar));
    if (hasDoubleLuInFu) {
      addMatch('YUAN_YANG_LU', fuP.earthlyBranch, ['祿存', luStar!], '夫妻宮坐生年祿與祿存(雙祿同宮鴛鴦祿，配偶自帶巨富聚寶盆)');
    } else if (guanP) {
      const fuStem = fuP.heavenlyStem;
      const guanStem = guanP.heavenlyStem;
      const fuSendsLu = SI_HUA_MAP[fuStem]?.[0];
      const guanSendsLu = SI_HUA_MAP[guanStem]?.[0];
      const isMutualLu = fuSendsLu && guanSendsLu && hasMajor(guanP, fuSendsLu) && hasMajor(fuP, guanSendsLu);
      if (isMutualLu) {
        addMatch('YUAN_YANG_LU', fuP.earthlyBranch, [fuSendsLu, guanSendsLu], '夫妻與官祿對宮互化向心祿(鴛鴦雙向飛祿，夫妻互為貴人聚寶盆)');
      }
    }
  }

  // 20. 明珠出海格
  if (['丑', '未'].includes(mingP.earthlyBranch) && (mingP.majorStars || []).length === 0) {
    const maoP = palaces.find((p: any) => p.earthlyBranch === '卯');
    const haiP = palaces.find((p: any) => p.earthlyBranch === '亥');
    if (maoP && haiP && hasMajor(maoP, '太陽') && hasMajor(haiP, '太陰')) {
      addMatch('MING_ZHU_CHU_HAI', mingP.earthlyBranch, ['太陽', '太陰'], `命無正曜在${mingP.earthlyBranch}，卯宮日照亥宮月朗並明朝照(明珠出海格)`);
    }
  }

  // 21. 君臣慶會格 & 貴星高照格
  if (hasMajor(mingP, '紫微')) {
    const goodCount = ['左輔', '右弼', '天魁', '天鉞', '文昌', '文曲'].filter(s => hasInSanFang(s)).length;
    if (goodCount >= 4) addMatch('JUN_CHEN_QING_HUI', mingP.earthlyBranch, ['紫微', '輔弼魁鉞昌曲']);
  }
  if ((hasMajor(mingP, '紫微') || hasMajor(mingP, '天府')) && ['左輔', '右弼', '天魁', '天鉞'].filter(s => hasInSanFang(s)).length >= 3) {
    addMatch('GUI_XING_GAO_ZHAO', mingP.earthlyBranch, ['紫微/天府', '諸吉']);
  }

  // 22. 天乙拱命格
  if (hasInSanFang('天魁') && hasInSanFang('天鉞')) {
    addMatch('TIAN_YI_GONG_MING', mingP.earthlyBranch, ['天魁', '天鉞']);
  }

  // 23. 丹墀桂墀格
  if (mingP.earthlyBranch === '巳' && hasMajor(mingP, '太陽')) {
    addMatch('DAN_CHI_GUI_CHI', '巳', ['太陽'], '太陽在巳宮坐命(丹墀格，早遂青雲之志)');
  } else if (mingP.earthlyBranch === '酉' && hasMajor(mingP, '太陰')) {
    addMatch('DAN_CHI_GUI_CHI', '酉', ['太陰'], '太陰在酉宮坐命(桂墀格，清貴顯達)');
  }

  // 24. 巨機同臨格
  if (['卯', '酉'].includes(mingP.earthlyBranch) && hasMajor(mingP, '巨門') && hasMajor(mingP, '天機')) {
    addMatch('JU_JI_TONG_LIN', mingP.earthlyBranch, ['巨門', '天機']);
  }

  // 25. 科名會祿格 & 甲第登庸格
  if (keStar && hasStar(mingP, keStar)) {
    if (hasInSanFang('祿存') || (luStar && hasInSanFang(luStar))) {
      addMatch('KE_MING_HUI_LU', mingP.earthlyBranch, [keStar, '祿']);
    }
    if (hasInSanFang('文昌') && hasInSanFang('文曲')) {
      addMatch('JIA_TIAN_CHENG_SHENG', mingP.earthlyBranch, [keStar, '文昌', '文曲']);
    }
  }

  // 26. 文星暗拱格
  if (hasInSanFang('文昌') && hasInSanFang('文曲') && !hasStar(mingP, '文昌') && !hasStar(mingP, '文曲')) {
    addMatch('WEN_XING_AN_GONG', mingP.earthlyBranch, ['文昌', '文曲']);
  }

  // 27. 祿合鴛鴦格 (命坐雙祿)
  if (hasStar(mingP, '祿存') && luStar && hasStar(mingP, luStar)) {
    addMatch('LU_HE_YUAN_YANG', mingP.earthlyBranch, ['祿存', luStar]);
  }
}
