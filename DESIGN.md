# Shield Electrical: DESIGN.md (v3)

**The grid at night.** A monochrome world of graphite, grain and fine grid lines, like a utility map or a wiring schematic printed on black. One color moves through it: signal yellow, the current. Where the yellow travels, things light up. Everything else stays quiet, grey and exact.

Shield shares an owner with Apex Builders. This file keeps the two brands apart. If a choice would make Shield look like Apex, it is wrong.

## 0. What Shield is

Shield Electrical is a licensed commercial and residential electrical contractor based in Chandler, Arizona, working across the Phoenix Valley and growing into more states. Services: commercial electrical, residential electrical, panel and AC upgrades, EV chargers, custom lighting and emergency repairs. Customers are homeowners and facility managers who want a licensed crew, a written price and power back on. The site must feel like the company that runs the grid, not a handyman.

## 1. Shield is not Apex

| Decision | Apex Builders | Shield Electrical |
| --- | --- | --- |
| World | Light, warm white and chalk | Black and grey, grain, grid lines |
| Display type | Barlow Condensed, bold, UPPERCASE | Sora Light 300, mixed case, tight tracking |
| Accent | Safety orange | Signal yellow, only where power flows |
| Shape | Square | Pill controls, 20px panels, hairline grids |
| Imagery | House line drawings, photos | Generated in code: wireframe city, particles, dots, schematics. Real job photos only, never generated photos |
| Signature | Drawings on paper | A line of current that travels and powers things on |
| Voice | Warm craftsman | Calm technician. Short, exact, measured |

## 2. Design read and dials

Local service company presented like infrastructure. Premium, cinematic, monochrome with one live color. **Variance 8, motion 7, density 4.** Lots of open space around very few elements (reference: Hydraoo hero).

## 3. Color

Dark only. Neutrals are true greys with no tint, so yellow is the only color on the page.

| Token | Hex | Role |
| --- | --- | --- |
| `--night` | `#0A0A0B` | Canvas |
| `--deck` | `#121314` | Panels |
| `--deck-2` | `#1A1B1D` | Raised panels, inputs |
| `--wire` | `rgba(255,255,255,.07)` | Grid lines, wireframes |
| `--seam` | `rgba(255,255,255,.10)` | Panel edges |
| `--seam-2` | `rgba(255,255,255,.22)` | Outline controls (3:1) |
| `--ink` | `#EDEDED` | Primary text, 17:1 |
| `--ink-2` | `#A3A3A3` | Secondary text, 8:1 |
| `--ink-3` | `#858585` | Captions and HUD labels, 5.4:1 |
| `--volt` | `#F2CF4A` | Current, live data, active states, focus |
| `--volt-hi` | `#FFE68A` | The bright core of a line or ping |
| `--on-volt` | `#141208` | Text on yellow |
| `--live` | `#8FE388` | Open now, system OK readouts. Never decorative |
| `--fault` | `#FF5A4E` | Emergency only, always with words |

**Rules**
- Yellow means power. It is on the travelling line, pings, active states, the open hour LED and one word in the hero. It is never a section background or body text.
- Glow is allowed on energy only: lines, nodes, pings. A soft bloom like a sodium lamp, `0 0 12px rgba(242,207,74,.55)`. Never on buttons or cards.
- The logo keeps its own brass gradient. Yellow sits beside it, it does not replace it.

## 4. Texture

Every screen carries the same three layers so it feels printed, not rendered.
1. **Grain:** an SVG noise layer over the whole page at 6% opacity, fixed.
2. **Grid:** 96px hairline grid in `--wire` behind hero and story sections, fading at the edges.
3. **HUD marks:** corner brackets, crosshairs, tick rulers, coordinates. Small, grey, mono.

## 5. Type

| Family | Role |
| --- | --- |
| **Sora** variable | Display at 300, UI and body 400 to 500 |
| **JetBrains Mono** | Data: amps, coordinates, times, license, phone, HUD labels |

| Step | Size | Weight | Line | Tracking |
| --- | --- | --- | --- | --- |
| Display | `clamp(3rem, 6.6vw, 6.25rem)` | 300 | 1 | -0.045em |
| H2 | `clamp(2rem, 3.8vw, 3.4rem)` | 300 | 1.05 | -0.035em |
| H3 | `1.375rem` | 500 | 1.25 | -0.01em |
| Body | `1.0625rem` | 400 | 1.65 | 0 |
| HUD label | `0.6875rem` mono uppercase | 500 | 1.3 | 0.12em |

