import { z } from 'zod';
import raw from '@/content/site.json';

const ImageSchema=z.object({src:z.string(),alt:z.string(),ratio:z.string(),brief:z.string()});
const HeroSchema=z.object({eyebrow:z.string(),headline:z.string(),subheadline:z.string(),bullets:z.array(z.string()),image:ImageSchema});
const SeoSchema=z.object({title:z.string(),description:z.string()});
const ServiceSchema=z.object({id:z.string(),title:z.string(),text:z.string(),bullets:z.array(z.string()),featured:z.boolean().optional(),prefillService:z.string().optional(),image:ImageSchema});
const PageSchema=z.object({slug:z.string(),seo:SeoSchema,hero:HeroSchema,serviceDefault:z.string().optional(),intro:z.object({title:z.string(),text:z.string()}).optional(),services:z.array(ServiceSchema).optional(),processSection:z.any().optional(),faq:z.object({title:z.string(),items:z.array(z.object({q:z.string(),a:z.string()}))}),finalCta:z.any().optional()}).passthrough();
const Schema=z.object({site:z.any(),theme:z.any(),tracking:z.any(),cta:z.any(),trust:z.any(),form:z.any(),pages:z.object({home:PageSchema,ac:PageSchema,electrical:PageSchema,plumbing:PageSchema})});
const result=Schema.safeParse(raw);
if(!result.success) throw new Error(`Invalid content/site.json:\n${z.prettifyError(result.error)}`);
export const content=result.data as typeof raw;
export type SiteContent=typeof content;
export const placeholders=(value:unknown,path='content'):string[]=> typeof value==='string'&&/\[[^\]]+]/.test(value)?[`${path}: ${value}`]:value&&typeof value==='object'?Object.entries(value).flatMap(([k,v])=>placeholders(v,`${path}.${k}`)):[];
const unresolved=placeholders(content);
if(unresolved.length) console.warn(`Unresolved placeholders (${unresolved.length}):\n${unresolved.join('\n')}`);
export const isPlaceholder=(v:string)=>/\[[^\]]+]/.test(v);
