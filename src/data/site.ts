/* All site content in one place. Items marked TODO need Jason's real info before launch. */

export const company = {
  name: 'Shield Electrical',
  legal: 'Shield Electrical LLC',
  tagline: 'Powering what matters. Protecting what counts.',
  phone: '(480) 555 0100', /* TODO real number */
  tel: '+14805550100', /* TODO */
  email: 'service@shieldelectrical.com', /* TODO confirm */
  address: '2225 W Pecos Rd, Suite 2',
  city: 'Chandler, AZ 85224',
  roc: 'ROC #000000', /* TODO license number */
  hours: 'Mon to Fri, 7am to 5pm',
  open: { days: [1, 2, 3, 4, 5], from: 7, to: 17 }, /* Arizona time, no daylight saving */
  since: 2014, /* TODO confirm year */
  site: 'https://shieldelectrical.com',
};

export const nav = [
  { label: 'Services', href: '/services/' },
  { label: 'Gallery', href: '/gallery/' },
  { label: 'About', href: '/about/' },
  { label: 'Service areas', href: '/service-areas/' },
  { label: 'Blog', href: '/blog/' },
  { label: 'FAQ', href: '/faq/' },
  { label: 'Careers', href: '/careers/' },
];

/* Real job photos only. Drop a URL or a /media path into src when Jason sends them; CI turns them into WebP.
   An empty src renders a labeled placeholder. No generated imagery. */
export const media: Record<string, { src: string; alt: string; need?: string }> = {
  commercial: { src: '', need: 'Commercial electrical room', alt: 'A commercial electrical room with switchgear cabinets and conduit' },
  residential: { src: '', need: 'Finished home lighting', alt: 'A modern Arizona living room lit by warm recessed lighting' },
  panel: { src: '', need: 'Panel upgrade, after', alt: 'A new 200 amp service panel on a stucco wall' },
  ev: { src: '', need: 'EV charger install', alt: 'A Level 2 EV charger mounted in a garage' },
  lighting: { src: '', need: 'Landscape lighting at dusk', alt: 'A desert modern home with landscape lighting at dusk' },
  emergency: { src: '', need: 'Night service call', alt: 'An electrician with a headlamp inspecting a panel at night' },
  crew: { src: '', need: 'Crew on a job', alt: 'Electricians pulling wire through a commercial ceiling' },
  before1: { src: '', need: 'Old panel, before', alt: 'An old 100 amp panel before the upgrade' },
  after1: { src: '', need: 'New panel, after', alt: 'A new 200 amp panel after the upgrade' },
  project1: { src: '', need: 'Office tenant improvement', alt: 'Office tenant improvement lighting and power' },
  project2: { src: '', need: '200 amp service upgrade', alt: 'A 200 amp service upgrade' },
  project3: { src: '', need: 'Whole home lighting', alt: 'Whole home recessed lighting' },
  project4: { src: '', need: 'Garage EV charger', alt: 'A Level 2 EV charger in a garage' },
  project5: { src: '', need: 'Warehouse power', alt: 'Warehouse equipment circuits and LED lighting' },
  project6: { src: '', need: 'Desert landscape lighting', alt: 'Low voltage landscape lighting at dusk' },
  field1: { src: '', need: 'Crew on a job site', alt: 'The Shield crew working on a job site' },
  field2: { src: '', need: 'Jason at a panel', alt: 'Jason working inside an electrical panel' },
  field3: { src: '', need: 'Trucks and gear', alt: 'Shield Electrical service trucks loaded with gear' },
  field4: { src: '', need: 'EV charger install', alt: 'An electrician mounting an EV charger in a garage' },
  field5: { src: '', need: 'Commercial wire pull', alt: 'Electricians pulling wire in a commercial ceiling' },
  jason: { src: '', need: 'Portrait of Jason', alt: 'Jason, owner of Shield Electrical' },
};

export type Service = {
  slug: string; n: string; title: string; short: string; lead: string; img: string;
  includes: string[]; specs: [string, string][]; faq: { q: string; a: string }[]; emergency?: boolean;
};

