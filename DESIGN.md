# Shield Electrical: DESIGN.md

**Live wire in a dark switchgear room.** A graphite canvas, brushed brass taken from the shield in the logo, hairline rules like a panel schedule, and one signature behavior: current that travels the page.

Shield is a licensed commercial and residential electrical contractor in Chandler, Arizona. The site has to feel like the work: precise, safe, quietly powerful. It should read as engineered, never decorated. Every visual choice below is a rule, not a suggestion.

Built from the Refero electrical set. What we took from each:

| Reference | Rule we kept |
| --- | --- |
| ON.energy | Full bleed sections that switch mode (dark, light, one brass block). Flat. No shadows. Tight radii. |
| Oxide Computer | 1px hairlines instead of cards. Mono labels that read like a system readout. One status color used like an LED. |
| Electronic Materials Office | Charcoal canvas, never pure black. One glowing accent, rationed to the primary action. |
| Rivian | Type at architectural scale. Photography edge to edge, never boxed on landing pages. |
| T1 Energy | The page as a technical spec sheet. Restraint is the brand. |

## 1. Color

The palette is the logo: black and the brass gradient (`#FBDB9B` to `#AB7D3B`). Everything else is neutral. Color is rationed.

### Dark mode (default surface)

| Token | Hex | Role |
| --- | --- | --- |
| `--switch` | `#0E0F10` | Page canvas, hero, nav, footer. Never `#000`. |
| `--panel` | `#16181A` | Alternate dark section, form fields on dark |
| `--raised` | `#1F2225` | Hover fill, the one raised surface (widget, menus) |
| `--rule-d` | `rgba(242,238,230,.12)` | Hairlines on dark |
| `--rule-d-strong` | `rgba(242,238,230,.24)` | Input borders on dark (3:1 non text) |
| `--volt` | `#F2EEE6` | Primary text on dark (16.6:1) |
| `--steel` | `#9BA0A5` | Secondary text on dark (7.3:1) |

### Light mode (reading surface)

| Token | Hex | Role |
| --- | --- | --- |
| `--bone` | `#F3F0E8` | Light section canvas, the "printed panel schedule" |
| `--paper` | `#FBFAF6` | Cards and inputs on bone |
| `--ink` | `#121315` | Text on light (16.3:1) |
| `--graphite` | `#4A4E53` | Body copy on light (7.4:1) |
| `--muted` | `#5E6368` | Captions on light (5.3:1) |
| `--rule-l` | `rgba(18,19,21,.12)` | Hairlines on light |

### Brass (brand)

| Token | Hex | Role |
| --- | --- | --- |
| `--brass` | `#CFAA66` | Accent text and lines on dark (8.8:1), primary button fill |
| `--brass-lt` | `#FBDB9B` | Highlight words in display type, current glow core |
| `--brass-deep` | `#7A5620` | Brass text on light surfaces only (5.8:1) |
| `--brass-grad` | `linear-gradient(135deg,#FBDB9B,#AB7D3B 80%)` | The logo, the one brass statement block per page. Never on text smaller than 48px. |

### Signals (used like LEDs, never decoratively)

| Token | Hex | Role |
| --- | --- | --- |
| `--live` | `#3FD68A` | A 6px dot meaning available or open now |
| `--fault` | `#E5483B` | Emergency service only: one dot plus the word. Never a fill. |

**Rules**
- One brass filled button per view. Everything else is outline or text.
- Text on the brass fill is always `--ink` (8.5:1). Never white on brass.
- Brass never appears as body text on light surfaces; use `--brass-deep`.
- No gradients anywhere except the logo and the single brass statement block.
- Never pure black, never pure white for large surfaces.

## 2. Typography

Three families, one job each. All free, self hosted with Fontsource, so nothing loads from a third party.

| Family | Use | Why |
| --- | --- | --- |
| **Archivo** (variable, width 112 to 125) | Display and headings | The expanded, squared cut echoes the chamfered SHIELD wordmark. Feels engineered, not decorative. |
| **IBM Plex Sans** | Body and UI | Built by an engineering company for technical reading. Calm, legible, credible. |
| **IBM Plex Mono** | Readouts: section numbers, specs, labels, phone numbers in tables, status | The "system readout" voice from Oxide. Makes specs feel measured. |

### Scale (1.25, 16px base)

| Step | Size | Weight | Line | Tracking | Use |
| --- | --- | --- | --- | --- | --- |
| Hero | `clamp(3.5rem, 9vw, 8.5rem)` | 600, width 125 | 0.92 | -0.035em | One per page |
| H1 | `clamp(2.75rem, 6vw, 5rem)` | 600, width 118 | 0.95 | -0.03em | Page titles |
| H2 | `clamp(2rem, 4vw, 3.25rem)` | 600, width 115 | 1.0 | -0.025em | Section titles |
| H3 | `1.5rem` | 600, width 112 | 1.15 | -0.01em | Cards, list items |
| Lead | `1.25rem` | Plex 400 | 1.5 | 0 | Intro paragraphs |
| Body | `1.0625rem` | Plex 400 | 1.6 | 0 | Reading text, max 64ch |
| Small | `0.875rem` | Plex 400 | 1.5 | 0 | Captions, help text |
| Readout | `0.75rem` | Plex Mono 500 | 1.3 | 0.08em, uppercase | Section numbers and spec labels ONLY |

