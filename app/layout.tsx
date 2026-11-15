import type {Metadata} from 'next';import './globals.css';import './refined.css';import './fixes.css';import {content} from '@/lib/content';import {Footer,Header,Sticky} from '@/components/site';
export const metadata:Metadata={metadataBase:new URL(content.site.domain),title:content.pages.home.seo.title,description:content.pages.home.seo.description};
export default function Layout({children}:{children:React.ReactNode}){return <html lang={content.site.locale}><body><Header/><main>{children}</main><Footer/><Sticky/></body></html>}
