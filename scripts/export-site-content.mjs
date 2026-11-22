import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';

const root=resolve(import.meta.dirname,'..');
const content=JSON.parse(readFileSync(resolve(root,'content/site.json'),'utf8'));
const lines=[];
const line=(value='')=>lines.push(String(value));
const field=(label,value)=>line(`${label}: ${value??''}`);
const heading=title=>{line();line('='.repeat(78));line(title);line('='.repeat(78))};
const sub=title=>{line();line(`--- ${title} ---`)};
const bullets=items=>items?.forEach(item=>line(`- ${item}`));
const image=image=>{if(image){field('Image file',image.src);field('Image alt text',image.alt)}};

function seo(page){sub('SEO');field('Browser / search title',page.seo.title);field('Meta description',page.seo.description);field('Canonical URL',`${content.site.domain}${page.slug==='/'?'':page.slug}`)}
function hero(page){sub('Hero (top of page)');field('Eyebrow',page.hero.eyebrow);field('Main heading (H1)',page.hero.headline);field('Intro text',page.hero.subheadline);field('Bullet points','');bullets(page.hero.bullets);image(page.hero.image);field('Primary CTA',content.cta.call);field('WhatsApp CTA',content.cta.whatsapp);field('Quote CTA',content.cta.quote)}
function process(section){sub('Process section');field('Eyebrow',section.eyebrow||'What to expect');field('Heading',section.title);section.steps.forEach((step,i)=>{field(`Step ${i+1} title`,step.title);field(`Step ${i+1} text`,step.text)})}
function faq(section){sub('FAQ');field('Heading',section.title);section.items.forEach((item,i)=>{field(`Question ${i+1}`,item.q);field(`Answer ${i+1}`,item.a)})}
function finalCta(section){sub('Final CTA');field('Heading',section.title);field('Text',section.text);field('Button',content.cta.quote)}
function servicePage(name,page){heading(`${name.toUpperCase()} PAGE`);field('Page URL',`${content.site.domain}${page.slug}`);seo(page);hero(page);sub('Introduction');field('Heading',page.intro.title);field('Text',page.intro.text);sub('Services');page.services.forEach((service,i)=>{line();field(`Service ${i+1} anchor URL`,`${content.site.domain}${page.slug}#${service.id}`);field('Service title',service.title);field('Service text',service.text);field('Service bullet points','');bullets(service.bullets);image(service.image);field('Button',content.cta.quote)});process(page.processSection);faq(page.faq);finalCta(page.finalCta)}

line('HANNAH CARE — COMPLETE WEBSITE COPY');
line('Plain-text content reference for the content team');
field('Website',content.site.domain);
field('Generated from','content/site.json');
line('Anything inside [SQUARE BRACKETS] still needs real business information.');

heading('GLOBAL SITE CONTENT — SHOWN ACROSS THE WEBSITE');
sub('Brand');field('Brand name',content.site.brand);field('Descriptor',content.site.descriptor);field('Tagline',content.site.tagline);field('Service area',content.site.serviceArea);field('Trade licence',content.site.tradeLicence);field('Logo alt text',content.site.logo.alt);
sub('Header navigation');field('Link 1','Home — https://hannahcare.ae/');field('Link 2','AC — https://hannahcare.ae/ac-repair-maintenance');field('Link 3','Plumbing — https://hannahcare.ae/plumbing-services');field('Link 4','Electrical — https://hannahcare.ae/electrical-services');
sub('Contact information');field('Phone shown on site',content.site.contact.phoneDisplay);field('Phone link value',content.site.contact.phoneTel);field('WhatsApp number',content.site.contact.whatsappNumber);field('WhatsApp opening message',content.site.contact.whatsappPrefill);field('Email',content.site.contact.email);field('Address',content.site.contact.address);field('Opening hours',content.site.contact.hours);
sub('Temporarily disabled services — content kept for reactivation');field('Disabled service IDs',content.availability.disabledServiceIds.join(' | '));field('Hidden form options',content.availability.disabledFormOptions.join(' | '));field('Internal note',content.availability.note);
sub('CTA labels');field('Call button',content.cta.call);field('WhatsApp button',content.cta.whatsapp);field('Quote button',content.cta.quote);field('Form submit button',content.cta.submit);
sub('Common interface labels');field('Service navigation heading','Find your service');field('Service navigation text','Choose the service you need and go straight to the details.');field('Service card link','Explore service');field('Featured service badge','Specialist service');field('Final CTA eyebrow','Need a hand?');field('Mobile sticky button 1',content.cta.call);field('Mobile sticky button 2',content.cta.whatsapp);field('Mobile sticky button 3',content.cta.quote);
sub('Trust strip');content.trust.strip.forEach((item,i)=>field(`Trust item ${i+1}`,item.text));
sub('Footer');field('Footer company text',content.site.footerNote);field('Copyright',content.site.copyright);
sub('Client logos section');field('Eyebrow','Trusted relationships');field('Heading','Our clients');

