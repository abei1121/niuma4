// web_frontend/src/components/ziwei/patternTypes.ts - Ziwei Pattern Types & Registry Aggregator (<= 250 lines)
// Strictly <= 250 lines. Zero Emoji. Zero Star icons.

import { AUSPICIOUS_PATTERNS } from './patternRegistryAuspicious';
import { SPECIAL_AND_INAUSPICIOUS_PATTERNS } from './patternRegistrySpecial';

export type PatternType = 'auspicious' | 'inauspicious' | 'mixed';

export interface AstrolabePatternDef {
  id: string;
  name: string;
  type: PatternType;
  brief: string;
  description: string;
  action: string;
}

export interface MatchedPattern {
  id: string;
  name: string;
  type: PatternType;
  brief: string;
  palaceName: string;
  branch: string;
  keyStars: string[];
  action: string;
}

export const PATTERN_REGISTRY: Record<string, AstrolabePatternDef> = {
  ...AUSPICIOUS_PATTERNS,
  ...SPECIAL_AND_INAUSPICIOUS_PATTERNS,
};
