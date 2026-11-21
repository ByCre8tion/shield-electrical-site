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
- **Photography: real jobs only.** No generated images anywhere on the site, ever. Until Jason sends job photos, every image slot is a viewfinder placeholder: a 20px frame on `--deck`, gold corner brackets, a mono caption naming the shot we need ("Panel upgrade, after"). When real photos land: dark, warm practical light, inside the same frame, never full bleed behind text.
- **Gold is a material, not a glow.** Gold surfaces read as brushed brass: a top to bottom gradient `#F0D49A` to `#C9A25E`, a 1px light inner top edge and a 1px dark outer edge. No colored bloom shadows under buttons.

## 5. Signature: power

1. **Live circuit.** Gold traces behind the hero and the final call to action. Current pulses travel the traces, traces brighten near the cursor, a rare short arc. Static under reduced motion.
2. **Breaker panel.** Each service is a tile with a real switch. Hovering or focusing a tile throws the switch on: the toggle slides, the tile edge lights, the photo brightens. 220ms, `cubic-bezier(.2,0,0,1)`.
3. **Power on reveal.** Headlines and panels enter with a 3 step flicker, opacity 0 to .7 to .25 to 1 over 260ms, then settle. Used once per section, never on repeat interactions.
4. **Current line.** The process is a horizontal conductor. As it scrolls into view, current fills the line from node to node and each node lights.
5. **Page change.** The old page dims out in 180ms, the new one powers on.

## 6. Components

Patterns studied on 21st.dev and rebuilt by hand for this system (no copied code, no React). Each line names the source pattern so the lineage is clear.

### Buttons

| Name | Use | Build | Source pattern |
| --- | --- | --- | --- |
| **Brass** (primary) | Book service, Send request | Brushed gold gradient, 1px light inner top edge, 1px dark outer edge, ink text. Hover: a narrow light sheen sweeps left to right once (450ms). Press: 0.96 and the inner edge flips to a shadow so it looks pushed in | Texture Button, Liquid Metal Button |
| **Conduit** (secondary) | Call, secondary actions | Pill with `--seam-2` edge. Hover: a short gold beam runs around the edge once (conic gradient, 900ms). Phone number in mono | Spinning Border Button, Border Beam |
| **Slide link** (tertiary) | "See the service", "All projects" | Text plus arrow. Hover: the label slides up and an identical gold copy slides in from below, arrow nudges 3px | One Button, hover slide |
| **Switch** | Service tiles | The breaker toggle already in the tile throws on hover or focus | Shield original |

One label per intent: "Book service" for booking, "Call" plus the number for calls. Press is 0.96 on every button. Disabled never scales.

### Sections

| Section | Build | Source pattern |
| --- | --- | --- |
| **Nav** | Floating pill bar, five links, open status LED, Brass "Book service". Active link sits on a soft pill | Limelight Nav (restrained) |
| **Hero** | Headline and two buttons left. Right: a **panel schedule**, the printed card inside every breaker door, drawn as a corner framed instrument. Twelve numbered circuits, each labeled with a service, each with a live LED; hovering a row lights it and links to the service | Corner Frame, Shield original |
| **Name plates** (trust) | Four engraved metal plates screwed to the page: Google rating, ROC license, Licensed and insured, BBB. Anodized dark finish, mono engraving, four screw heads | Engraved Client Plates |
| **Odometer numbers** | Inside the name plates: years in business and Google review count sit on mechanical drums that roll into place once when seen. No separate stats band. Static under reduced motion | Mechanical Odometer, Rolling Digits |
| **Breaker tiles** (services) | Bento of service tiles with the switch. Cursor spotlight: a soft gold radial follows the pointer inside the tile | Spotlight Card |
| **Panel check** | The quick load tool. Output meter fills like a gauge | Shield original, KPI Tile |
| **Conductor** (process) | Four steps on a line that fills as the section enters | Scroll Timeline |
| **Before and after** (projects) | Draggable divider between two frames; keyboard arrows move it 5%. Placeholders until real photos | Image Compare |
| **Job tracker** (book page) | What happens after you send the form: Received, Called back, Written price, Scheduled. First step lit | Order Tracking, Delivery Progress |
| **FAQ** | Panels with a plus that turns into a minus | Accordion Plus Minus |
| **Reviews** | One row drifting at constant pace, the only marquee on the page, Pause control | Testimonials marquee |
| **Wordmark footer** | Link columns, status line, then SHIELD set huge and cut off at the bottom, fading into the night | Wordmark Footer, Large Name Footer |
| **404** | "404" in seven segment digits, headline "This circuit is dead", buttons home and back | Oversized 404 Numeral, 7 Segment Number |
| **Forms** | Dark panel, 14px inputs on `--deck-2`, labels above, errors in words below, photo drop zone | Shield original |
| **Text widget** | Round launcher with Jason's photo, gold ring, deck panel | Shield original |

## 7. Motion values

| Thing | Duration | Easing |
| --- | --- | --- |
| Hover and color | 150ms | ease-out |
| Switch throw | 220ms | `cubic-bezier(.2,0,0,1)` |
| Power on reveal | 260ms flicker then 500ms settle | steps then ease-out |
| Panels open | 350ms in, 180ms out | `cubic-bezier(.16,1,.3,1)` |
| Press | 0.96, 150ms | ease-out |
| Brass sheen | 450ms once per hover | ease-out |
| Conduit beam | 900ms once per hover | linear |
| Odometer roll | 900ms, drums staggered 60ms | `cubic-bezier(.2,0,0,1)` |

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
- Generated images of any kind.

## 11. Does this look made by AI?

Run this before shipping any section. If any line is true, fix it.

- A highlighted gold word in every headline. Gold emphasis appears in the hero only.
- Every section opens with the same headline plus grey lead block. Vary it: some sections lead with the component, some with a single line.
- Glow shadows under buttons or cards. Gold is a material (section 4).
- Three or four equal cards in a row with an icon on top of each.
- Vague claims ("top quality", "unmatched service"). Say the measured thing or say nothing.
- Fake numbers. Stats show TODO values marked for Jason until real ones exist.
- Stock or generated photos. Placeholders until real job photos.
