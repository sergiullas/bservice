import React from 'react';
import { Service, TrmStatus } from '../data/services';
import { AwsLogo, AzureLogo, GoogleCloudLogo } from './ProviderLogo';

const PROVIDER_BG: Record<string, string> = { AWS: '#FFF3E0', Azure: '#E8F4FD', 'Google Cloud': '#F1F8E9' };
export const TRM_STYLES: Record<TrmStatus, { label: string; className: string; badgeClass: string; dot: string }> = {
  Permitted: { label: 'Permitted', className: 'text-emerald-800', badgeClass: 'border-emerald-200 bg-emerald-50 text-emerald-800', dot: 'bg-emerald-600' },
  Restricted: { label: 'Restricted', className: 'text-amber-800', badgeClass: 'border-amber-200 bg-amber-50 text-amber-800', dot: 'bg-amber-500' },
  Divest: { label: 'Divest', className: 'text-violet-800', badgeClass: 'border-violet-200 bg-violet-50 text-violet-800', dot: 'bg-violet-600' },
  Prohibited: { label: 'Prohibited', className: 'text-red-800', badgeClass: 'border-red-300 bg-red-50 text-red-800', dot: 'bg-red-700' },
};
function ProviderIcon({ provider }: { provider: string }) { if (provider === 'AWS') return <AwsLogo size={26} />; if (provider === 'Azure') return <AzureLogo size={22} />; return <GoogleCloudLogo size={22} />; }
function preventNav(event: React.MouseEvent) { event.preventDefault(); }
interface ServiceCardProps { service: Service; onSelect: (service: Service, trigger: HTMLElement) => void; headingLevel?: 2 | 3; }
export function ServiceCard({ service, onSelect, headingLevel = 3 }: ServiceCardProps) {
  const status = TRM_STYLES[service.trmStatus];
  const headingId = `card-heading-${service.id}`;
  const viewDetailsId = `card-view-details-${service.id}`;
  const HeadingTag = headingLevel === 2 ? 'h2' : 'h3';
  return <article className="group relative flex min-h-[230px] w-full cursor-pointer flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-shadow duration-200 hover:shadow-[0_4px_16px_rgba(15,23,42,0.10)]">
    <button type="button" onClick={(event) => onSelect(service, event.currentTarget)} aria-labelledby={`${headingId} ${viewDetailsId}`} className="absolute inset-0 z-0 cursor-pointer rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1565C0]" />
    <div className="flex items-start gap-3"><div aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-[10px]" style={{ backgroundColor: PROVIDER_BG[service.cloudProvider] ?? '#F1F5F9' }}><ProviderIcon provider={service.cloudProvider} /></div><div className="min-h-[64px] min-w-0 flex-1"><HeadingTag id={headingId} className="line-clamp-2 text-[16px] font-semibold leading-[1.3] text-[#1A1A2E]">{service.serviceName}</HeadingTag><p className="mt-1 text-[13px] font-normal text-slate-600">{service.cloudProvider}</p></div></div>
    <a href="#" onClick={preventNav} className={`relative z-10 mt-2.5 inline-flex w-fit items-center gap-1.5 rounded-sm py-0.5 text-[13px] font-medium hover:underline ${status.className} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1565C0]`}><span aria-hidden="true" className={`size-2 shrink-0 rounded-full ${status.dot}`} />TRM Status: {status.label}</a>
    <p className="mt-3 line-clamp-2 text-[14px] leading-[1.5] text-[#555]">{service.serviceDescription}</p>
    <span className="pointer-events-none mt-auto pt-3 text-[14px] font-medium text-[#1565C0] opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"><span id={viewDetailsId}>View details</span><span aria-hidden="true"> →</span></span>
  </article>;
}
