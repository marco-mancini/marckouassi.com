# Project instructions

Apply these rules when changing this portfolio.

## Structure and reuse
- Keep the published portfolio static unless a framework migration is explicitly requested. Do not add React dependencies just to use the starter component.
- Reuse existing page patterns and Design System styles. Avoid duplicate HTML pages inside `Design_System/styles/`.
- Keep CSS modules in `Design_System/styles/`; `Index.css` is their single entry point.
- Keep shared visual values in `Design_System/styles/Tokens.css`. Define each color and design token once; do not redeclare the palette in `Theme.css` or component styles.
- `Tailwind.css` is a small project utility layer, not the Tailwind framework. Do not describe it as Tailwind without adding and configuring the actual build tool.

## Visual and responsive quality
- Build from narrow screens upward and preserve usability at 320 px, tablet, and desktop widths.
- Use the existing breakpoints in `Responsive.css` unless a component-level container query is a better fit.
- Keep interactive targets at least 44 by 44 px. Use semantic links and buttons, keyboard focus styles, and accessible names for icon-only controls.
- Give images meaningful alt text and declared width and height.
- Put reduced-motion overrides in the same stylesheet as the animation they affect.
- Use design tokens for colors. Raw color values and opacity-based colors belong only in `Tokens.css`.
- Do not add remote fonts, icon CDNs, or new remote assets. Prefer local files in `Public/` and `Design_System/assets/`. Existing remote Unsplash images are provisional placeholders; replace them with approved local project images before launch.
- Preserve readable contrast between text and its background.

## Content and verification
- Do not invent professional history, project facts, or contact details. Keep unconfirmed information visibly marked as provisional.
- Keep visible French copy correctly accented and proofread.
- Before merging a visual change, check the actual published entry point and asset paths produced by the Pages workflow, not only a local or duplicate preview page.
- Review the page at 320 px, tablet, and desktop widths and verify that all images and CSS load from the assembled Pages artifact.
