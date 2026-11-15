import {NextRequest,NextResponse} from 'next/server';
export function middleware(req:NextRequest){if(req.nextUrl.pathname==='/leads/login')return NextResponse.next();const token=req.cookies.get('hc_session')?.value;if(!token){const url=new URL('/leads/login',req.url);return NextResponse.redirect(url)}return NextResponse.next()}
export const config={matcher:['/leads/:path*','/api/leads/admin/:path*']};