**Rules**
- Headlines mixed case. HUD labels are the only uppercase, and they label data, never a section.
- Emphasis in the hero only: one word in `--volt`. Elsewhere headlines stay plain.
- Selected or current items step up in size and brightness (01 small, **02 large**, 03 small), like the wildlife slider.

## 6. Shape and surface

- Pills for controls, 20px for panels, 14px for inputs.
- No floating rounded hero card. The hero runs edge to edge and the nav sits directly on it.
- Panels are flat `--deck` with a `--seam` edge. Glass only on HUD chips over moving canvases: `rgba(18,19,20,.6)` with 12px blur.
- No colored shadows.

## 7. Signature moments (all drawn in code)

1. **Grid city hero.** A wireframe city in grey line work, seen from above at an angle. A yellow line of current runs from a substation through the streets to one building, which powers on: its windows light and a radar ring pulses from it. The word SHIELD sits behind the buildings so the towers cut through it. Cursor moves the camera slightly. (References: city wireframe, wildlife radar, V2V glow.)
2. **Path of power.** A scroll story on a schematic background. The section pins; as you scroll, current draws along the schematic from the meter to the panel to the circuits, and each step label grows when it is current. (References: shipping container pinned over text, wiring schematic.)
3. **Charged field.** A terrain of tiny yellow dots that ripples slowly; the cursor sends a wave through it. Behind the panel check. (Reference: yellow dots over the green field.)
4. **Coverage ring.** One big number in the middle of a segmented ring, four data cards around it. (Reference: land ring stats.)
5. **Particle globe footer.** A grey dot globe turning slowly, Arizona in yellow with pings at the office and the Valley. Above the footer links the word SHIELD made of particles that drift away from the cursor. (References: particle footer, globe, Solvana.)
6. **Grid map.** Service areas page: black and white map of Arizona and its neighbors, grid overlay, coordinates, city pins. (Reference: Interzone map.)

All canvases: cap 30fps, pause offscreen and in background tabs, draw one still frame under reduced motion, and never block text.

## 8. Components

| Component | Spec |
| --- | --- |
| **Nav** | Flat on the page, no container. Logo left, five plain links, open status, a light pill button right. Gains a dark blurred bar only after scrolling. |
| **Primary button** | Light pill `--ink` with dark text and a dark circle holding the arrow at the end. Hover: the circle turns yellow and the arrow nudges. Press 0.96. (Reference: Hydraoo, RooFix.) |
| **Secondary button** | Outline pill; a yellow beam runs the rim once on hover. Phone numbers in mono. |
| **Trust pill** | Small glass chip above the headline with a yellow spark: "Licensed ROC contractor, Chandler AZ". |
| **Trust row** | Overlapping round avatars of real reviewers (initials until photos exist) with "Rated 5.0 by Valley homeowners", then Google, Facebook and BBB marks. |
| **HUD corners** | Coordinates of the office, live Arizona time, grid status OK, scale ruler. Mono, grey, small. |
| **Name plates** | Engraved plates for rating, years, license, BBB. Kept from v2. |
| **Service tiles** | Breaker tiles with switch and spotlight. Kept from v2. |
| **Panel check** | Kept, set over the charged field. |
| **Reviews** | One drifting row, the only marquee per page. |
| **Forms, job tracker, FAQ, before and after, 404** | Kept from v2 in the new colors. |

## 9. Motion values

| Thing | Duration | Easing |
| --- | --- | --- |
| Hover and color | 150ms | ease-out |
| Press | 0.96, 150ms | ease-out |
| Current travel in hero | 2.4s per run, then hold | ease-in-out |
| Radar ring | 2.8s, repeats while lit | ease-out |
| Story steps | Driven by scroll position | linear |
| Reveal | 600ms, 12px rise and fade | `cubic-bezier(.16,1,.3,1)` |

Reduced motion: every canvas draws one still, lit frame. Nothing loops.

## 10. Voice

Calm technician. "200 amp panel, power back the same afternoon." No hype, no exclamation marks, no em dashes, no hyphens in copy.

## 11. Never

- Generated photos or generated people anywhere. Image slots stay as labeled placeholders until Jason sends real photos.
- Colored backgrounds, gradients as decoration, purple or blue glow.
- A rounded card hero floating inside the page.
- Gold highlighted words in every headline.
- Fake numbers. Unconfirmed stats are marked TODO for Jason.
- Two marquees on one page. More than one canvas animating in the same viewport.

## 12. Does this look made by AI?

Check every section. If a line is true, fix it.
- Three or four equal cards with icons on top.
- The same headline and grey paragraph opening every section.
- Glow on buttons or cards.
- Vague claims ("top quality"). Say the measured thing or nothing.
- Stock or generated imagery.
