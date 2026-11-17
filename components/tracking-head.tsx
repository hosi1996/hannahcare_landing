import Script from 'next/script';
import {content} from '@/lib/content';

const gtmId=/^GTM-[A-Z0-9]+$/i.test(content.tracking.gtmId)?content.tracking.gtmId:'';

export function TrackingHead(){if(!gtmId)return null;return <><Script id="hannahcare-consent-default" strategy="beforeInteractive">{`window.dataLayer=window.dataLayer||[];window.gtag=function(){window.dataLayer.push(arguments)};window.gtag('consent','default',{analytics_storage:'granted',ad_storage:'granted',ad_user_data:'granted',ad_personalization:'granted'});window.dataLayer.push({'gtm.start':new Date().getTime(),event:'gtm.js'});`}</Script><Script id="hannahcare-gtm" src={`https://www.googletagmanager.com/gtm.js?id=${gtmId}`} strategy="beforeInteractive" async/></>}
