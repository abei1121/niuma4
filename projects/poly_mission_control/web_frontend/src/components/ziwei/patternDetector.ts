// web_frontend/src/components/ziwei/patternDetector.ts - Deterministic Pattern Detector (<= 250 lines)
// Strictly <= 250 lines. Zero Emoji. Zero Star icons.

import { MatchedPattern } from './patternTypes';
import { createDetectorContext } from './patternDetectorShared';
import { detectAuspiciousPatterns } from './patternDetectorAuspicious';
import { detectSpecialAndInauspiciousPatterns } from './patternDetectorSpecial';

export function detectAstrolabePatterns(palacesInput: any, birthYearStem: string): MatchedPattern[] {
  const matches: MatchedPattern[] = [];
  const ctx = createDetectorContext(palacesInput, birthYearStem, matches);
  if (!ctx) return matches;

  detectAuspiciousPatterns(ctx);
  detectSpecialAndInauspiciousPatterns(ctx);

  return matches;
}

export function formatPatternsForFactTree(patterns: MatchedPattern[]): string {
  if (patterns.length === 0) return '正格清純(未見極端吉凶煞局)';
  return patterns.map(p => {
    const typeLabel = p.type === 'auspicious' ? '吉格' : p.type === 'inauspicious' ? '凶局' : '特格';
    return `【${p.name}】[${typeLabel}: ${p.brief} | 破局動作: ${p.action}]`;
  }).join('；');
}
