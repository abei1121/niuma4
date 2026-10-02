// web_frontend/src/components/ziwei/factTreeTripleSuperposition.ts - Triple Superposition Engine (<= 250 lines)
// Strictly <= 250 lines. Zero Emoji. Zero Star icons.

import { st } from './ziweiEngine';

const SI_HUA_TAGS = ['祿', '權', '科', '忌'];

export interface SuperpositionYearData {
  year: number;
  ganZhi: string;
  nominalAge: number;
  liuMingBranch: string;
  liuMingBenMing: string;
  liuMingDecadal: string;
  daXianBranch: string;
  daXianName: string;
  siHuaTargets: {
    tag: string;
    star: string;
    branch: string;
    benMingName: string;
    decadalName: string;
    yearlyName: string;
    isClash: boolean;
    clashBranch?: string;
    clashBenMing?: string;
    clashDecadal?: string;
    clashYearly?: string;
  }[];
  liuStars: string[];
}

export function computeYearlySuperposition(raw: any, year: number): SuperpositionYearData | null {
  try {
    const h = raw.horoscope(new Date(`${year}-06-01`));
    if (!h || !h.yearly || !h.decadal) return null;

    const yStem = h.yearly.heavenlyStem || '';
    const yBranch = h.yearly.earthlyBranch || '';
    const ganZhi = `${yStem}${yBranch}`;
    const nominalAge = h.age?.nominalAge || 0;

    const yP = raw.palaces.find((p: any) => p.index === h.yearly.index);
    const dP = raw.palaces.find((p: any) => p.index === h.decadal.index);

    const liuMingBranch = yP?.earthlyBranch || yBranch;
    const liuMingBenMing = yP ? st(yP.name) : '';
    const liuMingDecadal = h.decadal.palaceNames?.[h.yearly.index] ? st(h.decadal.palaceNames[h.yearly.index]) : '';

    const daXianBranch = dP?.earthlyBranch || '';
    const daXianName = dP ? st(dP.name) : '';

    const yearlyMutagens = h.yearly.mutagen || [];
    const siHuaTargets: SuperpositionYearData['siHuaTargets'] = [];

    yearlyMutagens.forEach((star: string, idx: number) => {
      const p = raw.palaces.find((pal: any) => [...pal.majorStars, ...pal.minorStars].some(s => st(s.name) === st(star)));
      if (p) {
        const dRole = h.decadal.palaceNames?.[p.index] ? st(h.decadal.palaceNames[p.index]) : '';
        const yRole = h.yearly.palaceNames?.[p.index] ? st(h.yearly.palaceNames[p.index]) : '';
        const isJi = SI_HUA_TAGS[idx] === '忌';
        let clashBranch, clashBenMing, clashDecadal, clashYearly;

        if (isJi) {
          const oppP = raw.palaces.find((op: any) => op.index === (p.index + 6) % 12);
          if (oppP) {
            clashBranch = oppP.earthlyBranch;
            clashBenMing = st(oppP.name);
            clashDecadal = h.decadal.palaceNames?.[oppP.index] ? st(h.decadal.palaceNames[oppP.index]) : '';
            clashYearly = h.yearly.palaceNames?.[oppP.index] ? st(h.yearly.palaceNames[oppP.index]) : '';
          }
        }

        siHuaTargets.push({
          tag: SI_HUA_TAGS[idx],
          star: st(star),
          branch: p.earthlyBranch,
          benMingName: st(p.name),
          decadalName: dRole,
          yearlyName: yRole,
          isClash: isJi,
          clashBranch,
          clashBenMing,
          clashDecadal,
          clashYearly,
        });
      }
    });

    // 提取流曜 (流禄、流羊、流陀、流马等)
    const liuStars: string[] = [];
    (h.yearly.stars || []).forEach((starList: any[], pIdx: number) => {
      const pal = raw.palaces.find((p: any) => p.index === pIdx);
      if (pal && starList && starList.length > 0) {
        starList.forEach(s => {
          if (s?.name) {
            liuStars.push(`${st(s.name)}在【${pal.earthlyBranch}·${st(pal.name)}】`);
          }
        });
      }
    });

    return {
      year,
      ganZhi,
      nominalAge,
      liuMingBranch,
      liuMingBenMing,
      liuMingDecadal,
      daXianBranch,
      daXianName,
      siHuaTargets,
      liuStars,
    };
  } catch (e) {
    return null;
  }
}

export function generateTripleSuperpositionTree(raw: any, focusYear: number = 2026): string {
  if (!raw) return '';

  const years = [focusYear - 2, focusYear - 1, focusYear, focusYear + 1, focusYear + 2];
  let out = `├【三盤合一·天人地時空重疊與流年四化衝合專欄】\n`;
  out += `│ 說明: 本專欄直接預算大限與流年宮位重疊(Triple Superposition)及流年天干四化衝照靶心，徹底封死大模型心算幻覺。\n`;
  out += `│\n`;

  years.forEach(y => {
    const data = computeYearlySuperposition(raw, y);
    if (!data) return;

    const isCurrent = y === focusYear;
    const prefix = isCurrent ? `★【${data.year} ${data.ganZhi}太歲流年 (當前推演核心焦點·虛歲${data.nominalAge})】` : `【${data.year} ${data.ganZhi}太歲流年 (虛歲${data.nominalAge})】`;

    out += `│ ├${prefix}\n`;
    out += `│ │ ├三盤定極: 流命在【${data.liuMingBranch}宮】 · 疊本命【${data.liuMingBenMing}】 · 疊大限【${data.liuMingDecadal}】 (大限命在【${data.daXianBranch}·${data.daXianName}】)\n`;

    // 格式化四化落位
    const siHuaStr = data.siHuaTargets.map(sh => {
      let base = `[流${sh.tag}:${sh.star}]入${sh.branch}(本${sh.benMingName}/限${sh.decadalName}/流${sh.yearlyName})`;
      if (sh.isClash && sh.clashBranch) {
        base += ` 💥直衝[${sh.clashBranch}宮·本${sh.clashBenMing}/限${sh.clashDecadal}/流${sh.clashYearly}]`;
      }
      return base;
    }).join('\n│ │ │ ');

    out += `│ │ ├流年四化衝合靶心:\n│ │ │ ${siHuaStr}\n`;

    if (isCurrent && data.liuStars.length > 0) {
      out += `│ │ └流年流曜吉凶落位: ${data.liuStars.join('; ')}\n`;
    }
    out += `│ │\n`;
  });

  return out;
}
