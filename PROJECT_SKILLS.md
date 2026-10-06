# Ngọc Khánh Clinic Frontend — Skill Routing

Local skills live in `.agents/skills/`. Read the selected `SKILL.md` and load only
resources relevant to the task. [PROJECT_RULES.md](PROJECT_RULES.md) and accepted
ADRs override generic examples. State, reuse and color policies are owned there.

| Task | Local skill | Boundary |
|---|---|---|
| Focused implementation/refactoring | [karpathy-guidelines](.agents/skills/karpathy-guidelines/SKILL.md) | Scoped changes and observable acceptance criteria. |
| Workflow UX/accessibility | [ui-ux-pro-max](.agents/skills/ui-ux-pro-max/SKILL.md), [web-design-guidelines](.agents/skills/web-design-guidelines/SKILL.md) | Operational healthcare screens and real screen states. |
| Composition/visual refinement | [frontend-design](.agents/skills/frontend-design/SKILL.md), [ui-styling](.agents/skills/ui-styling/SKILL.md) | Reuse project/shadcn UI before creating primitives. |
| Tokens/variants | [tailwind-design-system](.agents/skills/tailwind-design-system/SKILL.md) | Semantic tokens in globals.css. |
| State/cache ownership | [react-state-management](.agents/skills/react-state-management/SKILL.md) | Follow PROJECT_RULES §6. |
| HTTP/mutation failures | [error-handling-patterns](.agents/skills/error-handling-patterns/SKILL.md) | Actual backend envelope and shared client. |
| Tests | [javascript-testing-patterns](.agents/skills/javascript-testing-patterns/SKILL.md), [tdd](.agents/skills/tdd/SKILL.md) for explicit test-first work | Supported contracts; no removed import or age-rejection assumptions. |
| Bug diagnosis | [diagnosing-bugs](.agents/skills/diagnosing-bugs/SKILL.md) | Trace supported callers. |
| Diff review | [code-review](.agents/skills/code-review/SKILL.md) | Requires a base and originating specification. |
| Explicit security review/secure defaults | [security-best-practices](.agents/skills/security-best-practices/SKILL.md) | Browser, React and this frontend's Next.js server boundary. |
| Explicit threat model | [security-threat-model](.agents/skills/security-threat-model/SKILL.md) | Within this repository's scope. |
| Commit tooling | [setup-pre-commit](.agents/skills/setup-pre-commit/SKILL.md) | Adapt to pnpm and configured scripts. |
| Lasting architecture decision | [architecture-decision-records](.agents/skills/architecture-decision-records/SKILL.md) | Routine component extraction needs no ADR. |

For editing agent instructions, use `writing-for-agents` or `skill-creator` only
if present in the active session catalog. These are not bundled local skills.
Do not install skills merely to satisfy this table or add backend-oriented
skill resources to this frontend repository.
