// web_frontend/src/components/ziwei/factTreeQintian.ts - Pure Qintian Astrolabe Fact Tree (<= 250 lines)
import { st } from './ziweiEngine';
import { formatStarsWithZihua, isInnerPalace, computeTaiSuiYears, isLaiYinPalace, computeQintianDecadalEvents } from './factTreeShared';
import { generateTripleSuperpositionTree } from './factTreeTripleSuperposition';

export function generateQintianTree(ctx: any): string {
  const {
    input, raw, horoscope, birthYear,
    trueSolarTimeStr, offsetMinutes,
    lunarObj, lunarFP,
    birthYearStem, laiYinName, laiYinPalace, birthStars,
    birthSiHuaList, selfZihua, oppZihua, clashWarnings, flyOutNetwork,
    decadalTimeline
  } = ctx;

  const isInner = laiYinPalace ? isInnerPalace(laiYinPalace.name) : false;

  let out = `人生运势历紫微斗数排盘·钦天象数事实树（局域网推演总账）\n│\n`;
  out += `├符号定義说明\n`;
  out += `│ ├(↓: 本宫离心自化，气数外泄破耗)\n`;
  out += `│ ├(↑: 对宫向心自化，机缘天成引动)\n`;
  out += `│ ├(生年[祿/權/科/忌]: 生生世世注定之定数因果)\n`;
  out += `│ └(忌冲: 自化忌冲对宫，绝地破败之穴)\n│\n`;

  out += `├【一、天体历法与物理基准】\n`;
  out += `│ ├乾坤性别: ${input.gender}命\n`;
  out += `│ ├地理经度: ${input.longitude.toFixed(2)}°E\n`;
  out += `│ ├钟表时间: ${input.birthDate} ${input.birthTime}\n`;
  out += `│ ├真太阳时: ${trueSolarTimeStr} (物理时差修正: ${offsetMinutes > 0 ? '+' : ''}${offsetMinutes.toFixed(1)}分钟)\n`;
  out += `│ ├农历日期: ${lunarObj.getYearInGanZhi()}年 农历${lunarObj.getMonthInChinese()}月${lunarObj.getDayInChinese()}日\n`;
  out += `│ ├正统四柱: ${lunarFP}\n`;
  out += `│ ├五行局数: ${raw.fiveElementsClass}\n`;
  out += `│ ├生年天干: 天干【${birthYearStem}】\n`;
  out += `│ └来因定极: ${laiYinName} (一生因果总源头 · 属于【${isInner ? '六内宫·自主因果' : '六外宫·机缘牵引'}】)\n│\n`;

  if (horoscope) {
    const dH = horoscope.decadal;
    const yH = horoscope.yearly;
    const aH = horoscope.age;
    out += `├【二、当前时空限运动态坐标】\n`;
    if (dH) out += `│ ├当前大限: 走${dH.heavenlyStem || ''}${dH.earthlyBranch || ''}大限 · 运化[${(dH.mutagen || []).map((m: string) => st(m)).join(',')}]\n`;
    if (yH) out += `│ ├当前流年: 走${yH.heavenlyStem || ''}${yH.earthlyBranch || ''}流年 · 流化[${(yH.mutagen || []).map((m: string) => st(m)).join(',')}]\n`;
    if (aH) out += `│ └当前小限: 虚岁${aH.nominalAge}岁 · 落本命【${st(raw.palaces[aH.index]?.name || '')}】宫\n│\n`;
  }

  const decadalEvents = computeQintianDecadalEvents(decadalTimeline, birthYearStem, birthStars || []);

  out += `├【三、钦天门·象数因果先验总纲】\n`;
  out += `│ ├ 1. 来因定极: ${laiYinName} (一生因果与业力枢纽)\n`;
  out += `│ ├ 2. 生年四化定数: ${birthSiHuaList.join(' | ')}\n`;
  out += `│ ├ 3. 离心自化(↓气数外散): ${selfZihua.length > 0 ? selfZihua.join('; ') : '本盘无离心自化'}\n`;
  out += `│ ├ 4. 向心自化(↑机缘引动): ${oppZihua.length > 0 ? oppZihua.join('; ') : '本盘无向心自化'}\n`;
  out += `│ ├ 5. 宫干飞忌网络: ${flyOutNetwork.length > 0 ? flyOutNetwork.join('; ') : '气机平稳'}\n`;
  if (decadalEvents.length > 0) {
    out += `│ ├ 6. 钦天大限定数应期: ${decadalEvents.join('; ')}\n`;
  }
  out += `│ └ ${decadalEvents.length > 0 ? '7' : '6'}. 钦天绝对破耗警示: ${clashWarnings.length > 0 ? clashWarnings.join('; ') : '本盘无自化忌冲对宫之极端破败象'}\n│\n`;

  out += generateTripleSuperpositionTree(raw, 2026);

  out += `├【四、命盘十二宫全息明细 (钦天象数定数)】\n`;
  decadalTimeline.forEach((p: any) => {
    const oppIdx = (p.index + 6) % 12;
    const oppPalace = raw.palaces.find((op: any) => op.index === oppIdx);
    const oppStem = oppPalace ? oppPalace.heavenlyStem : '';

    const majorStr = formatStarsWithZihua(p.majorStars, p.heavenlyStem, oppStem);
    const minorStr = formatStarsWithZihua(p.minorStars, p.heavenlyStem, oppStem);
    const taiSuiYears = computeTaiSuiYears(birthYear, p.earthlyBranch);

    const isLaiYin = isLaiYinPalace(p, birthYearStem);
    const isCurDec = horoscope?.decadal?.index === p.index;
    const isCurYr = horoscope?.yearly?.index === p.index;
    const isCurAge = horoscope?.age?.index === p.index;

    out += `│ ├${st(p.name)}[${p.heavenlyStem}${p.earthlyBranch}]${isLaiYin ? ' [★来因宫]' : ''} (${p.decadal.range[0]}-${p.decadal.range[1]}岁)\n`;
    out += `│ │ ├十四主星: ${majorStr}\n`;
    out += `│ │ ├主要辅曜: ${minorStr}\n`;
    out += `│ │ ├大限时空: ${isCurDec ? `[当前大限] ` : ''}第${decadalTimeline.indexOf(p) + 1}大限 [${p.decadal.range[0]}-${p.decadal.range[1]}岁]\n`;
    out += `│ │ ├太岁流年: ${p.earthlyBranch}年 [${taiSuiYears.join(', ')}]${isCurYr ? ' [当前流年太岁落此宫]' : ''}\n`;
    out += `│ │ └小限虚岁: ${(p.ages || []).join(', ')} 岁${isCurAge ? ' [当前小限落此宫]' : ''}\n`;
    out += `│ │ \n`;
  });

  out += `└[钦天结论: 纯正象数因果定数，不含中州杂曜神煞]\n`;
  return out;
}
