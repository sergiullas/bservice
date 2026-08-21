import React, { useCallback, useEffect, useRef, useState } from 'react';
import Modal from '@material-ui/core/Modal';
import Tooltip from '@material-ui/core/Tooltip';
import { AlertTriangle, ArrowUpRight, ChevronDown, ChevronUp, ExternalLink, X } from 'lucide-react';
import { FedRampStatus, ProvisioningModel, Service } from '../data/services';
import { AwsLogo, AzureLogo, GoogleCloudLogo } from './ProviderLogo';
import { TRM_STYLES } from './ServiceCard';

// Prototype links carry real intended destinations in the data model, but
// stakeholders do not want the prototype UI to navigate anywhere real yet.
// Every outbound affordance (TRM, doc links) stays visible and styled like a
// link, but is inert.
function preventNav(event: React.MouseEvent) {
  event.preventDefault();
}

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

const PROVIDER_BG: Record<string, string> = { AWS: '#FFF3E0', Azure: '#E8F4FD', 'Google Cloud': '#F1F8E9' };
const FEDRAMP_STYLES: Record<FedRampStatus, string> = { 'Initial Implementation': 'bg-slate-100 text-slate-700', 'FedRAMP Ready': 'bg-amber-50 text-amber-800', 'Agency Authorization In Process': 'bg-blue-50 text-blue-800', 'FedRAMP In Process': 'bg-blue-50 text-blue-800', 'FedRAMP Certified': 'bg-emerald-50 text-emerald-800' };
const PROVISIONING_MODEL_STYLES: Record<ProvisioningModel, string> = { 'Tier 1': 'bg-emerald-50 text-emerald-800', 'Tier 2': 'bg-blue-50 text-blue-800', 'Tier 3': 'bg-amber-50 text-amber-800', 'Tier 4': 'bg-violet-50 text-violet-800' };

function ProviderIcon({ provider }: { provider: string }) { if (provider === 'AWS') return <AwsLogo size={28} />; if (provider === 'Azure') return <AzureLogo size={24} />; return <GoogleCloudLogo size={24} />; }
function StatusValue({ value, className }: { value: string; className: string }) { return <span className={`inline-flex w-fit rounded-full px-2.5 py-1 text-[12px] font-bold ${className}`}>{value}</span>; }
function DetailField({ label, children }: { label: string; children: React.ReactNode }) { return <div className="min-w-0"><dt className="metadata-label">{label}</dt><dd className="mt-1.5 text-[14px] font-normal leading-5 text-slate-800">{children}</dd></div>; }

// MUI v4's default tooltip text is 10px, which stakeholders flagged as too
// small to read comfortably. Sized explicitly here rather than in a global
// override so only this tooltip changes.
const TOOLTIP_TEXT_STYLE: React.CSSProperties = { display: 'inline-block', fontSize: 14, lineHeight: '20px' };

function DisabledServiceNowCta({ reason }: { reason: string }) {
  return (
    <Tooltip arrow title={<span style={TOOLTIP_TEXT_STYLE}>{reason}</span>}>
      {/* A native disabled button can't receive focus or hover, so the
          Tooltip needs a focusable, hoverable wrapper. That wrapper carries
          the full accessible name/state; the inner text is hidden from AT
          so it isn't announced twice. */}
      <span role="button" aria-disabled="true" tabIndex={0} aria-label={`Request via ServiceNow. ${reason}`} className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-slate-300 px-4 py-3 text-[14px] font-semibold text-slate-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1565C0]">
        <span aria-hidden="true" className="flex items-center gap-2">Request via ServiceNow <ArrowUpRight className="size-4" /></span>
      </span>
    </Tooltip>
  );
}

