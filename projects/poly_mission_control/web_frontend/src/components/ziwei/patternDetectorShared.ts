// web_frontend/src/components/ziwei/patternDetectorShared.ts - Detector Context & Helpers (<= 250 lines)
// Strictly <= 250 lines. Zero Emoji. Zero Star icons.

import { st, SI_HUA_MAP } from './ziweiEngine';
import { MatchedPattern, PATTERN_REGISTRY } from './patternTypes';

export interface DetectorContext {
  palaces: any[];
  birthYearStem: string;
  mingP: any;
  bodyP?: any;
  oppP?: any;
  guanP?: any;
  caiP?: any;
  parentP?: any;
  brotherP?: any;
  fuP?: any;
  sanFangPalaces: any[];
  luStar?: string;
  quanStar?: string;
  keStar?: string;
  jiStar?: string;
  hasStar: (p: any, name: string) => boolean;
  hasMajor: (p: any, name: string) => boolean;
  hasInSanFang: (name: string) => boolean;
  addMatch: (id: string, branch: string, keyStars: string[], extraBrief?: string) => void;
}

export function createDetectorContext(palacesInput: any, birthYearStem: string, matches: MatchedPattern[]): DetectorContext | null {
  const palaces = Array.isArray(palacesInput) ? palacesInput : (palacesInput?.palaces || []);
  const mingP = palaces.find((p: any) => st(p.name).includes('命'));
  if (!mingP) return null;

  const bodyP = palaces.find((p: any) => p.isBodyPalace || st(p.name).includes('身'));
  const oppP = palaces.find((p: any) => p.index === (mingP.index + 6) % 12);
  const guanP = palaces.find((p: any) => p.index === (mingP.index + 4) % 12);
  const caiP = palaces.find((p: any) => p.index === (mingP.index + 8) % 12);
  const parentP = palaces.find((p: any) => st(p.name).includes('父母'));
  const brotherP = palaces.find((p: any) => st(p.name).includes('兄弟'));
  const fuP = palaces.find((p: any) => st(p.name).includes('夫妻'));
  const sanFangPalaces = [mingP, oppP, guanP, caiP].filter(Boolean);

  const getPStars = (p?: any) => {
    if (!p) return [] as string[];
    const majors = p.majorStars || [];
    const minors = p.minorStars || [];
    const adjs = p.adjectiveStars || [];
    return [...majors, ...minors, ...adjs].map((s: any) => st(s.name));
  };

  const hasStar = (p: any, name: string) => getPStars(p).includes(st(name));
  const hasMajor = (p: any, name: string) => (p?.majorStars || []).some((s: any) => st(s.name) === st(name));
  const hasInSanFang = (name: string) => sanFangPalaces.some((p: any) => hasStar(p, name));

  const [luStar, quanStar, keStar, jiStar] = SI_HUA_MAP[birthYearStem] || [];

  const addMatch = (id: string, branch: string, keyStars: string[], extraBrief?: string) => {
    const def = PATTERN_REGISTRY[id];
    if (!def) return;
    matches.push({
      id: def.id,
      name: def.name,
      type: def.type,
      brief: extraBrief || def.brief,
      palaceName: st(mingP.name),
      branch,
      keyStars,
      action: def.action,
    });
  };

  return {
    palaces,
    birthYearStem,
    mingP,
    bodyP,
    oppP,
    guanP,
    caiP,
    parentP,
    brotherP,
    fuP,
    sanFangPalaces,
    luStar,
    quanStar,
    keStar,
    jiStar,
    hasStar,
    hasMajor,
    hasInSanFang,
    addMatch,
  };
}
