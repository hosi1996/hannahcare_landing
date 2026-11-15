import {createHmac,timingSafeEqual} from 'crypto';
export const cookieName='hc_session';
export function sign(value:string){return `${value}.${createHmac('sha256',process.env.SESSION_SECRET||'development-only-secret').update(value).digest('hex')}`}
export function verify(value?:string){if(!value)return false;const [payload,sig]=value.split('.');if(!payload||!sig)return false;const expected=sign(payload).split('.')[1];return sig.length===expected.length&&timingSafeEqual(Buffer.from(sig),Buffer.from(expected))&&Number(payload)>Date.now()}