interface Props { service: Service | null; onClose: () => void; triggerRef: React.RefObject<HTMLElement | null>; fallbackFocusRef: React.RefObject<HTMLElement | null>; }
export function ServiceDetailDrawer({ service, onClose, triggerRef, fallbackFocusRef }: Props) {
  const [approvalOpen, setApprovalOpen] = useState(false);
  const [expandedDescriptionId, setExpandedDescriptionId] = useState<string | null>(null);
  const [overflowingDescriptionId, setOverflowingDescriptionId] = useState<string | null>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const descriptionExpanded = service !== null && expandedDescriptionId === service.id;

  // MUI v4's Modal focus-containment (Unstable_TrapFocus, literally named
  // "unstable") has a known quirk: tabbing past the last focusable element
  // doesn't cycle straight back to the first one -- it briefly lands on the
  // modal's own unlabeled wrapper node before the *next* Tab press redirects
  // it. That's a confusing stop for keyboard/AT users, so containment is
  // disabled on Modal (disableEnforceFocus) and implemented directly here
  // instead: Tab from the last focusable element wraps to the first, and
  // Shift+Tab from the first wraps to the last.
  const handleDialogKeyDown = (event: React.KeyboardEvent) => {
    if (event.key !== 'Tab' || !dialogRef.current) return;
    const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };
  useEffect(() => { setApprovalOpen(false); }, [service?.id]);

  // The Close button only exists in the DOM while the dialog is open (it's
  // inside the `if (!service) return null` branch below), so a ref callback
  // fires exactly when it mounts (dialog opened -> focus it) and when it
  // unmounts (dialog closed -> return focus to the trigger, or a fallback if
  // that card no longer exists, e.g. filtered out while the panel was open).
  // A plain useEffect keyed on service?.id is not reliable here: MUI's Modal
  // portal can take an extra render pass to actually mount its children, so
  // the ref can still be null on the effect's first (and only) run.
  const closeButtonRef = useCallback((node: HTMLButtonElement | null) => {
    if (node) {
      node.focus();
      return;
    }
    const trigger = triggerRef.current;
    if (trigger && document.body.contains(trigger)) trigger.focus();
    else fallbackFocusRef.current?.focus();
  }, [triggerRef, fallbackFocusRef]);

  useEffect(() => {
    const paragraph = descriptionRef.current;
    if (!service || !paragraph || descriptionExpanded) return;

    const measureOverflow = () => {
      setOverflowingDescriptionId(paragraph.scrollHeight > paragraph.clientHeight ? service.id : null);
    };

    measureOverflow();
    const resizeObserver = new ResizeObserver(measureOverflow);
    resizeObserver.observe(paragraph);
    return () => resizeObserver.disconnect();
  }, [service?.id, descriptionExpanded]);
  if (!service) return null;
  const trm = TRM_STYLES[service.trmStatus];
  const descriptionId = `service-description-${service.id}`;
  const headingId = `service-detail-heading-${service.id}`;
  const approvalContentId = `approval-workflow-content-${service.id}`;
  const descriptionOverflows = overflowingDescriptionId === service.id;
  const showDescriptionToggle = descriptionExpanded || descriptionOverflows;
  const hasOnboardingRequirements = !!service.serviceOnboardingRequirements?.length;
  const isNonRequestable = service.trmStatus === 'Prohibited' || service.trmStatus === 'Divest';
  return <Modal open hideBackdrop disableAutoFocus disableRestoreFocus disableEnforceFocus onClose={onClose}>
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/30" onMouseDown={(event) => { event.preventDefault(); onClose(); }}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={headingId} onMouseDown={(event) => event.stopPropagation()} onKeyDown={handleDialogKeyDown} className="flex h-full w-full max-w-[600px] flex-col bg-[#FAFBFC] shadow-[-16px_0_40px_rgba(15,23,42,0.20)]">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white px-5 py-5 sm:px-6">
          <div className="flex items-start gap-3">
            <div aria-hidden="true" className="flex size-12 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: PROVIDER_BG[service.cloudProvider] ?? '#F1F5F9' }}><ProviderIcon provider={service.cloudProvider} /></div>
            <div className="min-w-0 flex-1"><h2 id={headingId} className="text-[18px] font-bold leading-6 text-[#1A1A2E]">{service.serviceName}</h2><p className="mt-1 text-[13px] font-normal text-slate-600">{service.cloudProvider} · {service.serviceCategory}</p><a href="#" onClick={preventNav} className={`mt-3 inline-flex w-fit items-center gap-2 rounded-full border px-2.5 py-1 text-[12px] font-bold hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1565C0] ${trm.className}`} title="View authoritative TRM information"><span aria-hidden="true" className={`size-1.5 rounded-full ${trm.dot}`} />TRM · {trm.label}</a></div>
            <button ref={closeButtonRef} type="button" onClick={onClose} className="rounded-md p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1565C0]" aria-label="Close service details"><X aria-hidden="true" className="size-5" /></button>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto scroll-pt-28 scroll-pb-24">
          <section className="border-b border-slate-200 px-5 py-6 sm:px-6"><h3 className="text-[16px] font-bold text-[#1A1A2E]">Overview</h3><p ref={descriptionRef} id={descriptionId} className={`mt-3 text-[14px] leading-6 text-slate-700 ${descriptionExpanded ? '' : 'line-clamp-4'}`}>{service.serviceDescription}</p>{showDescriptionToggle && <button type="button" aria-expanded={descriptionExpanded} aria-controls={descriptionId} onClick={() => setExpandedDescriptionId(descriptionExpanded ? null : service.id)} className="mt-2 text-[14px] font-semibold text-[#1565C0] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1565C0]">{descriptionExpanded ? 'View less' : 'View more'}</button>}<h4 className="metadata-label mt-5">Common use cases</h4><ul className="mt-2 list-disc space-y-1.5 pl-5 text-[14px] leading-5 text-slate-700">{service.serviceUseCases.map((item) => <li key={item}>{item}</li>)}</ul>{service.serviceLimitations && <div className="mt-5 flex gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-[14px] leading-5 text-amber-950"><AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-amber-700" /><div><strong className="font-bold">Limitations</strong><p>{service.serviceLimitations}</p></div></div>}</section>
          <section className="border-b border-slate-200 px-5 py-6 sm:px-6"><h3 className="text-[16px] font-bold text-[#1A1A2E]">Governance &amp; Compliance</h3><dl className="mt-5 grid gap-x-5 gap-y-5 sm:grid-cols-2"><DetailField label="FedRAMP Status"><StatusValue value={service.fedRampStatus} className={FEDRAMP_STYLES[service.fedRampStatus]} /></DetailField>{service.cloudAto.length > 0 && <DetailField label="Cloud ATO"><div className="flex flex-wrap gap-1.5">{service.cloudAto.map((ato) => <span key={ato} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[12px] font-bold text-slate-700">{ato}</span>)}</div></DetailField>}{service.trmStatus === 'Restricted' && <DetailField label="TRM Restriction Owner"><a href="#" onClick={preventNav} className="text-[#1565C0] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1565C0]">{service.trmRestrictionOwner ?? 'TBD'}</a></DetailField>}</dl></section>
          <section className="border-b border-slate-200 px-5 py-6 sm:px-6">
            <h3 className="text-[16px] font-bold text-[#1A1A2E]">Request &amp; Provisioning</h3>
            <dl className="mt-5 grid gap-x-5 gap-y-5 sm:grid-cols-2">
              <DetailField label="Service Owner"><a href="#" onClick={preventNav} className="text-[#1565C0] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1565C0]">{service.serviceOwner}</a></DetailField>
              <DetailField label="Provisioning Model"><StatusValue value={service.provisioningModel} className={PROVISIONING_MODEL_STYLES[service.provisioningModel]} /></DetailField>
              <DetailField label="Funding Approach">{service.fundingApproach}</DetailField>
              <DetailField label="Provisioning SLA">{service.provisioningSLA}</DetailField>
              <div className="min-w-0 sm:col-span-2">
                <dt className="metadata-label">Approval Workflow</dt>
                <dd className="mt-1.5">
                  <button type="button" onClick={() => setApprovalOpen((open) => !open)} aria-expanded={approvalOpen} aria-controls={approvalContentId} className="flex items-center gap-1.5 text-[14px] font-normal text-[#1565C0] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1565C0]">{service.approvalWorkflow}{approvalOpen ? <ChevronUp aria-hidden="true" className="size-4" /> : <ChevronDown aria-hidden="true" className="size-4" />}</button>
                  {approvalOpen && <div id={approvalContentId} className="mt-2 rounded-lg border border-blue-100 bg-blue-50/60 p-4"><p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-blue-800">{service.approvalWorkflow}</p><div className="mt-3 flex flex-wrap items-center gap-2 text-center text-[12px] font-bold text-slate-700"><span className="rounded bg-white px-2 py-2 shadow-sm">Request</span><ArrowUpRight aria-hidden="true" className="size-3 text-blue-600" /><span className="rounded bg-white px-2 py-2 shadow-sm">Review</span><ArrowUpRight aria-hidden="true" className="size-3 text-blue-600" /><span className="rounded bg-white px-2 py-2 shadow-sm">Decision</span></div><p className="mt-3 text-[12px] leading-5 text-slate-600">The approval chain and required checkpoints for this service request.</p></div>}
                </dd>
              </div>
            </dl>
            {hasOnboardingRequirements && <div className="mt-5 min-w-0"><h4 className="metadata-label">Onboarding Requirements</h4><ul className="mt-2 list-disc space-y-1.5 pl-5 text-[14px] font-normal leading-5 text-slate-800">{service.serviceOnboardingRequirements!.map((item) => <li key={item}>{item}</li>)}</ul></div>}
          </section>
          <section className="px-5 py-6 sm:px-6"><h3 className="text-[16px] font-bold text-[#1A1A2E]">Documentation</h3><div className="mt-3 divide-y divide-slate-100"><a href="#" onClick={preventNav} className="flex items-center justify-between py-3 text-[14px] font-normal text-[#1565C0] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1565C0]">Internal Documentation<ExternalLink aria-hidden="true" className="size-4" /></a><a href="#" onClick={preventNav} className="flex items-center justify-between py-3 text-[14px] font-normal text-[#1565C0] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1565C0]">External Documentation<ExternalLink aria-hidden="true" className="size-4" /></a></div></section>
        </div>
        <footer className="sticky bottom-0 border-t border-slate-200 bg-white p-4 sm:px-6">
          {isNonRequestable ? (
            <DisabledServiceNowCta reason={`This service cannot be requested because its TRM status is ${service.trmStatus}.`} />
          ) : (
            <button type="button" className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1565C0] px-4 py-3 text-[14px] font-semibold text-white transition hover:bg-[#0D47A1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1565C0]">Request via ServiceNow <ArrowUpRight aria-hidden="true" className="size-4" /></button>
          )}
        </footer>
      </div>
    </div>
  </Modal>;
}
