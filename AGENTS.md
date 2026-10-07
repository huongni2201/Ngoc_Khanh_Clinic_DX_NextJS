# Ngọc Khánh Clinic Frontend

Production frontend for NKC-DX. Corporate health examinations are the primary
vertical slice. Preserve Participant terminology and Vietnamese product copy.

## Read by task

1. [PROJECT_RULES.md](PROJECT_RULES.md) owns frontend policy and verification.
2. [PROJECT_SKILLS.md](PROJECT_SKILLS.md) routes tasks to available skills.
3. [Accepted ADRs](docs/adr/README.md) explain lasting frontend decisions.
4. For structure, state or API flow, read
   [frontend architecture](docs/architecture/FRONTEND_ARCHITECTURE.md).
5. For integration, read [the backend contract](../Ngoc_Khanh_Clinic_DX_Springboot/docs/api/clean-slate-migration.md).
   For visual work, read [the design reference](design-system/ngoc-khanh-clinic/MASTER.md);
   color policy is owned by [PROJECT_RULES §15](PROJECT_RULES.md#15-ui--ux).

Explicit owner instructions and accepted business ADRs define intended behavior;
backend handlers and DTOs define the available HTTP surface. If they disagree,
identify the conflict before changing dependent behavior. FE code, mocks and
plans do not create a backend contract. Excel roster import was removed on 2026-10-05 and
restored on 2026-10-06 as the add-only backend endpoint described in
`PROJECT_RULES.md` section 12. Remaining legacy FE code is tracked in
[the code follow-up list](docs/maintenance/code-follow-ups.md).

Inspect the owning module, supported callers and reusable UI before editing.
Make the smallest cohesive change and preserve existing worktree changes.

## Lookup

<!-- CODEGRAPH_START -->
When `.codegraph/` exists, use `codegraph_explore` or
`codegraph explore "<symbols or question>"` before text search or file reads to
locate or understand indexed code. Raw reads are appropriate for non-indexed
documents and details not returned by the tool. Without an index, skip CodeGraph.
<!-- CODEGRAPH_END -->

<!-- context7 -->
For library/framework/SDK/API/CLI/cloud-service syntax, configuration, migration,
setup or library-specific debugging, fetch current Context7 documentation.
Resolve the library ID first unless given an exact `/org/project` ID, then query
each concept. Refactoring, business-logic debugging and code review do not require
Context7. Keep secrets and patient data out of queries.
<!-- context7 -->

## Completion

Follow [definition of done](PROJECT_RULES.md#28-definition-of-done). Report what
changed, checks actually run, missing contracts and remaining risks. For UI work,
also report reused components and justify any new primitive.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
