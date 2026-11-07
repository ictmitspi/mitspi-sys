---
name: software-best-practices
description: Use when you write, change, refactor or review code in any language. Gives rules for modular, readable, maintainable code, a safe refactor recipe, code smells to look for, and an OWASP security check for each change.
---

# Software best practices

The user's rules in `~/.claude/CLAUDE.md` still apply (simplest solution, Rule of Three,
no silent fixes). This skill adds the details and the checklists.

## 1. Modular code
- One module = one job. If you need "and" to describe it, split it.
- Keep layers apart: UI → logic → data. Logic does not import UI.
  (For this repo: `src/lib/` is pure logic, `src/components/` is UI.)
- Depend on small, clear inputs (props, function arguments), not on globals.
- A module hides its details. Export only what other modules need.
- Put code where a new developer would look for it first.

## 2. Readable code
- Names say what a thing is or does: `freeSlots`, `formatTime`. No `data2`, `tmp`, `handleStuff`.
- Booleans read as a question: `isFree`, `hasError`.
- A function does one thing at one level of detail. Aim for under ~30 lines.
- Return early instead of deep `if` nesting.
- No magic numbers. Name them (`SLOT_MINUTES = 30`).
- Comments say *why*, not *what*. If code needs a *what* comment, rename or split it.
- Derive values instead of storing copies of them (one source of truth).

## 3. Maintainable code
- KISS: the simplest code that works today. YAGNI: no code for a future that may not come.
- DRY at the third repeat (Rule of Three). Two copies are cheaper than the wrong abstraction.
- Strict types. No `any`. Make wrong states impossible to express in the type.
- Pin dependency versions. Add a dependency only when it saves real work.
- Keep a change small. One pull request = one idea (Google eng-practices).

## 4. Code smells (Fowler, *Refactoring* 2nd ed.)
Look for these when you read code. Report them; refactor only the code in your task.

| Smell | Usual fix |
|---|---|
| Long function | Extract function |
| Large component or module | Split by job |
| Duplicated code (3+ times) | Extract shared function |
| Long parameter list | Group into one object |
| Feature envy (uses another module's data more than its own) | Move function |
| Primitive obsession (strings for everything) | Small type or union |
| Shotgun surgery (one change touches many files) | Move related code together |
| Dead code | Delete it (ask the user first) |

## 5. Safe refactor recipe
1. Make sure the code builds and works before you start.
2. Change structure in small steps. Never change behavior in the same step.
3. Build (and test) after each step.
4. Commit refactors and behavior changes separately.

## 6. Security check for every change (OWASP Top 10:2025)
Name each risk the change touches in one line.

| Risk | What to check |
|---|---|
| A01 Broken Access Control | The server checks who the user is and what they may do. Never trust the client. |
| A02 Security Misconfiguration | No debug mode, default passwords or open CORS in production. |
| A03 Software Supply Chain Failures | Pinned versions, lockfile committed, `npm audit` clean, maintained packages. |
| A04 Cryptographic Failures | HTTPS only. No secrets in code, logs or client bundles. |
| A05 Injection | Parameterized queries. No string-built SQL or shell commands. |
| A06 Insecure Design | Think about abuse cases: double submits, races, very large input. |
| A07 Authentication Failures | Use a proven auth library. No home-made login or tokens. |
| A08 Software or Data Integrity Failures | Verify what you download or deserialize. |
| A09 Security Logging and Alerting Failures | Log security events on the server. Never log personal data or secrets. |
| A10 Mishandling of Exceptional Conditions | Fail closed. Show safe messages; keep details in server logs. |

Also use: OWASP API Security Top 10 (APIs), OWASP Mobile Top 10 (apps),
and OWASP ASVS (detailed checks).

### Web front end (React, Vite)
- React escapes text output. Do not use `dangerouslySetInnerHTML` with user input.
- Do not put user input in `href` or `src` without a check (`javascript:` URLs).
- Every `VITE_*` env value is public in the bundle. Never put a secret there.
- Validate input at the edges (form, API response). The server validates again.
- Use `maxLength` on text inputs.

### Back end (later: Spring Boot)
- Use Spring Security for auth. Check roles on the server (`@PreAuthorize`).
- Use JPA or prepared statements. Never concatenate SQL.
- Two users can submit the same slot at once. Use a transaction and a database
  unique constraint, and return a clear "slot already taken" error.

## 7. Before you say "done"
- [ ] Each changed module still does one job.
- [ ] Names are clear. No dead or commented-out code.
- [ ] No new duplication at the third repeat.
- [ ] Security risks named (or "none").
- [ ] Build passes. Show the real output.

## Which model

Use the cheapest model that does the work well. A skill cannot switch the model.
Tell the user once to run `/model <name>`, and say why in one line.

| Work | Model |
|---|---|
| Run the build or `npm audit` and report the result | `haiku` |
| Small change that follows existing code; rename; extract a function | `sonnet` |
| Refactor across modules, security review, auth, data or race-condition design | `opus` |

If the session is on Haiku and the work is in the `opus` row, stop and ask the user to switch.

## Keep this skill current

When a task finds a smell, risk or rule this file does not cover, solve it first.
Then propose the exact one-line edit. Edit only after the user says yes.
