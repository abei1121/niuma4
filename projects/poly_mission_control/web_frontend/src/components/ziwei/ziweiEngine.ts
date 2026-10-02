// web_frontend/src/components/ziwei/ziweiEngine.ts - Holographic Ziwei & Solar Engine (<= 250 lines)
import { astro } from 'iztro';
import { Solar } from 'lunar-javascript';
import { generateZhongzhouTree, generateQintianTree, generateUnifiedTree } from './factTrees';
import { detectAstrolabePatterns } from './patternDetector';

export interface ProfileInput {
  birthDate: string;
  birthTime: string;
  gender: '男' | '女';
  longitude: number;
}

export const SI_HUA_MAP: Record<string, string[]> = {
  '甲': ['廉貞', '破軍', '武曲', '太陽'],
  '乙': ['天機', '天梁', '紫微', '太陰'],
  '丙': ['天同', '天機', '文昌', '廉貞'],
  '丁': ['太陰', '天同', '天機', '巨門'],
  '戊': ['貪狼', '太陰', '右弼', '天機'],
  '己': ['武曲', '貪狼', '天梁', '文曲'],
  '庚': ['太陽', '武曲', '太陰', '天同'],
  '辛': ['巨門', '太陽', '文曲', '文昌'],
  '壬': ['天梁', '紫微', '左輔', '武曲'],
  '癸': ['破軍', '巨門', '太陰', '貪狼'],
};

export const SI_HUA_TAGS = ['祿', '權', '科', '忌'];

export const st = (text: string): string => {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/机/g, '機').replace(/宫/g, '宮').replace(/门/g, '門').replace(/马/g, '馬')
    .replace(/龙/g, '龍').replace(/凤/g, '鳳').replace(/罗/g, '羅').replace(/钦/g, '欽')
    .replace(/权/g, '權').replace(/禄/g, '祿').replace(/庙/g, '廟').replace(/阳/g, '陽')
    .replace(/阴/g, '陰').replace(/长/g, '長').replace(/贞/g, '貞').replace(/钺/g, '鉞')
    .replace(/财/g, '財').replace(/迁/g, '遷').replace(/贵/g, '貴').replace(/贪/g, '貪')
    .replace(/杀/g, '殺').replace(/军/g, '軍').replace(/辅/g, '輔').replace(/铃/g, '鈴');
};

export const isLaiYinPalace = (
  palace?: { heavenlyStem?: string; earthlyBranch?: string } | null,
  birthYearStem?: string | null
): boolean => {
  if (!palace || !birthYearStem) return false;
  return palace.heavenlyStem === birthYearStem && palace.earthlyBranch !== '子' && palace.earthlyBranch !== '丑';
};

export function calculateTrueSolarTime(date: Date, longitude: number): { trueSolarDate: Date; offsetMinutes: number } {
  const standardMeridian = 120;
  const longitudeOffsetMinutes = (longitude - standardMeridian) * 4;

  const utcYear = date.getFullYear();
  const startOfYear = Date.UTC(utcYear, 0, 1);
  const currentUtc = Date.UTC(utcYear, date.getMonth(), date.getDate());
  const dayOfYear = Math.floor((currentUtc - startOfYear) / 86400000) + 1;

  const B = (360 * (dayOfYear - 81)) / 365;
  const radB = (B * Math.PI) / 180;
  const eotMinutes = 9.87 * Math.sin(2 * radB) - 7.53 * Math.cos(radB) - 1.5 * Math.sin(radB);
  const totalOffsetMinutes = longitudeOffsetMinutes + eotMinutes;

  const trueSolarDate = new Date(date.getTime() + totalOffsetMinutes * 60 * 1000);
  return { trueSolarDate, offsetMinutes: totalOffsetMinutes };
}

