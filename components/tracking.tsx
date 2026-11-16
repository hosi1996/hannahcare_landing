'use client';
import Script from 'next/script';
import {useEffect,useState} from 'react';
import {content} from '@/lib/content';

const tracking=content.tracking;
const gtmId=/^GTM-[A-Z0-9]+$/i.test(tracking.gtmId)?tracking.gtmId:'';
const ga4Id=/^G-[A-Z0-9]+$/i.test(tracking.ga4Id)?tracking.ga4Id:'';
const adsId=/^AW-[0-9]+$/i.test(tracking.googleAdsId)?tracking.googleAdsId:'';
const directGoogleId=ga4Id||adsId;
const enabled=Boolean(gtmId||directGoogleId);
const consentKey='hc_analytics_consent';

declare global{interface Window{dataLayer?:Record<string,unknown>[];gtag?:(...args:unknown[])=>void}}

export function Tracking(){const [choice,setChoice]=useState<'accepted'|'declined'|null>(null);useEffect(()=>{if(enabled){const saved=localStorage.getItem(consentKey);if(saved==='accepted'||saved==='declined')setChoice(saved)}},[]);useEffect(()=>{if(choice&&gtmId){const granted=choice==='accepted'?'granted':'denied';window.gtag?.('consent','update',{analytics_storage:granted,ad_storage:granted,ad_user_data:granted,ad_personalization:granted});window.dataLayer?.push({event:'consent_update',analytics_consent:choice})}},[choice]);if(!enabled)return null;const choose=(value:'accepted'|'declined')=>{localStorage.setItem(consentKey,value);setChoice(value)};return <>{choice==='accepted'&&!gtmId&&directGoogleId&&<><Script src={`https://www.googletagmanager.com/gtag/js?id=${directGoogleId}`} strategy="afterInteractive"/><Script id="hannahcare-google-tag" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];window.gtag=function(){dataLayer.push(arguments)};gtag('js',new Date());${ga4Id?`gtag('config','${ga4Id}');`:''}${adsId?`gtag('config','${adsId}');`:''}`}</Script></>}{choice===null&&<aside className="consent-banner" aria-label={tracking.consent.title}><div><strong>{tracking.consent.title}</strong><p>{tracking.consent.text}</p></div><div className="consent-actions"><button className="btn" type="button" onClick={()=>choose('declined')}>{tracking.consent.decline}</button><button className="btn primary" type="button" onClick={()=>choose('accepted')}>{tracking.consent.accept}</button></div></aside>}</>}
