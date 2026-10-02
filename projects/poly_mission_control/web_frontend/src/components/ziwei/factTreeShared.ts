// web_frontend/src/components/ziwei/factTreeShared.ts - Shared helpers for fact trees (<= 250 lines)
import { st, SI_HUA_MAP, SI_HUA_TAGS } from './ziweiEngine';

export const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

export const INNER_PALACE_NAMES = ['命宫', '命宮', '财帛', '財帛', '疾厄', '官禄', '官祿', '田宅', '福德'];

export function isInnerPalace(name: string): boolean {
  return INNER_PALACE_NAMES.some(n => st(name).includes(st(n)));
}

export function isLaiYinPalace(
  palace?: { heavenlyStem?: string; earthlyBranch?: string } | null,
  birthYearStem?: string | null
): boolean {
  if (!palace || !birthYearStem) return false;
  return palace.heavenlyStem === birthYearStem && palace.earthlyBranch !== '子' && palace.earthlyBranch !== '丑';
}

export function computeQintianDecadalEvents(
  decadalTimeline: any[],
  birthYearStem: string,
  birthStars: string[]
): string[] {
  const decadalEvents: string[] = [];
  decadalTimeline.slice(0, 8).forEach((p: any, idx: number) => {
    const tags: string[] = [];
    if (isLaiYinPalace(p, birthYearStem)) {
      tags.push('踏入来因宫(定数引爆与宿命转折)');
    }
    birthStars.forEach((starName: string, sIdx: number) => {
      const allStars = [...p.majorStars, ...p.minorStars];
      if (allStars.some((s: any) => st(s.name) === st(starName))) {
        tags.push(`踩中生年${SI_HUA_TAGS[sIdx]}[${st(starName)}]`);
      }
    });
    const pStemSiHua = SI_HUA_MAP[p.heavenlyStem] || [];
    const allStars = [...p.majorStars, ...p.minorStars].map((s: any) => st(s.name));
    if (pStemSiHua[3] && allStars.includes(st(pStemSiHua[3]))) {
      tags.push('逢自化忌(能量破耗防线)');
    }
    if (tags.length > 0) {
      decadalEvents.push(`第${idx + 1}大限(${p.decadal.range[0]}-${p.decadal.range[1]}岁 ${st(p.name)}): ${tags.join('、')}`);
    }
  });
  return decadalEvents;
}

export function computeTaiSuiYears(birthYear: number, branch: string): string[] {
  const branchIdx = EARTHLY_BRANCHES.indexOf(branch);
  if (branchIdx === -1) return [];
  const years: string[] = [];
  const startYear = birthYear;
  const endYear = birthYear + 85;
  for (let y = startYear; y <= endYear; y++) {
    const yBranchIdx = (((y - 4) % 12) + 12) % 12;
    if (yBranchIdx === branchIdx) {
      const nominalAge = y - birthYear + 1;
      years.push(`${y}(${nominalAge}岁)`);
    }
  }
  return years;
}

export function formatStarsZhongzhou(stars: any[]): string {
  if (!stars || stars.length === 0) return '無';
  return stars.map((s: any) => {
    let res = st(s.name);
    if (s.brightness) res += `[${st(s.brightness)}]`;
    if (s.mutagen) res += `[生年${st(s.mutagen)}]`;
    return res;
  }).join(',');
}

export function formatStarsWithZihua(stars: any[], palaceStem: string, oppStem: string): string {
  if (!stars || stars.length === 0) return '無';
  const selfSiHua = SI_HUA_MAP[palaceStem] || [];
  const oppSiHua = SI_HUA_MAP[oppStem] || [];

  return stars.map((s: any) => {
    const name = st(s.name);
    let res = name;
    if (s.brightness) res += `[${st(s.brightness)}]`;
    if (s.mutagen) res += `[生年${st(s.mutagen)}]`;
    selfSiHua.forEach((sn, idx) => {
      if (st(sn) === name) res += `[↓${SI_HUA_TAGS[idx]}]`;
    });
    oppSiHua.forEach((sn, idx) => {
      if (st(sn) === name) res += `[↑${SI_HUA_TAGS[idx]}]`;
    });
    return res;
  }).join(',');
}