export const services: Service[] = [
  {
    slug: 'commercial', n: '01', title: 'Commercial electrical', img: 'commercial',
    short: 'Tenant improvements, service upgrades and maintenance for offices, retail and industrial space.',
    lead: 'From a single suite build out to a new service for a warehouse, we plan the work around your business hours and keep you open.',
    includes: ['Tenant improvement wiring', 'Service and switchgear upgrades', 'Lighting retrofits and controls', 'Dedicated equipment circuits', 'Code corrections and inspections', 'Scheduled maintenance'],
    specs: [['Typical projects', 'Offices, retail, restaurants, warehouses'], ['Scheduling', 'After hours and weekend work available'], ['Permits', 'Pulled and inspected by us'], ['Coordination', 'GCs, property managers and the utility']],
    faq: [{ q: 'Can you work while we stay open?', a: 'Yes. We phase the work and schedule shutdowns for nights or weekends so your doors stay open.' }, { q: 'Do you work with general contractors?', a: 'Yes. We bid plans, attend walk throughs and keep the GC updated through inspection.' }],
  },
  {
    slug: 'residential', n: '02', title: 'Residential electrical', img: 'residential',
    short: 'Outlets, circuits, ceiling fans, remodels and whole home rewiring, done clean.',
    lead: 'Everything a home needs, from a new circuit for the garage to rewiring a remodel. We protect your floors, explain the work and leave it cleaner than we found it.',
    includes: ['New circuits and outlets', 'Ceiling fans and fixtures', 'Remodel and addition wiring', 'Whole home rewiring', 'Smoke and CO detectors', 'Troubleshooting and repairs'],
    specs: [['Response', 'Most visits scheduled within the week'], ['Pricing', 'Written price before work starts'], ['Clean up', 'Floor protection and full clean up'], ['Warranty', 'Workmanship guaranteed']],
    faq: [{ q: 'Do you charge to come out?', a: 'We will tell you the trip and diagnostic cost up front when you book, before anyone arrives.' }, { q: 'Can you match my existing fixtures and finishes?', a: 'Yes. Send photos with your request and we will bring the right devices and plates.' }],
  },
  {
    slug: 'panel-upgrades', n: '03', title: 'Panel and AC upgrades', img: 'panel',
    short: '100 to 200 amp upgrades, AC circuits and service changes, with permits and the utility handled.',
    lead: 'Older panels struggle with AC, EV chargers and new appliances. We size the service you need, pull the permit and coordinate APS or SRP so your power is back the same day.',
    includes: ['100A to 200A service upgrades', 'Main panel replacements', 'Dedicated AC and heat pump circuits', 'Subpanels for garages and casitas', 'Surge protection', 'Utility and city coordination'],
    specs: [['Typical service', '100A to 200A main breaker panel'], ['Time on site', 'One day, power off 4 to 6 hours'], ['Permits', 'Pulled and inspected by us'], ['Utility', 'APS and SRP coordination included']],
    faq: [{ q: 'How do I know if I need a panel upgrade?', a: 'Breakers that trip often, a 100 amp panel with central AC, or plans for an EV charger or spa are common signs. Send a photo of your panel and we will tell you.' }, { q: 'How long is the power off?', a: 'Usually four to six hours on one day. We schedule the utility so there is no second visit.' }],
  },
  {
    slug: 'ev-charging', n: '04', title: 'EV charging', img: 'ev',
    short: 'Level 2 chargers for every brand, with a load check before we install.',
    lead: 'Charge overnight at home. We check your panel capacity first, then install a Level 2 charger or a NEMA 14 50 outlet where you actually park.',
    includes: ['Level 2 charger installation', 'NEMA 14 50 outlets', 'Load calculations', 'Panel upgrades when needed', 'Commercial and multi unit chargers', 'Rebate paperwork guidance'],
    specs: [['Charger types', 'Tesla, ChargePoint, Emporia and more'], ['Typical install', 'Half a day'], ['Circuit', '40A to 60A dedicated, 240V'], ['Rebates', 'We point you to current APS and SRP offers']],
    faq: [{ q: 'Will my panel handle a charger?', a: 'Often yes. We do a load calculation first, and if it will not, we quote a panel upgrade or a load management device.' }, { q: 'Should I get a charger or an outlet?', a: 'A hardwired charger is faster and cleaner. An outlet is cheaper and portable. We will explain the trade offs for your car.' }],
  },
  {
    slug: 'custom-lighting', n: '05', title: 'Custom lighting', img: 'lighting',
    short: 'Recessed, architectural and landscape lighting designed around how you use the space.',
    lead: 'Good lighting changes a room. We plan layouts, dimming and controls, then install recessed, under cabinet, accent and landscape lighting that looks intentional.',
    includes: ['Recessed and wafer lighting', 'Under cabinet and cove lighting', 'Landscape and facade lighting', 'Dimmers and smart controls', 'Pendants and chandeliers', 'Commercial lighting retrofits'],
    specs: [['Design', 'Layout plan before install'], ['Color', 'Warm 2700K to 3000K recommended'], ['Controls', 'Dimmers, scenes and smart switches'], ['Outdoor', 'Low voltage landscape systems']],
    faq: [{ q: 'Can you add recessed lights without big drywall repairs?', a: 'Usually. Wafer lights and careful routing keep openings small, and we patch what we touch.' }, { q: 'Do you install smart switches?', a: 'Yes, including Lutron and other common systems, set up and tested before we leave.' }],
  },
  {
    slug: 'emergency-repairs', n: '06', title: 'Emergency repairs', img: 'emergency', emergency: true,
    short: 'Sparking outlets, burning smells, tripped mains and power loss. Call first.',
    lead: 'If you smell burning, see sparks or lose power to part of the house, call us. We find the cause, make it safe and fix it properly.',
    includes: ['Power loss and partial outages', 'Burning smells and hot outlets', 'Tripping breakers', 'Storm and water damage', 'Failed panels and meters', 'Make safe and temporary power'],
    specs: [['First step', 'Call, do not book online'], ['Hours', 'Mon to Fri, 7am to 5pm'], ['After hours', 'TODO confirm emergency availability'], ['Danger', 'If anything is smoking, call 911 first']],
    faq: [{ q: 'What should I do right now?', a: 'If there is smoke or fire, leave and call 911. If it is safe, switch off the breaker for that area and call us.' }, { q: 'Do you answer after hours?', a: 'TODO: confirm with Jason whether Shield takes after hours emergency calls.' }],
  },
];

