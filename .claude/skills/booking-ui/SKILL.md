---
name: booking-ui
description: Use when you add or change a screen or component in the MITSPI System app. Gives the design references and the check steps for this project.
---

# Booking UI workflow

1. Look for an existing component first. Reuse it.
   - Shared parts: `src/components/`. Every screen uses `StepLayout`
     (title at top, one primary button at bottom).
   - Feature parts: `src/features/<name>/components/`. Booking facts use `BookingSummary`.
   - A part moves to `src/components/` when a second feature needs it.
2. If no component fits, search the shadcn MCP registry.
   Add it with `npx shadcn@4.22.1 add <name>`.
3. For booking patterns (date + time slots), compare with the Cal.com booker:
   https://github.com/calcom/cal.com
4. Use theme tokens from `src/index.css` (`bg-primary`, `text-muted-foreground`).
   Do not hard-code colors.
5. Design mobile first at 360px width. Touch targets at least 48px (`h-12`).
6. Format every date and time with the helpers in `src/lib/time.ts`.
7. Design each state: no free slots, all booked, long names, form errors.
8. For look and layout, follow the `/web-ui-design` skill.
   Check the result with screenshots at 360, 768 and 1280 px (dev server must run):
   `sh .claude/skills/booking-ui/screens.sh / <out-dir>`, then read the 3 images.
   Use the Playwright MCP only when you must click first (a date, a slot).
9. Run `npm run build` and show the output.

## Which model

Use the cheapest model that does the work well. A skill cannot switch the model.
Tell the user once to run `/model <name>`, and say why in one line.

| Work | Model |
|---|---|
| Run the build or screenshots and report the output | `haiku` |
| Small change on an existing screen (text, size, spacing, one state) | `sonnet` |
| New screen, redesign, or judging the design from screenshots | `opus` |

If the session is on Haiku and the work is in the `opus` row, stop and ask the user to switch.

## Keep this skill current

When a task finds a case this file does not cover, solve it first.
Then propose the exact one-line edit. Edit only after the user says yes.
