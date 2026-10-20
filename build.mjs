import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const out = join(process.cwd(), 'dist');
const siteUrl = (process.env.SITE_URL || '').replace(/\/$/, '');
const phone = '0402 161 802';
const phoneHref = 'tel:+61402161802';
const email = 'info@eazelectrical.com.au';
const instagram = 'https://www.instagram.com/eaz_electrical/';
const navItems = [
  ['Home', '/'], ['Services', '/services/'], ['Projects', '/projects/'],
  ['About', '/about/'], ['Contact', '/contact/']
];

function icon(name) {
  const paths = {
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    north: '<path d="M5 19 19 5M7 5h12v12"/>',
    phone: '<path d="M21 16.4v3a2 2 0 0 1-2.2 2A18.8 18.8 0 0 1 2.6 5.2 2 2 0 0 1 4.6 3h3a2 2 0 0 1 2 1.7l.5 2.7a2 2 0 0 1-.6 1.8l-1.8 1.8a15 15 0 0 0 5.3 5.3l1.8-1.8a2 2 0 0 1 1.8-.6l2.7.5a2 2 0 0 1 1.7 2Z"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>'
  };
  return `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;
}

function imageSlot(label, className = '') {
  return `<div class="image-slot ${className}" role="img" aria-label="Placeholder for ${label}">
    <div class="image-slot__grid" aria-hidden="true"></div>
    <span class="image-slot__mark" aria-hidden="true">E<span>A</span>Z</span>
    <span class="image-slot__label">${label} <span>— photo coming soon</span></span>
  </div>`;
}

function button(label, href, style = 'dark', extra = '') {
  return `<a class="button button--${style}" href="${href}" ${extra}>${label}<span class="button__icon">${icon('north')}</span></a>`;
}

function sectionHeading(kicker, title, copy = '') {
  return `<div class="section-heading"><div><p class="eyebrow">${kicker}</p><h2>${title}</h2></div>${copy ? `<p>${copy}</p>` : ''}</div>`;
}

function serviceCard(number, title, text, href = '/services/') {
  return `<a class="service-card" href="${href}"><span class="service-card__number">${number}</span><div><h3>${title}</h3><p>${text}</p></div><span class="service-card__arrow">${icon('north')}</span></a>`;
}

function projectCard(number, title, category, copy, imageLabel) {
  return `<article class="project-card"><a href="/projects/#project-${number}" aria-label="See ${title}">${imageSlot(imageLabel, 'project-card__image')}</a><div class="project-card__meta"><span>${number} / ${category}</span><span>Melbourne</span></div><h3><a href="/projects/#project-${number}">${title}</a></h3><p>${copy}</p></article>`;
}

function cta() {
  return `<section class="cta-band"><div class="container cta-band__inner"><div><p class="eyebrow">Ready when you are</p><h2>Let’s get your project moving.</h2><p>Tell Eli what you need. Quotes are free, and you’ll speak directly with the electrician doing the work.</p></div><div class="cta-band__actions">${button(`Call ${phone}`, phoneHref, 'yellow')}${button('Send an enquiry', '/contact/', 'outline-light')}</div></div></section>`;
}

function layout({ path, title, description, body, image = '' }) {
  const active = path === '/privacy/' ? '' : path;
  const canonical = siteUrl ? `<link rel="canonical" href="${siteUrl}${path}">` : '';
  const ogUrl = siteUrl ? `<meta property="og:url" content="${siteUrl}${path}">` : '';
  return `<!doctype html>
<html lang="en-AU"><head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="theme-color" content="#171916"><meta name="description" content="${description}">
  <meta property="og:type" content="website"><meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">${ogUrl}${canonical}
  <title>${title}</title><link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/assets/style.css"><script src="/assets/app.js" defer></script>
</head><body>
  <a class="skip-link" href="#main">Skip to content</a>
  <div class="top-line"><div class="container"><span>Melbourne electrician · Glen Eira &amp; Bayside focus</span><a href="${phoneHref}">Calls answered 24/7 · ${phone}</a></div></div>
  <header class="site-header" id="site-header"><div class="container site-header__inner">
    <a class="brand" href="/" aria-label="EAZ Electrical home"><span class="brand__main">E<span>A</span>Z</span><span class="brand__sub">ELECTRICAL</span></a>
    <button class="menu-toggle" type="button" aria-controls="site-nav" aria-expanded="false" aria-label="Open menu"><span></span><span></span></button>
    <nav class="site-nav" id="site-nav" aria-label="Main navigation">${navItems.map(([label, href]) => `<a href="${href}" ${active === href ? 'aria-current="page"' : ''}>${label}</a>`).join('')}</nav>
    <a class="header-call" href="${phoneHref}">${icon('phone')}<span>Call Eli</span></a>
  </div></header>
  <main id="main">${body}</main>
  <footer class="site-footer"><div class="container">
    <div class="site-footer__main"><div><a class="brand brand--footer" href="/" aria-label="EAZ Electrical home"><span class="brand__main">E<span>A</span>Z</span><span class="brand__sub">ELECTRICAL</span></a><p>Quality electrical work. Direct, personal service.<br>Across Melbourne, with a focus on Glen Eira and Bayside.</p></div>
    <div><h3>Explore</h3><a href="/services/">Services</a><a href="/projects/">Projects</a><a href="/about/">About Eli</a><a href="/contact/">Contact</a></div>
    <div><h3>Get in touch</h3><a href="${phoneHref}">${phone}</a><a href="mailto:${email}">${email}</a><a href="${instagram}" target="_blank" rel="noopener noreferrer">Instagram ${icon('north')}</a></div></div>
    <div class="site-footer__bottom"><span>© ${new Date().getFullYear()} EAZ Electrical · ABN 49 871 904 760 · REC 36780 · Eli Sztrochlic, electrical licence A75783</span><a href="/privacy/">Privacy</a></div>
  </div></footer>
</body></html>`;
}

const home = `<section class="hero"><div class="container hero__grid"><div class="hero__copy"><p class="eyebrow"><span class="eyebrow__line"></span> EAZ Electrical · Melbourne</p><h1>Electrical work<br><em>done with care.</em></h1><p class="hero__intro">From switchboard upgrades and renovations to EV chargers and everyday maintenance, deal directly with Eli for reliable electrical work and a free quote.</p><div class="hero__actions">${button('Get a free quote', '/contact/', 'yellow')}${button('Explore our work', '/projects/', 'text')}</div><div class="hero__proof"><div><strong>24/7</strong><span>Calls answered</span></div><div><strong>Melbourne</strong><span>Wide service area</span></div><div><strong>Direct</strong><span>Talk to your electrician</span></div></div></div><div class="hero__visual" aria-label="Graphic placeholder for EAZ Electrical project photography"><div class="hero__visual-grid"></div><div class="hero__visual-orbit"></div><span class="hero__visual-small">Built on craft.<br>Powered by care.</span><div class="hero__visual-center"><span>Future project<br>photography</span><span class="hero__visual-logo">E<span>A</span>Z</span></div><span class="hero__visual-index">01 / 03</span></div></div></section>
<div class="trust-strip"><div class="container"><span>Fully licensed &amp; insured</span><span>Free quotes</span><span>Residential &amp; commercial</span><span>Family-run business</span></div></div>
<section class="section" id="services"><div class="container">${sectionHeading('What I do', 'The work that keeps<br>your place moving.', 'Practical solutions for homes, businesses and property managers, delivered with care from first conversation to final check.')}<div class="service-list">${serviceCard('01', 'Switchboard upgrades', 'Safer, more capable switchboards for changing electrical needs.')}${serviceCard('02', 'Renovations & new builds', 'Electrical work planned around the way you want to use your space.')}${serviceCard('03', 'EV charger installation', 'Convenient charging at home or work, installed by a licensed electrician.')}${serviceCard('04', 'LED & garden lighting', 'Efficient, considered lighting indoors and out.')}</div><div class="section-end">${button('View all services', '/services/', 'text-dark')}</div></div></section>
<section class="section section--soft"><div class="container"><div class="intro-split"><div>${imageSlot('Eli portrait', 'portrait-slot')}</div><div class="intro-split__copy"><p class="eyebrow">Meet your electrician</p><h2>Good work starts<br>with a good conversation.</h2><p>I’m Eli Sztrochlic. I started EAZ Electrical in 2025 after completing my four-year apprenticeship. I’m hands-on with every job and believe in being punctual, approachable and clear from the start.</p><ul class="check-list"><li>${icon('check')} You speak directly with me</li><li>${icon('check')} Free quotes for every job</li><li>${icon('check')} Calls answered day and night</li></ul>${button('More about EAZ', '/about/', 'dark')}</div></div></div></section>
<section class="section"><div class="container">${sectionHeading('Selected work', 'See the detail<br>for yourself.', 'Before-and-after photography will be added here as it becomes available. These are the kinds of projects EAZ Electrical takes on.')}<div class="project-grid">${projectCard('01', 'A home, ready for what’s next', 'Renovations', 'Electrical work through the journey from an empty shell to a finished home.', 'home renovation before and after images')}${projectCard('02', 'A brighter, cleaner finish', 'LED upgrades', 'Replacing worn and fragile fittings with modern downlights throughout a property.', 'LED lighting before and after images')}${projectCard('03', 'Keeping things working', 'Maintenance', 'Practical attention to everyday electrical repairs, checks and improvements.', 'electrical maintenance project images')}</div><div class="section-end">${button('See project stories', '/projects/', 'text-dark')}</div></div></section>
<section class="statement"><div class="container"><p class="eyebrow">The EAZ approach</p><h2>On time. Work done properly. Always easy to talk to.</h2><p>A simple standard for every job.</p></div></section>${cta()}`;

const services = `<section class="page-hero"><div class="container"><p class="eyebrow">Services</p><h1>Good electrical work<br><em>makes everything easier.</em></h1><p>From single upgrades to full renovations, EAZ Electrical helps homeowners, property managers and businesses across Melbourne.</p></div></section>
<section class="section"><div class="container"><div class="service-detail" id="switchboards"><div class="service-detail__num">01</div><div><p class="eyebrow">Power &amp; safety</p><h2>Switchboard upgrades</h2><p>Whether your property needs more capacity or an older board needs attention, Eli can assess the setup, explain the options and carry out the upgrade with care.</p><ul><li>Residential and commercial switchboards</li><li>Clear advice before work begins</li><li>Neat, professional installation</li></ul></div><div class="service-detail__visual">${imageSlot('Switchboard project photos')}</div></div>
<div class="service-detail" id="renovations"><div class="service-detail__num">02</div><div><p class="eyebrow">Spaces in progress</p><h2>Renovations &amp; new builds</h2><p>Electrical work for changing homes and workplaces, planned around the layout, lighting and power you need. Eli can work alongside your builder or other trades.</p><ul><li>Home and commercial renovations</li><li>New-build electrical work</li><li>Power, lighting and finishing details</li></ul></div><div class="service-detail__visual">${imageSlot('Renovation project photos')}</div></div>
<div class="service-detail" id="ev-chargers"><div class="service-detail__num">03</div><div><p class="eyebrow">Ready for the road</p><h2>EV charger installation</h2><p>Make charging more convenient at your property. Eli can talk through the location, electrical supply and installation options for your charger.</p><ul><li>Home and business enquiries</li><li>Site-specific installation advice</li><li>Clear quote before work starts</li></ul></div><div class="service-detail__visual">${imageSlot('EV charger project photos')}</div></div>
<div class="service-detail" id="lighting"><div class="service-detail__num">04</div><div><p class="eyebrow">Light the way</p><h2>LED &amp; garden lighting</h2><p>Refresh tired fittings, improve how a room feels, or give an outdoor area a useful glow. EAZ Electrical handles lighting upgrades with attention to the finish.</p><ul><li>LED downlight upgrades</li><li>Indoor and outdoor lighting</li><li>Garden lighting</li></ul></div><div class="service-detail__visual">${imageSlot('Lighting before and after photos')}</div></div></div></section>
<section class="section section--soft"><div class="container">${sectionHeading('More ways I can help', 'The small jobs matter too.', 'If your electrical work isn’t listed here, get in touch and tell Eli what you need.')}<div class="other-services"><span>Electrical maintenance</span><span>Data cabling</span><span>Electrical compliance checks</span><span>Test &amp; tag</span><span>Smoke alarm testing &amp; checks</span><span>Sauna installations</span><span>General domestic electrical</span><span>Commercial electrical</span></div></div></section>${cta()}`;

const projects = `<section class="page-hero"><div class="container"><p class="eyebrow">Projects</p><h1>Work worth<br><em>looking closely at.</em></h1><p>Project photos and detailed before-and-after stories are being prepared. Here’s a look at the work EAZ Electrical is ready to show.</p></div></section>
<section class="section"><div class="container"><article class="project-feature" id="project-01"><div class="project-feature__images">${imageSlot('Home renovation — before')}${imageSlot('Home renovation — after')}</div><div class="project-feature__text"><span class="project-feature__number">01 / Renovations</span><h2>From empty shell to finished home.</h2><p>Electrical work is part of every stage of a renovation. This space is reserved for a completed home project, with images and a fuller story to follow.</p></div></article>
<article class="project-feature" id="project-02"><div class="project-feature__images">${imageSlot('LED upgrade — before')}${imageSlot('LED upgrade — after')}</div><div class="project-feature__text"><span class="project-feature__number">02 / Lighting</span><h2>New light throughout the property.</h2><p>Replacing old, worn fittings with downlights can change the feel and function of a space. Before-and-after photos will show the result here.</p></div></article>
<article class="project-feature" id="project-03"><div class="project-feature__images">${imageSlot('Maintenance — before')}${imageSlot('Maintenance — after')}</div><div class="project-feature__text"><span class="project-feature__number">03 / Maintenance</span><h2>Care for the everyday details.</h2><p>From repairs to checks and practical improvements, EAZ Electrical approaches smaller jobs with the same attention to detail.</p></div></article></div></section>${cta()}`;

const about = `<section class="page-hero"><div class="container"><p class="eyebrow">About EAZ</p><h1>One electrician.<br><em>A personal approach.</em></h1><p>Meet Eli Sztrochlic, the person you’ll speak with and the electrician who will carry out your work.</p></div></section>
<section class="section"><div class="container about-grid"><div>${imageSlot('Eli Sztrochlic portrait', 'about-portrait')}</div><div class="about-copy"><p class="eyebrow">My story</p><h2>Built on experience, growing through trust.</h2><p>I began my electrical apprenticeship in 2021. After four years of hands-on learning, I started EAZ Electrical in early 2025 to build a business around quality workmanship, reliability and good relationships with clients.</p><p>I started mainly with domestic work and have also taken on commercial projects. Today I work with homeowners, businesses, real estate companies and property managers across Melbourne.</p><p>Because I do the electrical work myself, you can speak to me directly. I aim to be punctual, present myself professionally, stay on top of the details and always make time for a conversation.</p>${button('Talk to Eli', '/contact/', 'dark')}</div></div></section>
<section class="section section--soft"><div class="container">${sectionHeading('What to expect', 'Straightforward from<br>start to finish.')}<div class="values-grid"><div><span>01</span><h3>A real conversation</h3><p>Tell me what you need and ask questions directly. There’s no middleman between you and the electrician.</p></div><div><span>02</span><h3>A free quote</h3><p>You’ll know the proposed work and price before the job begins.</p></div><div><span>03</span><h3>Care in the details</h3><p>I take pride in neat work, a professional approach and a result you can feel good about.</p></div></div></div></section>${cta()}`;

const contact = `<section class="page-hero page-hero--contact"><div class="container"><p class="eyebrow">Contact</p><h1>Tell me what<br><em>you have in mind.</em></h1><p>Call, text, email or send an enquiry. I answer calls 24 hours a day, seven days a week.</p></div></section>
<section class="section"><div class="container contact-grid"><div class="contact-details"><p class="eyebrow">Talk directly with Eli</p><h2>Let’s work out<br>the next step.</h2><p>Based around Glen Eira and Bayside, EAZ Electrical works throughout Melbourne. Every job starts with a free quote.</p><div class="contact-method"><span>Call or text</span><a href="${phoneHref}">${phone} ${icon('north')}</a></div><div class="contact-method"><span>Email</span><a href="mailto:${email}">${email} ${icon('north')}</a></div><div class="contact-method"><span>Instagram</span><a href="${instagram}" target="_blank" rel="noopener noreferrer">@eaz_electrical ${icon('north')}</a></div><p class="contact-note">Calls are answered 24/7. Attendance is arranged based on the job and availability.</p></div>
<form class="contact-form" id="enquiry-form" action="/api/enquiry" method="post" enctype="multipart/form-data" novalidate><div class="contact-form__heading"><p class="eyebrow">Enquiry form</p><h2>Request a free quote.</h2><p>Share a few details and I’ll get back to you.</p></div><div class="form-grid"><div class="field"><label for="name">Your name <span>*</span></label><input id="name" name="name" autocomplete="name" required maxlength="100"></div><div class="field"><label for="phone">Phone number <span>*</span></label><input id="phone" name="phone" type="tel" autocomplete="tel" required maxlength="40"></div><div class="field"><label for="suburb">Suburb <span>*</span></label><input id="suburb" name="suburb" autocomplete="address-level2" required maxlength="100"></div><div class="field"><label for="preferredTime">Preferred contact time</label><input id="preferredTime" name="preferredTime" placeholder="e.g. Weekday afternoons" maxlength="100"></div></div><div class="field"><label for="description">Tell me about the job <span>*</span></label><textarea id="description" name="description" rows="6" required minlength="10" maxlength="5000" placeholder="What needs doing, and when would you like it done?"></textarea></div><div class="field"><label for="photos">Photos <span class="optional">(optional)</span></label><input id="photos" name="photos" type="file" multiple accept="image/jpeg,image/png,image/webp"><small>Up to 4 JPG, PNG or WebP images, 5 MB each.</small></div><div class="field field--honeypot" aria-hidden="true"><label for="companyWebsite">Leave this blank</label><input id="companyWebsite" name="companyWebsite" tabindex="-1" autocomplete="off"></div><p class="form-privacy">Your details and photos are used to respond to your enquiry. <a href="/privacy/">Read our privacy information.</a></p><button class="button button--yellow" type="submit"><span>Send enquiry</span><span class="button__icon">${icon('north')}</span></button><p class="form-status" id="form-status" role="status" aria-live="polite"></p></form></div></section>`;

const privacy = `<section class="page-hero page-hero--small"><div class="container"><p class="eyebrow">Privacy</p><h1>Your information,<br><em>handled with care.</em></h1></div></section><section class="section"><div class="container prose"><p>When you send an enquiry to EAZ Electrical, we collect the details you provide, such as your name, phone number, suburb, job description, preferred contact time and any photos you attach.</p><p>We use this information to respond to your enquiry, prepare a quote and communicate about the work. Enquiry records and photos are stored using Firebase services. They are not displayed publicly on this website.</p><p>We keep enquiry information for as long as reasonably needed for our business records and the purpose for which it was provided. If you want to access, correct or request deletion of your information, email <a href="mailto:${email}">${email}</a>.</p><p>Our website may use basic hosting logs for security and operation. It does not use advertising trackers. For any privacy question, contact Eli at <a href="mailto:${email}">${email}</a>.</p></div></section>`;

const pages = [
  { path: '/', title: 'EAZ Electrical | Melbourne Electrician', description: 'EAZ Electrical provides switchboard upgrades, renovations, EV chargers, lighting and electrical maintenance across Melbourne. Call Eli directly for a free quote.', body: home },
  { path: '/services/', title: 'Electrical Services | EAZ Electrical Melbourne', description: 'Explore residential and commercial electrical services from EAZ Electrical, including switchboard upgrades, renovations, EV chargers and LED lighting.', body: services },
  { path: '/projects/', title: 'Projects | EAZ Electrical Melbourne', description: 'See the electrical work EAZ Electrical does across Melbourne, from whole-home renovations to LED upgrades and maintenance.', body: projects },
  { path: '/about/', title: 'About Eli | EAZ Electrical Melbourne', description: 'Meet Eli Sztrochlic, the licensed electrician behind EAZ Electrical, a family-run Melbourne electrical business built on direct service and careful workmanship.', body: about },
  { path: '/contact/', title: 'Contact EAZ Electrical | Free Quotes Melbourne', description: 'Call, text, email or send a job enquiry to EAZ Electrical. Eli answers calls 24/7 and offers free quotes for electrical work across Melbourne.', body: contact },
  { path: '/privacy/', title: 'Privacy | EAZ Electrical', description: 'How EAZ Electrical handles information you send through the website enquiry form.', body: privacy }
];

await mkdir(join(out, 'assets'), { recursive: true });
for (const page of pages) {
  const dir = join(out, page.path);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, 'index.html'), layout(page));
}
await writeFile(join(out, 'assets', 'style.css'), await readFile('src/style.css'));
await writeFile(join(out, 'assets', 'app.js'), await readFile('src/app.js'));
await writeFile(join(out, 'assets', 'favicon.svg'), await readFile('src/favicon.svg'));
await writeFile(join(out, 'robots.txt'), 'User-agent: *\nAllow: /\n');
if (siteUrl) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.filter(p => p.path !== '/privacy/').map(p => `<url><loc>${siteUrl}${p.path}</loc></url>`).join('')}</urlset>`;
  await writeFile(join(out, 'sitemap.xml'), xml);
}
console.log(`Built ${pages.length} pages into dist/`);
