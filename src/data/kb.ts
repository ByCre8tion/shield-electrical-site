/* What the website assistant knows. Add onboarding answers, Instagram captions and video transcripts to `notes`. */
import { company, services, steps, faqGroups, areas, values } from './site';

export const notes: string[] = [
  'Owner: Jason. Shield Electrical is a licensed commercial and residential electrical contractor in Chandler, Arizona.',
  'Hours: Monday to Friday, 7am to 5pm Arizona time.',
  /* [Add onboarding answers: years in business, license number, warranty, after hours policy, brands, financing, etc.] */
];

export const pages = [
  { label: 'Home', href: '/', about: 'overview, services, reviews, service areas' },
  { label: 'Services', href: '/services/', about: 'all six services' },
  ...services.map((s) => ({ label: s.title, href: `/services/${s.slug}/`, about: s.short })),
  { label: 'Projects', href: '/projects/', about: 'recent work' },
  { label: 'About', href: '/about/', about: 'Jason, the team and values' },
  { label: 'Service areas', href: '/service-areas/', about: 'cities served' },
  { label: 'Reviews', href: '/reviews/', about: 'Google reviews' },
  { label: 'FAQ', href: '/faq/', about: 'pricing, permits, panels, EV' },
  { label: 'Careers', href: '/careers/', about: 'open roles and how to apply' },
  { label: 'Contact', href: '/contact/', about: 'schedule service, phone, address' },
];

const faqs = faqGroups.flatMap((g) => g.items);

export const brief = [
  `COMPANY: ${company.name}, ${company.address}, ${company.city}. Phone ${company.phone}. Email ${company.email}. Hours ${company.hours}.`,
  ...notes,
  'SERVICES:',
  ...services.map((s) => `- ${s.title}: ${s.lead} Includes: ${s.includes.join('; ')}. ${s.faq.map((f) => `Q: ${f.q} A: ${f.a}`).join(' ')}`),
  'PROCESS:', ...steps.map((s, i) => `${i + 1}. ${s.t}: ${s.d}`),
  `SERVICE AREAS: ${areas.join(', ')}.`,
  `VALUES: ${values.map((v) => `${v.t}: ${v.d}`).join(' ')}`,
  'FAQ:', ...faqs.map((f) => `Q: ${f.q} A: ${f.a}`),
  'PAGES:', ...pages.map((p) => `- ${p.label} (${p.href}): ${p.about}`),
].join('\n');

export const local = [
  { q: 'Emergency', a: `If anything is smoking, sparking or smells like burning, leave and call 911 first. Then call us at ${company.phone}. More on [Emergency repairs](/services/emergency-repairs/).`, k: 'emergency smoke smoking spark sparking burning smell fire hot outlet power out outage urgent' },
  { q: 'Panel', a: 'We upgrade 100 amp panels to 200 amp, handle permits and coordinate APS or SRP, usually in one day. See [Panel and AC upgrades](/services/panel-upgrades/).', k: 'panel upgrade breaker tripping trip amp 100 200 service main ac' },
  { q: 'EV', a: 'We install Level 2 chargers and NEMA 14 50 outlets after a load check on your panel. See [EV charging](/services/ev-charging/).', k: 'ev charger charging tesla car electric vehicle 14 50 level 2' },
  { q: 'Lighting', a: 'We design and install recessed, under cabinet, landscape and smart lighting. See [Custom lighting](/services/custom-lighting/).', k: 'lighting lights recessed can landscape dimmer smart switch fixture chandelier pendant' },
  { q: 'Commercial', a: 'We do tenant improvements, service upgrades and maintenance, scheduled around your hours. See [Commercial electrical](/services/commercial/).', k: 'commercial office business retail warehouse tenant improvement ti restaurant' },
  ...faqs.map((f) => ({ q: f.q, a: f.a, k: f.q })),
  { q: 'Quote', a: `The fastest way to a price is the form on the [Contact](/contact/) page, or call ${company.phone}. You get a written price before any work starts.`, k: 'quote estimate price cost book schedule appointment' },
  { q: 'Areas', a: `We serve ${areas.slice(0, 8).join(', ')} and more. See [Service areas](/service-areas/).`, k: 'area areas serve city cities where location near' },
  { q: 'Careers', a: 'Open roles are on the [Careers](/careers/) page, where you can apply.', k: 'job jobs hiring career careers apprentice journeyman work apply' },
  { q: 'Hours', a: `We are open ${company.hours}. Call ${company.phone}.`, k: 'hours open close time today weekend' },
];
