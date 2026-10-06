// scripts/test_pattern_detector.ts - Offline Astrolabe Pattern Detector Tester (<= 250 lines)
// Run with: npx --yes tsx /Users/hi/.agents/skills/ziwei_astrolabe_vault/scripts/test_pattern_detector.ts

import { astro } from '/Users/hi/niuma/projects/obsxiaojiucai/node_modules/iztro';
import { detectAstrolabePatterns, formatPatternsForFactTree } from '/Users/hi/niuma/projects/obsxiaojiucai/utils/astrolabePatternDetector';
import { PATTERN_REGISTRY } from '/Users/hi/niuma/projects/obsxiaojiucai/utils/astrolabePatternTypes';

console.log(`========================================`);
console.log(`正统 64 格局法典完整性核验: ${Object.keys(PATTERN_REGISTRY).length} / 64`);
console.log(`========================================`);
if (Object.keys(PATTERN_REGISTRY).length !== 64) {
  throw new Error(`Expected exactly 64 patterns in registry, got ${Object.keys(PATTERN_REGISTRY).length}`);
}
console.log(`64 大正统格局注册库完整性 100% 达标！\n`);

function runTest(dateStr: string, timeIdx: number, gender: '男' | '女') {
  console.log(`----------------------------------------`);
  console.log(`排盘测试: ${dateStr} ${timeIdx}时 (${gender})`);
  console.log(`----------------------------------------`);

  const astrolabe = astro.bySolar(dateStr, timeIdx, gender, true, 'zh-CN');
  const birthYearStem = (astrolabe.chineseDate?.split(' ')[0] || '')[0] || (astrolabe.lunarFourPillars?.split(' ')[0] || '')[0] || '';

  console.log(`生年天干: ${birthYearStem} | 命主: ${astrolabe.soul} | 身主: ${astrolabe.body}`);
  const mingP = astrolabe.palaces.find(p => p.name === '命宫' || p.name === '命宮');
  if (mingP) {
    const majors = mingP.majorStars.map(s => s.name).join(', ') || '无主星';
    console.log(`命宫落位: [${mingP.heavenlyStem}${mingP.earthlyBranch}] 主星: ${majors}`);
  }

  const matches = detectAstrolabePatterns(astrolabe as any, birthYearStem);
  console.log(`命中格局数: ${matches.length}`);
  if (matches.length > 0) {
    matches.forEach((m, idx) => {
      console.log(`  ${idx + 1}. [${m.type === 'auspicious' ? '吉格' : m.type === 'inauspicious' ? '凶局' : '特格'}] ${m.name}`);
      console.log(`     描述: ${m.brief}`);
      console.log(`     核心星系: ${m.keyStars.join('+')}`);
      console.log(`     破局建议: ${m.action}`);
    });
  } else {
    console.log(`  未见极端格局，正格清纯。`);
  }

  const factTreeLine = formatPatternsForFactTree(matches);
  console.log(`事实树输出行:\n  ├ 0. 格局定品: ${factTreeLine}\n`);
}

// 示例 1: 1990-05-15 12:00 男
runTest('1990-05-15', 6, '男');

// 示例 2: 1988-08-08 08:00 女
runTest('1988-08-08', 4, '女');

// 示例 3: 1994-09-20 06:00 男 (卯时 巨机同临格 / 府相朝垣格)
runTest('1994-09-20', 3, '男');

// 示例 4: 1991-03-25 14:00 女 (未宫 明珠出海格 / 日月并明格)
runTest('1991-03-25', 7, '女');

// 示例 5: 1985-02-18 12:00 男 (午宫 紫微 极向离明格 / 君臣庆会格)
runTest('1985-02-18', 6, '男');
