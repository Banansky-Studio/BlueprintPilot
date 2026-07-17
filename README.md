> ## "When Codex handles a complex long task, does it start to drift, fragment, or lose the plot?"
>
> ## “你在用 Codex 执行复杂长任务时，是不是经常会跑偏？碎片化？”

# BlueprintPilot / 蓝图领航

BlueprintPilot is an execution navigation system for Codex. It turns complex blueprints, refactor plans, review-fix lists, and long-running project goals into a clear execution path, then helps Codex carry that path through to implementation. The goal is more precise communication, clearer boundaries, more visible acceptance, higher execution efficiency, and reusable lessons from each run.

蓝图领航是一套面向 Codex 的复杂任务执行导航系统。它可以把复杂蓝图、重构计划、审查整改清单和长期项目目标，转成一条清晰的执行路径，并帮助 Codex 准确地执行落实。它的目标是实现更精准的沟通、更清晰的边界、更可见的验收、更高的执行效率，以及可复用的经验沉淀。

## The Pain / 用户痛点

Codex is powerful, but complex long tasks often run into the same problems:
- the plan is clear at the start, but execution gradually drifts;
- the work becomes many tiny edits instead of meaningful outcomes;
- every side issue pulls Codex away from the main line;
- "done" is reported before the result is actually proven;
- once the conversation gets long, resuming the real state becomes difficult;
- useful execution lessons disappear after the task ends.

Codex 很强，但在执行复杂长任务时，经常会遇到这些问题：
- 一开始计划很清楚，执行几轮后逐渐跑偏；
- 工作变成一堆零碎修改，而不是围绕真正的结果推进；
- 每个旁支问题都可能把 Codex 带离主线；
- 很快报告“完成”，但并没有证明结果真的可靠；
- 对话一长，下一次很难恢复真实执行状态；
- 执行中积累的经验，任务结束后就消失了。

BlueprintPilot is built to keep Codex on the blueprint.

蓝图领航的目标，就是让 Codex 始终沿着蓝图推进。

## What BlueprintPilot Does / 蓝图领航能做什么

BlueprintPilot helps Codex:
- understand the blueprint before acting;
- recover existing execution state from project files;
- identify whether the plan is ready, stale, incomplete, or already partly done;
- turn the next step into a focused execution task;
- keep scope, proof boundaries, and acceptance criteria visible;
- avoid unrelated detours unless they block the current result;
- verify what was actually completed;
- record reusable execution lessons for later review.

蓝图领航会帮助 Codex：
- 先理解蓝图，再开始行动；
- 从项目文件中恢复已有执行状态；
- 判断计划是可执行、已过期、不完整，还是已经部分完成；
- 把下一步整理成一次聚焦的执行任务；
- 明确本轮要做什么、不做什么、如何验收；
- 避免被无关旁支问题带跑，除非它会阻断当前结果；
- 验证到底完成了什么，而不是只给出感觉上的“完成”；
- 沉淀可复用的执行经验，方便后续复盘和改进。

## Fewer Rounds, Clearer Results / 更少沟通回合，更清晰执行结果

BlueprintPilot reduces the back-and-forth needed to finish a blueprint:
- large, complex blueprint tasks are usually optimized into 3-5 focused execution tasks;
- medium blueprint tasks are usually optimized into 1-2 focused execution tasks;
- simple blueprint tasks should be completed in one focused execution task.

蓝图领航可以减少你和 Codex 之间反复沟通、反复纠偏的次数：
- 大型复杂蓝图任务，通常会被优化成 3-5 次聚焦执行任务完成；
- 中等复杂蓝图任务，通常会被优化成 1-2 次聚焦执行任务完成；
- 简单蓝图任务，通常只需要 1 次聚焦执行即可完成。

The goal is not more process. The goal is to finish the real blueprint requirements with less drift, less fragmentation, and clearer proof.