export function computeAstrolabeData(input: ProfileInput) {
  const [year, month, day] = input.birthDate.split('-').map(Number);
  const [hour, minute] = input.birthTime.split(':').map(Number);
  const inputDate = new Date(year, month - 1, day, hour, minute);

  const { trueSolarDate, offsetMinutes } = calculateTrueSolarTime(inputDate, input.longitude);
  const hourVal = trueSolarDate.getHours();
  const shichenIndex = hourVal === 23 ? 12 : Math.floor((hourVal + 1) / 2);

  const solarY = trueSolarDate.getFullYear();
  const solarM = trueSolarDate.getMonth() + 1;
  const solarD = trueSolarDate.getDate();
  const iztroDateStr = `${solarY}-${String(solarM).padStart(2, '0')}-${String(solarD).padStart(2, '0')}`;

  const raw = astro.bySolar(iztroDateStr, shichenIndex, input.gender, true, 'zh-CN');
  if (!raw) return null;

  const solarObj = Solar.fromDate(trueSolarDate);
  const lunarObj = solarObj.getLunar();
  const baZi = lunarObj.getEightChar();
  const solarTermsFP = `${baZi.getYear()} ${baZi.getMonth()} ${baZi.getDay()} ${baZi.getTime()}`;

  const stems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

  const birthYearStem = lunarObj.getYearGan();
  const yearGanIdx = stems.indexOf(birthYearStem);
  const monthStartStemIdx = (yearGanIdx % 5) * 2 + 2;
  const lunarMonth = Math.abs(lunarObj.getMonth());
  const monthStemIdx = (((monthStartStemIdx + (lunarMonth - 1)) % 10) + 10) % 10;
  const monthBranchIdx = (((2 + (lunarMonth - 1)) % 12) + 12) % 12;
  const lunarFP = `${lunarObj.getYearInGanZhi()} ${stems[monthStemIdx]}${branches[monthBranchIdx]} ${baZi.getDay()} ${baZi.getTime()}`;

  const pad = (n: number) => String(n).padStart(2, '0');
  const trueSolarTimeStr = `${solarY}-${pad(solarM)}-${pad(solarD)} ${pad(trueSolarDate.getHours())}:${pad(trueSolarDate.getMinutes())} (${branches[shichenIndex % 12]}時)`;

  const douJunIdx = (((lunarMonth - 1) - (shichenIndex % 12) + 12) % 12);
  const ziYearDouJun = branches[douJunIdx];

  const laiYinPalace = raw.palaces.find(p => isLaiYinPalace(p, birthYearStem));
  const laiYinName = laiYinPalace ? `${st(laiYinPalace.name)}[${laiYinPalace.earthlyBranch}]` : '未知';

  const bodyPalace = raw.palaces.find(p => p.isBodyPalace);
  const bodyPalaceStr = bodyPalace ? `${st(bodyPalace.name)}[${bodyPalace.earthlyBranch}]` : '未知';

  const birthStars = SI_HUA_MAP[birthYearStem] || [];
  const birthSiHuaList: string[] = [];
  birthStars.forEach((starName, idx) => {
    const targetPalace = raw.palaces.find(p => {
      const allStars = [...p.majorStars, ...p.minorStars];
      return allStars.some(s => st(s.name) === st(starName));
    });
    const pName = targetPalace ? `${st(targetPalace.name)}[${targetPalace.earthlyBranch}]` : '未知宮位';
    birthSiHuaList.push(`生年${SI_HUA_TAGS[idx]}: ${st(starName)} 入 ${pName}`);
  });

  const selfZihua: string[] = [];
  const oppZihua: string[] = [];
  const clashWarnings: string[] = [];
  const flyOutNetwork: string[] = [];

  raw.palaces.forEach(p => {
    const allStars = [...p.majorStars, ...p.minorStars].map(s => st(s.name));
    const pStemSiHua = SI_HUA_MAP[p.heavenlyStem] || [];

    pStemSiHua.forEach((starName, idx) => {
      if (allStars.includes(st(starName))) {
        selfZihua.push(`${st(p.name)}[${p.earthlyBranch}] 離心自化[↓${SI_HUA_TAGS[idx]}] (${st(starName)})`);
        if (SI_HUA_TAGS[idx] === '忌') {
          const oppP = raw.palaces.find(op => op.index === ((p.index + 6) % 12));
          clashWarnings.push(`${st(p.name)}坐自化忌[↓忌]，氣數外洩破耗，直衝對宮【${oppP ? st(oppP.name) : '對宮'}】`);
        }
      }
    });

    const oppP = raw.palaces.find(op => op.index === ((p.index + 6) % 12));
    if (oppP) {
      const oppStemSiHua = SI_HUA_MAP[oppP.heavenlyStem] || [];
      oppStemSiHua.forEach((starName, idx) => {
        if (allStars.includes(st(starName))) {
          oppZihua.push(`${st(p.name)}[${p.earthlyBranch}] 向心自化[↑${SI_HUA_TAGS[idx]}] (來自${st(oppP.name)} ${st(starName)})`);
        }
      });
    }

    const flyJiStar = pStemSiHua[3];
    if (flyJiStar) {
      const jiTargetPalace = raw.palaces.find(tp => [...tp.majorStars, ...tp.minorStars].some(s => st(s.name) === st(flyJiStar)));
      if (jiTargetPalace && jiTargetPalace.index !== p.index) {
        flyOutNetwork.push(`${st(p.name)}[${p.heavenlyStem}] 化忌入【${st(jiTargetPalace.name)}】(${st(flyJiStar)})`);
      }
    }
  });

  const mingP = raw.palaces.find(p => p.name === '命宫' || p.name === '命宮');
  const oppP = mingP ? raw.palaces.find(p => p.index === ((mingP.index + 6) % 12)) : null;
  const guanP = mingP ? raw.palaces.find(p => p.index === ((mingP.index + 4) % 12)) : null;
  const caiP = mingP ? raw.palaces.find(p => p.index === ((mingP.index + 8) % 12)) : null;

  const fmtPStars = (p: any) => {
    if (!p) return '無';
    if (!p.majorStars || p.majorStars.length === 0) return '無主星(借對宮安星)';
    return p.majorStars.map((s: any) => `${st(s.name)}[${s.brightness ? st(s.brightness) : '平'}]`).join(',');
  };

  const badNames = ['擎羊', '陀羅', '火星', '鈴星', '地空', '地劫'];
  const goodNames = ['左輔', '右弼', '天魁', '天鉞', '文昌', '文曲', '祿存', '天馬'];
  const getBadStars = (p: any) => p ? [...p.majorStars, ...p.minorStars].filter(s => badNames.includes(st(s.name))).map(s => st(s.name)) : [];
  const getGoodStars = (p: any) => p ? [...p.majorStars, ...p.minorStars].filter(s => goodNames.includes(st(s.name))).map(s => st(s.name)) : [];

  const horoscope = raw.horoscope(new Date());

  const decadalTimeline = [...raw.palaces]
    .filter(p => p.decadal && p.decadal.range)
    .sort((a, b) => a.decadal.range[0] - b.decadal.range[0]);

  const ctx = {
    input, raw, horoscope, birthYear: solarY,
    trueSolarDate, offsetMinutes, trueSolarTimeStr,
    solarTermsFP, lunarFP, lunarObj,
    birthYearStem, laiYinName, laiYinPalace,
    bodyPalaceStr, ziYearDouJun, birthStars,
    birthSiHuaList, selfZihua, oppZihua, clashWarnings, flyOutNetwork,
    mingP, oppP, guanP, caiP,
    fmtPStars, getGoodStars, getBadStars,
    decadalTimeline,
  };

  const zhongzhouTree = generateZhongzhouTree(ctx);
  const qintianTree = generateQintianTree(ctx);
  const unifiedTree = generateUnifiedTree(ctx);
  const patterns = detectAstrolabePatterns(raw.palaces, birthYearStem);

  return {
    ...ctx,
    patterns,
    zhongzhouTree,
    qintianTree,
    unifiedTree,
    asciiTree: unifiedTree,
  };
}
