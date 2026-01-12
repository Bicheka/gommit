# Contributing

Thanks for your interest in contributing
This project values simplicity, consistency, and a good developer experience.

The goal of these guidelines is to help us collaborate smoothly and avoid unnecessary rework.

## Project direction

The maintainer has final say on:
- public APIs
- UX decisions
- architectural choices

This is not a reflection of code quality, it’s to keep the project consistent.

## Non-negotiables

Please align with these before starting:
- CLI UX uses `clack/prompts`
- Formatting is enforced via Prettier
- TypeScript is preferred over JavaScript
- Public APIs must be documented

## Flexible areas

You generally have freedom in:
- internal implementation details
- helper utilities
- refactors that don’t change behavior

## Before opening a PR

If your change is:
- a new feature
- a UX change
- an architectural change

Please open an issue or discussion first so we can align.

## Pull requests

Please keep PRs:
- focused on a single concern
- reasonably small and reviewable

Large PRs are more likely to be delayed or requested to be split.

## PR checklist

Include in your PR:
- What this PR does
- Why this change is needed
- Anything reviewers should pay extra attention to

## Formatting & tooling

- Formatting is enforced via Prettier
- Please run `bun run lint-format` and fix any lint warnings before committing
- Editor-specific formatting will be overwritten
- It is highly recomended if you can to add Biomejs extension to your editor [Biomejs](https://biomejs.dev/guides/getting-started/#editor-integrations)

## Keeping your branch up to date

If a PR has conflicts:
- contributors are expected to rebase the latest `main`
- feel free to ask for help if conflicts are unclear

## Reviews & feedback

Feedback may include:
- requests for refactors
- design changes
- alignment with project direction

This does not mean the contribution isn’t appreciated.

## Final note

If you’re unsure about anything, ask.  
Early questions are always better than late rewrites

Thanks again for contributing!
