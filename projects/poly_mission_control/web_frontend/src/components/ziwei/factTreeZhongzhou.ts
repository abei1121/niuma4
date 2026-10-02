// web_frontend/src/components/ziwei/factTreeZhongzhou.ts - Pure Zhongzhou Astrolabe Fact Tree (<= 250 lines)
import { st } from './ziweiEngine';
import { formatStarsZhongzhou, computeTaiSuiYears } from './factTreeShared';
import { detectAstrolabePatterns, formatPatternsForFactTree } from './patternDetector';

export function generateZhongzhouTree(ctx: any): string {
  const {
    input, raw, horoscope, birthYear,
    trueSolarTimeStr, offsetMinutes,
    lunarObj, lunarFP, solarTermsFP,
    bodyPalaceStr, ziYearDouJun,
    mingP, oppP, guanP, caiP,
    fmtPStars, getGoodStars, getBadStars,
    decadalTimeline, birthYearStem
  } = ctx;

  const patterns = birthYearStem ? detectAstrolabePatterns(raw.palaces, birthYearStem) : [];

  let out = `人生运势历紫微斗数排盘·中州星系事实树（局域网推演总账）\n│\n`;
  out += `├【一、天体历法与物理基准】\n`;
  out += `│ ├乾坤性别: ${input.gender}命\n`;
  out += `│ ├地理经度: ${input.longitude.toFixed(2)}°E\n`;
  out += `│ ├钟表时间: ${input.birthDate} ${input.birthTime}\n`;
  out += `│ ├真太阳时: ${trueSolarTimeStr} (物理时差修正: ${offsetMinutes > 0 ? '+' : ''}${offsetMinutes.toFixed(1)}分钟)\n`;
  out += `│ ├农历日期: ${lunarObj.getYearInGanZhi()}年 农历${lunarObj.getMonthInChinese()}月${lunarObj.getDayInChinese()}日\n`;
  out += `│ ├正统四柱: ${lunarFP} (正统紫微正月初一换年)\n`;
  out += `│ ├节气四柱: ${solarTermsFP} (传统八字立春换年)\n`;
  out += `│ ├五行局数: ${raw.fiveElementsClass}\n`;
  out += `│ ├命主星曜: ${st(raw.soul)}\n`;
  out += `│ ├身主星曜: ${st(raw.body)}\n`;
  out += `│ ├身宫寄处: ${bodyPalaceStr} (中州派后天立极重镇，35岁后人生发力重心)\n`;
  out += `│ └子年斗君: 落【${ziYearDouJun}】宫\n│\n`;

  if (horoscope) {
    const dH = horoscope.decadal;
    const yH = horoscope.yearly;
    const aH = horoscope.age;
    const mH = horoscope.monthly;
    const dlyH = horoscope.daily;
    out += `├【二、当前时空限运动态坐标】\n`;
    if (dH) {
      const decP = raw.palaces.find((p: any) => p.index === dH.index);
      const decName = decP ? ` · 叠本命【${st(decP.name)}】` : '';
      out += `│ ├当前大限: 走${dH.heavenlyStem || ''}${dH.earthlyBranch || ''}大限${decName} · 运化[${(dH.mutagen || []).map((m: string) => st(m)).join(',')}]\n`;
    }
    if (yH) {
      const yrP = raw.palaces.find((p: any) => p.index === yH.index);
      const yrName = yrP ? ` · 叠本命【${st(yrP.name)}】` : '';
      out += `│ ├当前流年: 走${yH.heavenlyStem || ''}${yH.earthlyBranch || ''}流年${yrName} · 流化[${(yH.mutagen || []).map((m: string) => st(m)).join(',')}]\n`;
    }
    if (aH) {
      const ageP = raw.palaces.find((p: any) => p.index === aH.index);
      out += `│ ├当前小限: 虚岁${aH.nominalAge}岁 · 落本命【${ageP ? st(ageP.name) : ''}】宫\n`;
    }
    if (mH && mH.heavenlyStem) {
      const mP = raw.palaces.find((p: any) => p.index === mH.index);
      out += `│ ├当前流月: ${mH.heavenlyStem}${mH.earthlyBranch}流月 · 叠本命【${mP ? st(mP.name) : ''}】\n`;
    }
    if (dlyH && dlyH.heavenlyStem) {
      const dP = raw.palaces.find((p: any) => p.index === dlyH.index);
      out += `│ └当前流日: ${dlyH.heavenlyStem}${dlyH.earthlyBranch}流日 · 叠本命【${dP ? st(dP.name) : ''}】\n`;
    }
    out += `│\n`;
  }

  out += `├【三、中州派·三方四正星系格局总纲】\n`;
  if (patterns.length > 0) {
    out += `│ ├ 0. 格局定品: ${formatPatternsForFactTree(patterns)}\n`;
  }
  out += `│ ├ 1. 命宫[${mingP?.earthlyBranch || ''}]: ${fmtPStars(mingP)} (六吉: ${getGoodStars(mingP).join(',') || '无'}, 六煞: ${getBadStars(mingP).join(',') || '无'})\n`;
  out += `│ ├ 2. 迁移宫[${oppP?.earthlyBranch || ''}]: ${fmtPStars(oppP)} (对宫照临; 六吉: ${getGoodStars(oppP).join(',') || '无'}, 六煞: ${getBadStars(oppP).join(',') || '无'})\n`;
  out += `│ ├ 3. 官禄宫[${guanP?.earthlyBranch || ''}]: ${fmtPStars(guanP)} (事业会合; 六吉: ${getGoodStars(guanP).join(',') || '无'}, 六煞: ${getBadStars(guanP).join(',') || '无'})\n`;
  out += `│ ├ 4. 财帛宫[${caiP?.earthlyBranch || ''}]: ${fmtPStars(caiP)} (进财会合; 六吉: ${getGoodStars(caiP).join(',') || '无'}, 六煞: ${getBadStars(caiP).join(',') || '无'})\n`;
  out += `│ └ 5. 身宫立极: ${bodyPalaceStr} (后天行事趋向与归宿)\n│\n`;

  out += `├【四、八十年大限跌宕全景时空表】\n`;
  decadalTimeline.forEach((dp: any, i: number) => {
    const majors = dp.majorStars.map((s: any) => `${st(s.name)}[${st(s.brightness || '平')}]`).join(',') || '空宫借对宫';
    out += `│ ├第${i + 1}大限 [${dp.decadal.range[0]}-${dp.decadal.range[1]}岁]: 走【${st(dp.name)}·${dp.heavenlyStem}${dp.earthlyBranch}】· 主星: ${majors}\n`;
  });
  out += `│\n`;

  out += `├【五、命盘十二宫全息明细 (中州星系格局)】\n`;
  decadalTimeline.forEach((p: any) => {
    const majorStr = formatStarsZhongzhou(p.majorStars);
    const minorStr = formatStarsZhongzhou(p.minorStars);
    const adjStr = (p.adjectiveStars || []).map((s: any) => st(s.name)).join(',') || '无';

    const cs = st(p.changsheng12 || '');
    const bs = st(p.boshi12 || '');
    const sq = st(p.suiqian12 || '');
    const jq = st(p.jiangqian12 || '');

    out += `│ ├${st(p.name)}[${p.heavenlyStem}${p.earthlyBranch}]${p.isBodyPalace ? ' [★身宫]' : ''} (${p.decadal.range[0]}-${p.decadal.range[1]}岁)\n`;

    if (horoscope) {
      const decRole = horoscope.decadal?.palaceNames?.[p.index];
      const yrRole = horoscope.yearly?.palaceNames?.[p.index];
      const ageRole = horoscope.age?.palaceNames?.[p.index];
      if (decRole && yrRole && ageRole) {
        out += `│ │ ├限流四重叠宫: 本命[${st(p.name)}] · 叠大限[${st(decRole)}] · 叠流年[${st(yrRole)}] · 叠小限[${st(ageRole)}]\n`;
      }
      const decStars = horoscope.decadal?.stars?.[p.index]?.map((s: any) => st(s.name)).join(',') || '';
      const yrStars = horoscope.yearly?.stars?.[p.index]?.map((s: any) => st(s.name)).join(',') || '';
      if (decStars) out += `│ │ ├大限流曜照临: ${decStars}\n`;
      if (yrStars) out += `│ │ ├流年流曜照临: ${yrStars}\n`;
    }

    const taiSuiYears = computeTaiSuiYears(birthYear, p.earthlyBranch);
    const isCurYr = horoscope?.yearly?.index === p.index;
    const isCurAge = horoscope?.age?.index === p.index;

    out += `│ │ ├十四主星: ${majorStr}\n`;
    out += `│ │ ├吉凶辅星: ${minorStr}\n`;
    out += `│ │ ├杂曜小星: ${adjStr}\n`;
    out += `│ │ ├神煞系统: [长生十二神: ${cs}] · [博士十二神: ${bs}] · [岁前十二神: ${sq}] · [将前十二神: ${jq}]\n`;
    out += `│ │ ├太岁流年: ${p.earthlyBranch}年 [${taiSuiYears.join(', ')}]${isCurYr ? ' [当前流年太岁落此宫]' : ''}\n`;
    out += `│ │ └小限虚岁: ${(p.ages || []).join(', ')} 岁${isCurAge ? ' [当前小限落此宫]' : ''}\n`;
    out += `│ │ \n`;
  });

  out += `└[中州结论: 纯正星系格局、四重叠盘与神煞流曜，零象数自化干扰]\n`;
  return out;
}
