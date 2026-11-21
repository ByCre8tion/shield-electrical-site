# Shield Electrical: DESIGN.md (v2)

**The control room after dark.** A single dark world, cool graphite instead of black, soft instrument panels, light type that reads like an engineer's display, and champagne gold used only where power is flowing.

Shield shares an owner with Apex Builders, so this file exists to keep the two brands apart. If a choice below would make Shield look like Apex, it is wrong.

## 0. Shield is not Apex

| Decision | Apex Builders | Shield Electrical |
| --- | --- | --- |
| World | Light, warm white and chalk | Dark only, cool graphite |
| Display type | Barlow Condensed, bold, UPPERCASE | Sora Light 300, mixed case, tight tracking |
| Accent | Safety orange | Champagne gold from the shield, used only for power and the one primary action |
| Shape | Square, 2px buttons, 4px photos | Soft: pill controls, 20px panels, 14px inputs |
| Section headers | Numbered labels (01 SERVICES) | No numbers, no eyebrows. The headline is enough |
| Services | Hairline list | Breaker panel: tiles you switch on |
| Signature | House line drawings on paper | Live circuit traces and current |
| Motion | Rise and fade | Power on: a short flicker, switches throwing, current running |
| Voice | Warm craftsman | Calm technician. Short, exact, measured |

## 1. Design read and dials

Local service site for homeowners and facility managers in the Phoenix Valley, in a premium dark instrument language. **Variance 7, motion 6, density 4.**

## 2. Color

One theme, dark, locked. No section ever flips to a light background. Neutrals carry a slight cool bias toward the gold's complement, so the gold reads warmer.

| Token | Hex | Role | Contrast |
| --- | --- | --- | --- |
| `--night` | `#0B0D10` | Page canvas | |
| `--deck` | `#111419` | Panels, nav, cards | |
| `--deck-2` | `#171B21` | Raised panel, inputs | |
| `--seam` | `rgba(200,214,230,.09)` | Panel edges, dividers | |
| `--seam-2` | `rgba(200,214,230,.22)` | Input borders, outline buttons | 3:1 non text |
| `--ink` | `#E9EDF2` | Primary text | 16.6:1 on night |
| `--ink-2` | `#9AA4AF` | Secondary text | 7.7:1 on night |
| `--ink-3` | `#808A95` | Captions and meta only | 5.5:1 on night, 4.9:1 on deck-2 |
| `--gold` | `#D8B776` | Primary button fill, active switch, current | 10.2:1 on night |
| `--gold-hi` | `#F3DDA8` | Current core, highlighted words | |
| `--on-gold` | `#15130E` | Text on gold | 9.7:1 |
| `--live` | `#57D9A3` | Open now only | |
| `--fault` | `#FF6B5E` | Emergency only, always with words | |

**Rules**
- Gold appears on one action per view, on switched on states, and on current. Never as body text, never as a section background.
- Gradients only as light: a soft radial glow behind the hero panel and under active switches. No gradient fills on buttons or text.
- No pure black, no pure white.

## 3. Type

| Family | Role |
| --- | --- |
| **Sora** variable | Display at 300, UI and body at 400 to 600 |
| **JetBrains Mono** | Measured values only: amps, volts, ratings, license, phone in tables |

| Step | Size | Weight | Line | Tracking |
| --- | --- | --- | --- | --- |
| Display | `clamp(2.6rem, 5.4vw, 5rem)` | 300 | 1.02 | -0.04em |
| H1 page | `clamp(2.4rem, 4.6vw, 4rem)` | 300 | 1.05 | -0.035em |
| H2 | `clamp(1.9rem, 3.4vw, 3rem)` | 300 | 1.08 | -0.03em |
| H3 | `1.375rem` | 500 | 1.25 | -0.01em |
| Body | `1.0625rem` | 400 | 1.65 | 0 |
| Small | `0.875rem` | 400 | 1.5 | 0 |
| Value | `0.8125rem` mono | 500 | 1.3 | 0 |

