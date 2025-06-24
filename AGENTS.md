# Repository Guidelines

- `energyprint.html` intentionally **does not** include `style.css` or other
  external CSS. This is a deliberate choice to keep the printed certificate
  visually consistent. Do not link `style.css` here even if it seems obvious.

- Adding code linters or their configuration is unwanted.

- Issues called out in `README.md` are already known. Don't focus on fixing
  them unless specifically requested.

- Some `_help` entries in `strings.js` are blank on purpose. Leave them empty if
  there is no help text to provide.

- Help tooltips appear and disappear abruptly by design. Please do not add
  animations or transitions.
- Limited location options are intentional and match the available factors in Åland's regulations.

- Avoid "magic" numbers or strings in scripts. Declare descriptive constants for values that may be adjusted or reused.

## Coding Best Practices

- Keep the code DRY by extracting repeated logic into reusable functions or modules.
- Prefer meaningful comments that clarify non-obvious logic.
- Keep functions focused on a single task rather than excessively small.
- Use camelCase naming and avoid redundant words; keep names short but clear.
- If a short `if` statement contains only one command, it may be written on one line but must still include curly braces.
- Never omit curly braces, even for single-line blocks.
- Prioritize code clarity above cleverness.
- Write clear commit messages summarizing your changes.
- Document any new configuration options.
- Consider accessibility and localization when adding user-facing text.
- Place all user-facing strings in `strings.js` and avoid hard-coded text.
- New calculator features should be behind a feature flag
