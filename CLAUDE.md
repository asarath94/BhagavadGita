# Bhagavad Gita App

## Project

Telugu Bhagavad Gita reading app — Next.js, static content (no
backend/DB), PWA-installable. Content sourced from a Telugu PDF,
transcribed chapter by chapter via Claude Code vision (see
content/verse-index.json for full book structure, content/chapters/\*.json
for transcribed content — not all chapters exist yet, that's expected).

## Design

Always apply the apple-design skill for any UI, styling, animation, or
interaction work — typography, motion, spacing, and the core design
principles (simplicity, wayfinding, craft) apply by default, not just
when explicitly asked for "polish." This is a calm, content-first
reading app, not a marketing site — restraint over decoration.

## Process

Apply karpathy-guidelines on all non-trivial work in this project:

- Don't silently pick an interpretation of an ambiguous task — ask
- Make surgical, scoped edits — don't touch unrelated code
- Define clear success criteria before iterating, not vague passes
- Avoid unnecessary abstraction

## Code style

Apply ponytail (lazy-senior-dev / YAGNI mode) to all code in this
project by default: standard library and native platform features
before dependencies, the shortest correct implementation, no
unrequested abstractions. This does NOT relax validation, error
handling, security, or accessibility — those stay uncompromised;
minimalism applies to structure and code volume, not robustness.

## Content schema

{ id, label, sloka, translation, explanation } per verse.
Grouped ranges (e.g. "1.32-35") are a single entry, not split.
Color convention in source PDF: blue = sloka, red = translation,
black = explanation.

## Status

Phase 0 (content extraction) in progress alongside Phase 1 (app
build) — chapters transcribed incrementally, app must handle
missing chapters/verses gracefully rather than assuming full content.

## Transcription work (extraction tasks)

Any task reading Telugu content from content/raw-pages/ page images
(verse transcription, chapter titles, etc.) must:

- View page images directly in-session — never write a script that
  calls the Claude API with an API key; that switches to pay-per-token
  billing instead of the existing subscription plan
- Write output straight to the target file — never print transcribed
  Telugu text in the chat reply, only short progress confirmations
  (terminal rendering of complex Telugu conjuncts corrupts the display)