export const steps = [
  { t: 'Tell us what is going on', d: 'Call, text or send the form. A photo of the panel or problem helps.' },
  { t: 'Get a written price', d: 'We look at the job, then send a clear price before any work starts.' },
  { t: 'We do the work', d: 'Licensed electricians, permits pulled, your space protected.' },
  { t: 'Inspected and done', d: 'We walk you through it, pass inspection and clean up.' },
];

export const areas = ['Scottsdale', 'Paradise Valley', 'Phoenix', 'Tempe', 'Chandler', 'Gilbert', 'Mesa', 'Queen Creek', 'San Tan Valley', 'Ahwatukee', 'Sun Lakes', 'Apache Junction', 'Goodyear', 'Peoria', 'Glendale', 'Avondale'];

export const values = [
  { t: 'Safety first', d: 'Every job is built to code and inspected. We do not cut corners you cannot see.' },
  { t: 'Straight answers', d: 'A written price before work starts, and a call back when we say we will.' },
  { t: 'Clean work', d: 'Neat panels, labeled circuits and a job site left cleaner than we found it.' },
];

export const faqGroups = [
  { g: 'Pricing and booking', items: [
    { q: 'How much does an electrician cost?', a: 'It depends on the job. We give you a written price before any work starts, and tell you any trip or diagnostic cost when you book.' },
    { q: 'Do you offer free estimates?', a: 'Larger projects like panel upgrades, remodels and lighting get a free written estimate. Repairs start with a diagnostic visit.' },
    { q: 'How fast can you come out?', a: 'Most service calls are scheduled within the week. Call for anything urgent.' },
  ]},
  { g: 'Licensing and safety', items: [
    { q: 'Are you licensed and insured?', a: 'Yes. Shield Electrical is a licensed, bonded and insured Arizona electrical contractor.' },
    { q: 'Do you pull permits?', a: 'Yes, whenever the work requires one, and we are there for the inspection.' },
  ]},
  { g: 'Panels and EV', items: [
    { q: 'Do I need a bigger panel for an EV charger?', a: 'Not always. We run a load calculation first and only recommend an upgrade if your service cannot carry it.' },
    { q: 'Can you work with APS and SRP?', a: 'Yes. We coordinate disconnects and meter work with the utility as part of the job.' },
  ]},
];

export const roles = [
  { t: 'Journeyman electrician', type: 'Full time', d: 'Lead residential and light commercial jobs, mentor apprentices and keep job sites clean.', req: ['Arizona journeyman experience', 'Valid driver license', 'Own hand tools'] },
  { t: 'Apprentice electrician', type: 'Full time', d: 'Learn the trade on real jobs alongside experienced electricians.', req: ['Willing to learn', 'Reliable transportation', 'Enrolled or ready to enroll in an apprenticeship'] },
  { t: 'Service technician', type: 'Full time', d: 'Run service calls, troubleshoot and explain repairs to homeowners.', req: ['Troubleshooting experience', 'Clear communication', 'Valid driver license'] },
];
/* TODO: Jason to confirm roles, pay ranges and benefits */

export const perks = ['Steady year round work', 'Company vehicle for qualified roles', 'Paid training and licensing support', 'Health benefits (TODO confirm)', 'A team that answers the phone'];

export const projects = [
  { slug: 'office-ti', title: 'Office tenant improvement', city: 'Chandler', scope: 'Commercial', img: 'project1', spec: '6,000 sq ft, lighting and power' },
  { slug: 'panel-200a', title: '200 amp service upgrade', city: 'Gilbert', scope: 'Panel upgrade', img: 'project2', spec: '100A to 200A, same day' },
  { slug: 'home-lighting', title: 'Whole home lighting', city: 'Scottsdale', scope: 'Lighting', img: 'project3', spec: '48 recessed fixtures, dimming scenes' },
  { slug: 'garage-ev', title: 'Garage EV charger', city: 'Mesa', scope: 'EV charging', img: 'project4', spec: '60A Level 2, load checked' },
  { slug: 'warehouse', title: 'Warehouse power', city: 'Tempe', scope: 'Commercial', img: 'project5', spec: 'Equipment circuits and LED retrofit' },
  { slug: 'landscape', title: 'Desert landscape lighting', city: 'Queen Creek', scope: 'Lighting', img: 'project6', spec: 'Low voltage uplighting' },
];
/* TODO: replace with real Shield projects and photos. These are layout examples. */

export const socials = [
  { key: 'google', label: 'Google Business Profile', href: '' },
  { key: 'instagram', label: 'Instagram', href: '' },
  { key: 'facebook', label: 'Facebook', href: '' },
  { key: 'youtube', label: 'YouTube', href: '' },
  { key: 'tiktok', label: 'TikTok', href: '' },
  { key: 'x', label: 'X', href: '' },
  { key: 'houzz', label: 'Houzz', href: '' },
];