它不是为了制造更多流程，而是为了让蓝图要求更准确地落地：少跑偏、少碎片化、证据更清楚。

## How to Use / 如何使用

First, ask BlueprintPilot to analyze the blueprint and produce the next execution plan:

第一步，让蓝图领航分析蓝图，并给出下一步执行方案：

```text
Use BlueprintPilot to analyze this blueprint and propose the next execution plan.
```

```text
请使用蓝图领航分析这份蓝图，并给出下一步执行方案。
```

Then, when you are ready to execute, explicitly keep BlueprintPilot in the loop:

第二步，准备开始执行时，继续明确让蓝图领航参与执行：

```text
Use BlueprintPilot to start executing according to this execution plan.
```

```text
请使用蓝图领航按这个执行方案开始执行。
```

This keeps planning and implementation under the same navigation rules.

这样可以确保“分析蓝图”和“真正执行”都在同一套导航规则下完成。

## Install / 安装

Recommended installation:

推荐安装方式：

```bash
curl -fsSL https://raw.githubusercontent.com/Banansky-Studio/BlueprintPilot/refs/heads/main/scripts/install-managed.sh | bash
```

This installs BlueprintPilot as a managed GitHub Skill, which gives you the cleanest path for future update reminders and upgrades.

这会把蓝图领航安装为 GitHub 托管 Skill，后续可以更稳定地收到更新提醒并完成升级。

This GitHub repository is the only official release source for BlueprintPilot. To keep the Skill safe and stable, do not install BlueprintPilot from other channels.

当前 GitHub 仓库是蓝图领航唯一的官方发布仓库。为了确保 Skill 安全稳定，请不要从其他渠道安装蓝图领航。

## Updates / 更新

BlueprintPilot will continue to improve. We will publish the latest version to this repository. After installing BlueprintPilot from this repository, you may receive update prompts during later use. For the best performance and reliability, keep the Skill updated to the latest version.

蓝图领航会持续迭代和增强。我们会将最新版本发布到当前仓库。通过当前仓库安装蓝图领航 Skill 后，你在后续使用过程中可能会不定期收到更新提示。为了获得更好的性能和稳定性，建议将 Skill 升级至最新版本。

## What Is Included / 当前包含能力

BlueprintPilot currently includes:
- an installable Codex Skill;
- blueprint state recovery;
- execution readiness review;
- focused execution planning;
- acceptance reports and closeouts;
- workspace boundary checks;
- reusable learning candidates;
- GitHub-based update checks.

蓝图领航当前包含：
- 可安装到 Codex 的 Skill；
- 蓝图状态恢复；
- 蓝图执行就绪检查；
- 聚焦的下一步执行规划；
- 验收报告和阶段收口；
- 工作区变更边界检查；
- 可复用经验沉淀候选；
- 基于 GitHub 的更新检查。

## Who Should Use It / 适合谁使用

BlueprintPilot is useful for:
- developers using Codex for long implementation or refactor tasks;
- solo founders turning product plans into real deliverables;
- builders working across product, design, content, and code;
- small teams that want execution discipline without heavy process;
- studios and consultants repeatedly delivering blueprint-driven work.

蓝图领航适合：
- 经常让 Codex 执行长期开发或重构任务的开发者；
- 需要把产品计划真正落成交付物的独立创业者；
- 同时处理产品、设计、内容和代码的复合型创作者；
- 想提升执行稳定性、但不想引入复杂流程的小团队；
- 需要反复交付蓝图型任务的工作室和顾问。

If you have ever told Codex "continue according to the plan" and then watched it wander into unrelated edits, BlueprintPilot is for you.

如果你曾经对 Codex 说“继续按计划执行”，然后看着它跑成一堆无关修改，那蓝图领航就是为你准备的。

## License / 许可证

BlueprintPilot is released under the Apache-2.0 license.

蓝图领航基于 Apache-2.0 许可证开放发布。
