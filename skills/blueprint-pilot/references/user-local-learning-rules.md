# User Local Learning Rules

User Local Learning saves reusable execution lessons inside the current project only.

## Rules

- Store lessons under `docs/architecture/execution/local-learning/`.
- Ask the user before creating a lesson.
- If the user declines, do not create a lesson.
- Use lessons as project context hints only.
- Do not read lessons from other projects.
- Do not create a global personal memory.
- Do not upload lessons.
- Do not use lessons to modify BlueprintPilot, templates, scripts, adapters, references, version, or update behavior.

## Recommended Prompt

```text
本轮蓝图执行产生了可以沉淀到本项目的蓝图领航经验：

- 经验类型：<type>
- 可复用价值：<value>
- 中文审核摘要：
  - 经验主题：<topic>
  - 能力价值：<value_summary>
  - 推荐判断：<decision_summary>
  - 确认后动作：<confirmation_effect>
  - 后续影响：<project_local_downstream_impact>
- 建议引用的执行证据：
  - <project-local evidence path>

是否保存到本项目的蓝图领航本地经验库？
```

If the user explicitly asks to save or 沉淀 the current project lesson, treat that as confirmation after showing or checking the recommendation. Do not ask the user to copy a command.

## Read Path

During project recovery or blueprint readiness review, inspect only the current project's local learning index if it exists:

```text
docs/architecture/execution/local-learning/lessons-index.md
```

Treat local lessons as hints. They do not override the user's current request, the active blueprint, code reality, or verification gates.
