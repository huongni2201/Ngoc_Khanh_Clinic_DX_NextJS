---
name: security-best-practices
description: Use for an explicitly requested security review or secure-by-default help in this React/Next.js frontend. Not general code review, backend work or a whole-workspace security audit.
---

# Frontend security best practices

[PROJECT_RULES](../../../PROJECT_RULES.md#19-security--privacy) owns repository
privacy/security policy. Keep the requested review inside this frontend.
Backend API behavior is evidence for trust boundaries, not authorization to edit
or audit the sibling backend.

1. Identify the affected browser, React and Next.js server boundaries.
2. Load only relevant bundled references:
   - Browser transport, DOM and storage:
     [general web frontend](references/javascript-general-web-frontend-security.md).
   - React rendering/component concerns:
     [React frontend](references/javascript-typescript-react-web-frontend-security.md).
   - This frontend's Next.js server routes/rendering:
     [Next.js server](references/javascript-typescript-nextjs-web-server-security.md).
3. Compare guidance with current implementation and accepted cookie/session ADRs.
   Check current Context7 docs when framework API facts are needed.
4. For a requested report, give evidence-backed file/line findings with concrete
   impact and prioritized fixes. Distinguish existing behavior from hypothetical
   risks; do not expand a browser-only task into a server review.
5. Apply only authorized fixes and run checks appropriate to affected boundaries.
   A review alone does not authorize implementation changes.

Use synthetic examples. Keep credentials, session tokens, CCCD and clinical
payloads out of reports/logs. Backend authorization remains authoritative;
hidden frontend controls provide UX only.
