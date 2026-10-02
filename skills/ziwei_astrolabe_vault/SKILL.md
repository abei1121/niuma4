---
name: ziwei_astrolabe_vault
description: 紫微斗数数理事实树、正统六十四格局判定引擎、钦天象数因果网络、私有典籍知识库与法医级溯源推演规范。
triggers:
  - ziwei_astrolabe_vault
  - ziwei_fact_tree
  - ziwei_patterns
  - qintian_engine
  - creator_qa
  - knowledge_vault
---

# 紫微斗数数理事实树与私有典籍知识中枢 (Ziwei Astrolabe Vault)

## 概述
本技能定义并守护《人生运势历》与全栈系统中的紫微斗数数理事实树标准、64 大正统格局判定引擎、钦天门 144 象数因果网络、私有化典籍知识库（`knowledge_vault.json`）及造物主叩问的「法医级命盘溯源协议」。

本技能是紫微斗数全部算法与推演的**最高数理基准与防幻觉宪章**，任何智能体在维护、审计、扩展相关代码或编写推演提示词时，必须严格遵守本技能的规约。

---

## 核心架构原则

### 1. 算力与机密物理隔离原则 (Physical Decoupling)
- **客户端（浏览器 / PWA）算事实**：
  - 经度真太阳时偏角修正、天干地支落位、十二宫排布、三方四正与格局判定，100% 在前端用纯 TypeScript 代码于 0.1ms 内计算完成；
  - 零服务器算力开销，离线可用，客观天文与命理公理对公透明。
- **182 服务端（Rust 微服务）锁绝密**：
  - 私有典籍知识库（`data/knowledge_vault.json`）与宗师推理底护协议驻留在 182 服务器后端；
  - 前端只提交事实树摘要，182 在内网动态注入私有断诀喂给大模型，推演流式输出，**绝密断诀与核心 Prompt 物理不出内网**。

### 2. 事实树法定符号与先验基准
事实树是 AI 产生任何推演结论的**唯一合法证据来源**，符号系统必须严格对齐：
- `(↓: 离心自化)`：本宫向外散逸能量，主破耗、舍弃与防御破口；
- `(↑: 向心自化)`：对宫射入机缘与能量，主外部机缘引动与合伙宿命；
- `(┏ : 生年四化)`：生年干天定之定数与业力归宿；
- `( ┓: 飞星)`：宫干飞出化象，连接宫位因果链条。

### 3. 正统数理公理 (Mathematical Axioms)
- **来因宫定极**：五虎遁天干起月法中，来因宫不落子丑（逢子视寅，逢丑视卯）；
- **虚岁与流年严格区分**：
  - `小限虚岁`：命盘 `palace.ages` 是传统小限虚岁行运；
  - `太岁流年`：地支对应每 12 年一轮的太岁年份（如午年：1990、2002、2014、2026），事实树完整列出 85 年，严禁截断；
- **六吉六煞定性顺序**：
  - 吉星：左辅 > 右弼 > 天魁 > 天钺 > 文昌 > 文曲 > 禄存 > 天马；
  - 煞星：擎羊 > 陀罗 > 火星 > 铃星 > 地空 > 地劫。

4. **核心时空动量层公理 (P1 Triple Superposition Axioms)**:
   - **天人地三盘合一**：推断具体应期必须基于「本命盘-当前大限-当前流年」三盘重叠拓扑（如流官叠大财、流命叠大迁）；
   - **四化冲合穿透**：流年四化必须同时标定在三大盘位中的宫位角色（如 `廉贞化忌入[寅](命夫妻·大疾厄·流财帛)`）；
   - **化忌直冲靶心**：化忌落宫为受伏击点，其正对之冲宫为防线直接破裂点，纯代码直接计算输出，彻底封死 AI 心算宫位幻觉；
   - **流曜必须入盘**：流禄、流羊、流陀、流马四颗核心动能流曜必须结合地支精准定位；
   - **纯确定性计算**：前端 `astrolabeSuperposition.ts` 输出只读事实，严禁交由大模型心算。

5. **多宫位因果张力图谱与语义路由规范 (P2 Multi-Palace Semantic Router)**:
   - **两级语义意图加权**：针对现代商业/生活复合提问（合伙/出海/合同/现金流等），按高优关键词（3分）与标准关键词（1分）评分，排序提取前 2~3 个核心受力宫位；
   - **简繁归一化防御**：用户输入与前端事实树（正统繁体）与知识库词条（简体）必须经 `to_canonical_simplified` 归一处理，消除字形编码壁垒；
   - **协同规则动态注入**：命中多宫位时，动态组装【多宫位因果张力图谱】与协同规则（如迁移与交友协同防背刺、官禄与财帛协同看现金流）；
   - **宗师防幻觉与古赋防御性转译宪章**：对《太微赋》《骨髓赋》等极凶断语，强制执行“现代商业与社会学正向解构”，禁止照搬封建恐吓性字句。

6. **144 经典星系地支区间物理隔离匹配算法 (P3 Star Clusters & Physical Scoping)**:
   - **微观颗粒度**：知识库建立 144 组星系（12 基本盘 × 12 宫）标准条目，包含母本原典、现代商业场景、宫位落位断诀与手术刀破局建议；
   - **地支区间物理隔离 (`palace_has_stars`)**：星系匹配必须限定在 `[branch]` 起始直至下一个 `[other_branch]` 或换行符的物理切片内，严禁整行跨宫位匹配造成假阳性误判。

---

## 核心组件与参考清单

1. **事实树全息规范**：
   详见 [references/fact_tree_schema.md](file:///Users/hi/.agents/skills/ziwei_astrolabe_vault/references/fact_tree_schema.md)。
2. **正统 64 格局判定法典**：
   详见 [references/orthodox_patterns_64.md](file:///Users/hi/.agents/skills/ziwei_astrolabe_vault/references/orthodox_patterns_64.md)。
3. **钦天门 144 象数因果网络**：
   详见 [references/qintian_theorems_144.md](file:///Users/hi/.agents/skills/ziwei_astrolabe_vault/references/qintian_theorems_144.md)。
4. **144 经典星系落位与手术刀破局法典**：
   详见 [references/canonical_star_clusters_144.md](file:///Users/hi/.agents/skills/ziwei_astrolabe_vault/references/canonical_star_clusters_144.md)。
5. **法医级溯源推理协议 (CREATOR_QA_PROMPT)**：
   详见 [references/forensic_reasoning_prompt.md](file:///Users/hi/.agents/skills/ziwei_astrolabe_vault/references/forensic_reasoning_prompt.md)。

---

## 知识库维护与部署规范

1. **知识库路径**：
   - 本地开发：`/Users/hi/niuma/projects/obs_membership_rust/data/knowledge_vault.json`
   - 生产环境：`a@192.168.1.182:/home/a/obs_membership_rust/data/knowledge_vault.json`
2. **热更新规范**：
   - `knowledge_vault.json` 采用运行时只读加载，修改后仅需向 182 同步文件，无需重编译 Rust 依赖；
   - 更新前后必须运行 `python3 scripts/validate_vault_json.py` 验证合法性。
3. **Rust 语义路由与推演微服务规范**：
   - 路由源码：`/Users/hi/niuma/projects/obs_membership_rust/src/router.rs`
   - 流式推演：`/Users/hi/niuma/projects/obs_membership_rust/src/fortune.rs`
   - 源码严格执行 $\le 250$ 行单一职责规范，提交前必须通过 `cargo test router` 单元测试。
