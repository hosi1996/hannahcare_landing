import type {Metadata} from 'next';import {content} from '@/lib/content';import {Faq,Hero,Process,QuoteSection,ServiceNav,Testimonials,Trust} from '@/components/site';import {HomeBody} from '@/components/home';
const p:any=content.pages.home;export const metadata:Metadata={title:p.seo.title,description:p.seo.description,alternates:{canonical:'/'}};
export default function Home(){return <><Hero page={p}/><ServiceNav page={p}/><Trust/><HomeBody/><Testimonials section={p.reviewsSection}/><Process section={p.processSection}/><Faq faq={p.faq}/><QuoteSection/></>}