**Rules**
- Display type is uppercase only in the hero. Section headings are sentence case.
- Uppercase tracked mono appears only as readouts (`01 / SERVICES`, `240V · 200A`). Never for buttons, nav or paragraphs.
- `text-wrap: balance` on headings, `pretty` on body. `tabular-nums` on every number that updates.
- One highlighted phrase per heading max, in `--brass-lt` on dark or `--brass-deep` on light.

## 3. Layout and surfaces

- **Grid:** 12 columns, max 1440px, gutters `clamp(16px, 4vw, 48px)`.
- **Section rhythm:** `clamp(96px, 12vw, 160px)` vertical. Sections alternate mode: dark hero, bone content, dark proof, and once per page the brass block.
- **Hairlines, not cards.** Group with 1px rules and space. A card exists only when it is clickable.
- **Radius:** `2px` buttons and inputs, `4px` photos, `999px` only for status pills and the chat launcher. Nothing in between.
- **Elevation:** none. No box shadows. Depth comes from surface steps (switch, panel, raised). The chat widget is the single exception: a 1px ring plus a soft ambient shadow, because it floats over content.
- **Photography:** full bleed on landing sections, `4px` radius inside content, never framed by a border. Warm, real job site photos, slightly desaturated, high contrast. Hands, tools, panels, finished lighting. No stock smiling electricians.
- **Panel schedule pattern:** specs and service details render as ruled tables with a mono left column, like a breaker panel directory.

## 4. Signature: the live circuit

This is the unique touch. It must feel like electricity, read as premium, and never as a gimmick.

1. **Hero field.** A canvas of thin orthogonal traces in brass at 10% opacity, routed like conduit. Pulses of warm light (core `--brass-lt`, 1px trail fading over 120px) travel the traces at random intervals. Near the cursor, traces within 140px brighten to 35%. About every 6 to 9 seconds, one short arc (a jagged 3 to 5 segment bolt, 90ms on, 40ms off, 60ms on) jumps between two nodes. Runs at 30fps max, pauses offscreen and in background tabs.
2. **Energized rules.** Section divider hairlines draw on as you scroll, and a single pulse runs their length once.
3. **Buttons.** The brass button has a 1px top highlight. On hover a spark runs along its bottom edge in 400ms.
4. **Meter counters.** Stats count up like a meter (tabular mono), with a tiny needle tick.
5. **Page change.** A single horizontal current line sweeps across, then the new page fades up 12px. Uses the View Transitions API.

**Reduced motion:** traces render static, no pulses, no arcs, no counting. Content never depends on any of it.

## 5. Motion values

| Thing | Duration | Easing |
| --- | --- | --- |
| Hover, color, underline | 150ms | ease-out |
| Reveal on scroll | 700ms, stagger 80ms, 16px rise | `cubic-bezier(.16,1,.3,1)` |
| Menus and widget open | 350ms enter, 180ms exit | same |
| Press | scale .97, 120ms | ease-out |
| Page transition | 450ms | same |

Interactive state uses transitions, never keyframes. Nothing scales from 0.

## 6. Components

- **Nav:** dark bar, logo left, 5 links, phone in mono, one brass "Schedule service" button. A live LED with "Open now" or "Closed, opens 7am" from real hours (Mon to Fri, 7am to 5pm).
- **Buttons:** primary brass fill, ink text. Secondary 1px outline in current text color. Text links underline on hover.
- **Service rows:** big hairline list, not a card grid. Number readout, name, one line, arrow. Row energizes on hover.
- **Forms:** labels above, 1px inputs, 2px radius, errors in words under the field, never color alone. Big tap targets.
- **Google reviews:** two rows drifting opposite ways at a constant pace, G mark on every card, stars, verified tick. Pause button only.
- **Trust band:** license, years, Google rating with the real G, BBB slot, insured.
- **Chat and text widget:** the Apex concierge pattern restyled in Shield's dark brass: face of the owner, one conversation, quote capture in the thread.
- **Footer:** big shield mark, socials row (Google, Instagram, Facebook, YouTube, TikTok, X, Houzz, Nextdoor), BBB seal slot, ROC number, hours.

## 7. Voice

Plain, confident, specific. Electricians who show up and explain things.
- Say what happens next: "We call you back within one business hour."
- Use numbers: "200 amp panel upgrade", "Level 2 charger, installed in a day".
- No hype words: no "cutting edge", no "solutions", no exclamation marks.
- No em dashes. Sentence case everywhere except the hero line.

## 8. Pages

Home, Services, six service pages (Commercial, Residential, Panel and AC upgrades, EV charging, Custom lighting, Emergency repairs), Projects, About, Service areas, Reviews, FAQ, Careers (with application), Contact (custom form with photo upload of the panel or problem), 404.

## 9. Do and don't

**Do**
- Let the live circuit be the only decoration.
- Keep one brass action per view.
- Use mono readouts for specs and numbers so they feel measured.
- Show real work, real people, real numbers.

**Don't**
- Lightning bolt icons, stock electricity photos, neon blue glows, or yellow caution tape. The circuit is the metaphor.
- Cards in cards, drop shadows, pill buttons, gradients on text.
- Template filler like "Welcome to our website" or "Why choose us".