**Rules**
- Mixed case everywhere. No uppercase headlines, no tracked uppercase labels above sections.
- Emphasis inside a headline is the same family at 500 in `--gold-hi`. One phrase max.
- Headlines max 2 lines in the hero, `text-wrap: balance`. Body max 62ch, `text-wrap: pretty`.
- Mono is for numbers that were measured, never for labels.

## 4. Shape and surface

- **Radius rule:** interactive controls are pills (999px). Surfaces and photos are 20px. Inputs are 14px. Nothing else.
- **Panels, not lines.** Content groups sit on `--deck` panels with a 1px `--seam` edge and a 1px inner top highlight `rgba(255,255,255,.04)`. No hairline lists with rules under every row.
- **Depth** comes from surface steps and light: a panel that is "on" gets a soft gold glow `0 0 0 1px rgba(216,183,118,.35), 0 20px 60px -30px rgba(216,183,118,.45)`. No drop shadows otherwise.
- **Photography:** cool graded, dark, warm practical light. Always inside a 20px frame with a subtle top to bottom scrim when text sits near it. Never full bleed behind text.

## 5. Signature: power

1. **Live circuit.** Gold traces behind the hero and the final call to action. Current pulses travel the traces, traces brighten near the cursor, a rare short arc. Static under reduced motion.
2. **Breaker panel.** Each service is a tile with a real switch. Hovering or focusing a tile throws the switch on: the toggle slides, the tile edge lights, the photo brightens. 220ms, `cubic-bezier(.2,0,0,1)`.
3. **Power on reveal.** Headlines and panels enter with a 3 step flicker, opacity 0 to .7 to .25 to 1 over 260ms, then settle. Used once per section, never on repeat interactions.
4. **Current line.** The process is a horizontal conductor. As it scrolls into view, current fills the line from node to node and each node lights.
5. **Page change.** The old page dims out in 180ms, the new one powers on.

## 6. Components

- **Nav:** floating pill bar inset 12px from the top, deck surface with blur. Logo left, five links center, open now status and one gold "Book service" pill right.
- **Buttons:** primary gold pill, ink text. Secondary pill with `--seam-2` edge. Press scales to 0.97. One label per intent: "Book service" everywhere for booking, "Call" plus number for calls.
- **Trust bar:** one rounded panel under the hero with four values inline: Google rating with the real G, years, ROC license, BBB seal slot.
- **Panel check:** an honest quick tool. Panel size, central AC, what they want to add. It gives a plain recommendation and says it is a rough guide until a load calculation.
- **Reviews:** one row of panels drifting at a constant pace, the only marquee on the page. G mark, stars, verified tick, Pause control.
- **Forms:** dark panel, 14px inputs on `--deck-2`, labels above, errors in words below, photo drop zone.
- **Text widget:** gold ringed round launcher with Jason's photo, deck panel, gold bubbles for the visitor.
- **Footer:** quiet deck panel, large shield mark, socials, BBB slot, license, hours.

## 7. Motion values

| Thing | Duration | Easing |
| --- | --- | --- |
| Hover and color | 150ms | ease-out |
| Switch throw | 220ms | `cubic-bezier(.2,0,0,1)` |
| Power on reveal | 260ms flicker then 500ms settle | steps then ease-out |
| Panels open | 350ms in, 180ms out | `cubic-bezier(.16,1,.3,1)` |
| Press | 0.97, 120ms | ease-out |

Everything collapses to instant under `prefers-reduced-motion`.

## 8. Voice

Calm technician. Say the measured thing: "200 amp panel, power back the same afternoon." Short sentences. No hype, no exclamation marks, no em dashes.

## 9. Pages

Home, Services, six service pages, Projects, About, Service areas, Reviews, FAQ, Careers, Book service (contact), 404.

## 10. Never

- Uppercase display type, numbered section labels, tracked eyebrows over every section.
- Light sections, paper textures, orange.
- Square buttons, hairline lists, spec tables with a rule under every row.
- Lightning bolt clip art, neon blue glows, stock sparks.
- Two marquees on one page.
