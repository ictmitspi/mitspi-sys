---
name: web-ui-design
description: Use when you design, restyle or review any web screen or component, or when the user says a UI looks too simple, plain, messy or unclear. Gives web UI/UX rules of thumb (hierarchy, spacing, type, color, layout, UX laws, accessibility) and a screenshot review loop with the Playwright MCP.
---

# Web UI/UX design rules of thumb

Use these rules with the project skill (for this repo: `/booking-ui`).
The user's 10 UI rules in `~/.claude/CLAUDE.md` still apply. Do not repeat them here.

## 1. Look before you change
1. Start the dev server (`npm run dev`).
2. Use the Playwright MCP to open the page and take screenshots at 360, 768 and 1280 px wide.
3. Write down the 3 biggest problems. Fix those first. Do not restyle everything.
4. Take the screenshots again after the change. Compare before and after.

## 2. Visual hierarchy (Refactoring UI, Wathan & Schoger)
- Ask: "What must the user see first?" Make only that item strong.
- Make other items quieter (lighter weight, muted color) instead of making the main item louder.
- Use weight and color for hierarchy, not only size.
- Labels are a last resort. If the format says what it is (a date, a time), drop the label.
- Squint test: blur your eyes at the screenshot. The focal point must still stand out.

## 3. Spacing and layout
- Use the spacing scale only (Tailwind 4 = 4 px steps; Material 3 uses a 4/8 dp grid). No random values.
- Start with too much white space, then remove it.
- Proximity (Gestalt): related items close, groups far apart.
  Space between groups must be clearly larger than space inside a group.
- Align to one edge. Every section on a screen uses the same width and left edge.
- Separate groups with space or a background first. Use borders less. Never a card inside a card.
- Body text line length: about 45–75 characters (`max-w-prose`).
- Design mobile first. Add a desktop layout only when it helps the task (for example 2 columns).

## 4. Typography
- Body text at least 16 px on mobile (`text-base`). Small text at least 12 px.
- Use 2–3 sizes and 2 weights per screen. More sizes look messy.
- Headings: tighter line height. Body: line height about 1.5.
- Use tabular numbers for times and counts that line up (`tabular-nums`).

## 5. Color
- Start in grayscale. Add color last, and only for meaning.
- One brand color for the primary action and the selected state. Neutrals for the rest.
- Status colors: red = error/danger, amber = warning, green = success. Always add a text label.
- Contrast (WCAG 2.2): text 4.5:1, large text and UI parts (borders, icons, focus rings) 3:1.
- Define every color as a theme token (for this repo: `src/index.css`). Never hard-code hex in components.

## 6. UX laws that matter most (lawsofux.com)
- Jakob's law: users expect your site to work like other sites. Use known patterns
  (for booking: date then time slots, like Cal.com and Calendly).
- Fitts's law: big, close targets are faster. Primary button big and in thumb reach.
- Hick's law: more choices = slower decisions. Hide or remove options that cannot be used.
- Doherty threshold: respond in under 400 ms. Show feedback at once on every tap.

## 7. Nielsen's 10 heuristics (quick review list, NN/g)
1. Visibility of system status — show what is selected and what happens next.
2. Match the real world — use the teacher's words, not code words.
3. User control — Back and Undo are easy to find.
4. Consistency — same thing, same look, same words.
5. Error prevention — disable or hide what is not allowed. Do not let the user make the error.
6. Recognition over recall — show choices; do not make the user remember.
7. Flexibility — shortcuts for repeat users are optional.
8. Minimal design — every extra item competes with the important ones.
9. Help users recover — error text says what is wrong and how to fix it.
10. Help — a short hint where the task is not obvious.

## 8. Forms (Baymard Institute, NN/g)
- Label above the field. Placeholder is an example, never the label.
- Mark the optional fields, not the required ones (if most are required).
- Show the error next to the field, after submit or on blur. Not on every key press.
- Use the right input type and `autoComplete`.

## 9. Interaction and motion
- Every control has hover, focus-visible, active, disabled and selected states.
- Focus ring always visible. A sticky header or footer must not cover the focused item (WCAG 2.4.11).
- Motion 150–250 ms, ease-out. Respect `prefers-reduced-motion` (`motion-safe:`).
- Motion explains a change. Never use it for decoration.

## 10. Before you say "done"
- [ ] Screenshots at 360, 768 and 1280 px look right. No horizontal scroll.
- [ ] One focal point and one primary button per screen.
- [ ] Spacing uses the scale. Groups are clear.
- [ ] Contrast checked. Color is never the only signal.
- [ ] Keyboard: Tab order is logical; focus is visible.
- [ ] Every state is designed: empty, error, long text, many items.
- [ ] Build passes. Show the output.

## Which model

Use the cheapest model that does the work well. A skill cannot switch the model.
Tell the user once to run `/model <name>`, and say why in one line.

| Work | Model |
|---|---|
| Run the build and screenshot commands; report what they print | `haiku` |
| Apply one rule from this file to one component | `sonnet` |
| Choose a layout, redesign a screen, judge hierarchy on screenshots | `opus` |

If the session is on Haiku and the work is in the `opus` row, stop and ask the user to switch.

## Keep this skill current

When a review finds a rule the user had to repeat, or a rule that was wrong, solve it first.
Then propose the exact one-line edit. Edit only after the user says yes.