heading('QUOTE FORM — SHOWN AT THE BOTTOM OF PUBLIC PAGES');
field('Section eyebrow','Ready when you are');field('Section heading','Tell us what needs attention.');field('Section intro','Share a few details and our team will get back to you quickly. For urgent jobs, call or message us directly.');field('Form eyebrow','Free, no-obligation quote');field('Form heading',content.form.title);field('Form intro',content.form.subtitle);Object.values(content.form.fields).forEach((item,i)=>{field(`Field ${i+1} label`,item.label);if(item.options)field(`Field ${i+1} options`,item.options.join(' | '))});field('Consent note',content.form.consent);field('Success heading',content.form.successTitle);field('Success text',content.form.successBody);field('General error text',content.form.errorBody);
sub('Form validation messages');field('Validation summary','Please correct the highlighted fields before sending your request.');field('Name error','Please enter your full name (at least 2 characters).');field('Missing phone error','Please enter your phone or WhatsApp number.');field('Invalid phone error','Enter a valid phone number. Include the country code if outside the UAE.');field('Property type error','Please choose residential or commercial.');field('Service error','Please choose the service you need.');field('Area length error','Area or building must be 120 characters or fewer.');field('Message length error','Message must be 2,000 characters or fewer.');

const home=content.pages.home;
heading('HOME PAGE');field('Page URL',content.site.domain+'/');seo(home);hero(home);
sub('Services overview');field('Eyebrow',home.servicesSection.eyebrow);field('Heading',home.servicesSection.title);field('Intro',home.servicesSection.intro);home.servicesSection.cards.forEach((card,i)=>{line();field(`Card ${i+1} title`,card.title);field('Card text',card.text);field('Card link',`${content.site.domain}${card.link}`);image(card.image);field('Link label','Explore service')});
sub('Spotlight');field('Eyebrow',home.spotlight.eyebrow);field('Heading',home.spotlight.title);field('Text',home.spotlight.text);field('Bullet points','');bullets(home.spotlight.bullets);image(home.spotlight.image);field('Button',home.spotlight.cta.label);
sub('Why Hannah Care');field('Eyebrow',home.whySection.eyebrow);field('Heading',home.whySection.title);field('Supporting text','Calm, capable property care — from the first call to the final check.');home.whySection.items.forEach((item,i)=>{field(`Reason ${i+1} title`,item.title);field(`Reason ${i+1} text`,item.text)});
sub('Annual Maintenance Contracts');field('Eyebrow',home.amcSection.eyebrow);field('Heading',home.amcSection.title);field('Text',home.amcSection.text);home.amcSection.options.forEach((item,i)=>{field(`Option ${i+1} button`,item.label);field(`Option ${i+1} text`,item.text)});
sub('Testimonials');field('Display status',home.reviewsSection.enabled?'Visible':'Hidden until verified customer reviews are supplied');field('Eyebrow',home.reviewsSection.eyebrow);field('Heading',home.reviewsSection.title);home.reviewsSection.items.forEach((item,i)=>{field(`Review ${i+1} name`,item.name);field(`Review ${i+1} location`,item.location);field(`Review ${i+1} service`,item.service);field(`Review ${i+1} text`,item.text);field(`Review ${i+1} rating`,`${item.rating}/5`);field(`Review ${i+1} source`,item.source)});process(home.processSection);faq(home.faq);finalCta(home.finalCta);

servicePage('AC Repair & Maintenance',content.pages.ac);
servicePage('Electrical Services',content.pages.electrical);
servicePage('Plumbing Services',content.pages.plumbing);

heading('SYSTEM MESSAGES');field('404 eyebrow','404');field('404 heading','We could not find that page.');field('404 button','Return home');

writeFileSync(resolve(root,'SITE-CONTENT.txt'),`${lines.join('\n')}\n`,'utf8');
console.log('Created SITE-CONTENT.txt');
