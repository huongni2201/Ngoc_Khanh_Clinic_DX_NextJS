# ADR-0002: Reuse-First UI Component Strategy

## Status

Accepted

## Context

The project uses shadcn/ui with the Mira preset.

AI-assisted development and normal feature development can easily create duplicate buttons, dialogs, inputs, tables, selects, drawers, cards and badges even when equivalent primitives already exist.

Duplicate UI increases maintenance cost, visual inconsistency, accessibility drift, code size and future migration cost.

## Decision

Adopt a mandatory **reuse-first UI strategy**.

Required order:

```text
1. Existing component in the owning module
2. Existing reusable component in src/shared
3. Existing shadcn primitive in src/components/ui
4. Suitable component from the configured shadcn registry
5. Composition of existing primitives
6. New reusable component only if the above cannot satisfy the requirement
```

Do not create one-to-one wrappers such as:

```text
AppButton
CustomButton
BaseButton
CustomModal
AppModal
CustomSelect
```

unless they add a meaningful reusable contract.

Domain components may compose primitives when they add business semantics.

Components reused across multiple modules should move to `src/shared`.

## Examples

### Correct

```text
Button + Dialog + form schema
→ CreateCompanyDialog
```

The domain component adds business behavior.

### Incorrect

```text
Button
→ AppButton
```

when `AppButton` only passes props through.

### Correct

```text
Table + TanStack Table
→ shared DataTable
```

when the shared component adds a reusable table contract.

### Incorrect

Copying `Dialog` into a business module just to change padding. Use variants/composition instead.

## Consequences

### Positive

- Less custom code.
- Better consistency.
- Accessibility fixes propagate more easily.
- Easier shadcn maintenance.
- Less duplicate bug fixing.

### Negative

- Developers/agents must search before coding.
- Some use cases require extending variants instead of quickly creating a new component.
- Reuse decisions require a small amount of upfront discovery.

## Review Checklist

For every new UI component:

- Was the current module searched?
- Was `src/shared` searched?
- Was `src/components/ui` searched?
- Was shadcn checked?
- Could composition solve it?
- Could a variant solve it?
- Does the new component add a real reusable contract?
