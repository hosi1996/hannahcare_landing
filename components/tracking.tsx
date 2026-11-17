'use client';
import Script from 'next/script';
import {content} from '@/lib/content';

const tracking=content.tracking;
const gtmId=/^GTM-[A-Z0-9]+$/i.test(tracking.gtmId)?tracking.gtmId:'';
const ga4Id=/^G-[A-Z0-9]+$/i.test(tracking.ga4Id)?tracking.ga4Id:'';
const adsId=/^AW-[0-9]+$/i.test(tracking.googleAdsId)?tracking.googleAdsId:'';
const directGoogleId=ga4Id||adsId;
export function Tracking(){if(gtmId||!directGoogleId)return null;return <><Script src={`https://www.googletagmanager.com/gtag/js?id=${directGoogleId}`} strategy="afterInteractive"/><Script id="hannahcare-google-tag" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];window.gtag=function(){dataLayer.push(arguments)};gtag('consent','default',{analytics_storage:'granted',ad_storage:'granted',ad_user_data:'granted',ad_personalization:'granted'});gtag('js',new Date());${ga4Id?`gtag('config','${ga4Id}');`:''}${adsId?`gtag('config','${adsId}');`:''}`}</Script></>}
