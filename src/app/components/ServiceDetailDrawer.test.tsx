import React, { useRef } from 'react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ServiceDetailDrawer } from './ServiceDetailDrawer';
import { Service } from '../data/types';

// jsdom does not implement ResizeObserver; ServiceDetailDrawer's Story
// 1.2-era description-overflow measurement uses it whenever a service is
// actually rendered (as opposed to the `service: null` case the rest of the
// suite exercised previously). Stubbed here rather than globally since no
// other suite in this repo mounts the drawer with a non-null service.
class StubResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeAll(() => {
  vi.stubGlobal('ResizeObserver', StubResizeObserver);
});

afterEach(cleanup);

const BASE_SERVICE: Service = {
  id: 'fixture-service',
  serviceName: 'Fixture Service',
  cloudProvider: 'AWS',
  serviceCategory: 'Compute',
  serviceDescription: 'A fixture service used only to exercise ServiceDetailDrawer in isolation.',
  serviceExternalDoc: 'https://example.com/external',
  serviceInternalDoc: 'https://example.com/internal',
  provisioningModel: 'Tier 1',
  cloudAto: ['CACE'],
  serviceOwner: 'Fixture Owner',
  fedRampStatus: 'FedRAMP Certified',
  trmStatus: 'Permitted',
  trmLink: 'https://example.com/trm',
  fundingApproach: 'ECSD pay',
  approvalWorkflow: 'Auto-Approved',
  provisioningSLA: 'Same day',
  serviceUseCases: ['Fixture use case'],
};

/** Renders a real card-like trigger button plus the drawer, mirroring how
 * ServiceOfferingsPage wires triggerRef/fallbackFocusRef in production. */
function Harness({ service }: { service: Service | null }) {
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const fallbackRef = useRef<HTMLHeadingElement | null>(null);
  const [current, setCurrent] = React.useState<Service | null>(service);
  return (
    <div>
      <h1 ref={fallbackRef} tabIndex={-1}>Page heading</h1>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setCurrent(BASE_SERVICE)}
      >
        Open trigger
      </button>
      <ServiceDetailDrawer
        service={current}
        onClose={() => setCurrent(null)}
        triggerRef={triggerRef}
        fallbackFocusRef={fallbackRef}
      />
    </div>
  );
}

describe('ServiceDetailDrawer dialog primitive (post-MUI-v4 removal)', () => {
  it('renders correct dialog semantics and moves focus to the close button on open', () => {
    render(<Harness service={BASE_SERVICE} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.getAttribute('aria-labelledby')).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Close service details' }));
  });

  it('contains focus with Tab/Shift+Tab wrapping inside the dialog', () => {
    render(<Harness service={BASE_SERVICE} />);
    const dialog = screen.getByRole('dialog');
    const focusable = dialog.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])');
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    last.focus();
    fireEvent.keyDown(dialog, { key: 'Tab' });
    expect(document.activeElement).toBe(first);

    first.focus();
    fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(last);
  });

  it('closes on Escape', () => {
    const onClose = vi.fn();
    render(
      <ServiceDetailDrawer
        service={BASE_SERVICE}
        onClose={onClose}
        triggerRef={{ current: null }}
        fallbackFocusRef={{ current: null }}
      />,
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes on backdrop mousedown', () => {
    const onClose = vi.fn();
    const { container } = render(
      <ServiceDetailDrawer
        service={BASE_SERVICE}
        onClose={onClose}
        triggerRef={{ current: null }}
        fallbackFocusRef={{ current: null }}
      />,
    );
    const backdrop = container.ownerDocument.querySelector('.bg-slate-950\\/30') as HTMLElement;
    fireEvent.mouseDown(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('hides the rest of the document from assistive tech while open and restores it on close', () => {
    const marker = document.createElement('div');
    marker.setAttribute('data-testid', 'outside-marker');
    document.body.appendChild(marker);

    const { unmount } = render(<Harness service={BASE_SERVICE} />);
    expect(marker.getAttribute('aria-hidden')).toBe('true');

    unmount();
    expect(marker.getAttribute('aria-hidden')).toBeNull();
    marker.remove();
  });

  it('returns focus to the exact trigger element when closed', () => {
    render(<Harness service={null} />);
    const openButton = screen.getByRole('button', { name: 'Open trigger' });
    openButton.focus();
    fireEvent.click(openButton);
    expect(screen.getByRole('dialog')).toBeTruthy();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(openButton);
  });

  it('shows TRM Restriction Owner for a Restricted service', () => {
    const restricted: Service = { ...BASE_SERVICE, trmStatus: 'Restricted', trmRestrictionOwner: 'Fixture Owning Team' };
    render(<Harness service={restricted} />);
    expect(screen.getByText('Fixture Owning Team')).toBeTruthy();
  });

  it.each(['Prohibited', 'Divest'] as const)(
    'keeps %s services non-requestable with a mouse- and keyboard-accessible explanation at >=14px',
    (trmStatus) => {
      const nonRequestable: Service = { ...BASE_SERVICE, trmStatus };
      render(<Harness service={nonRequestable} />);

      const cta = screen.getByRole('button', { name: `Request via ServiceNow. This service cannot be requested because its TRM status is ${trmStatus}.` });
      expect(cta.getAttribute('aria-disabled')).toBe('true');
      expect(screen.queryByRole('tooltip')).toBeNull();

      // Keyboard: focusing the trigger reveals the tooltip.
      fireEvent.focus(cta);
      let tooltip = screen.getByRole('tooltip');
      expect(cta.getAttribute('aria-describedby')).toBe(tooltip.id);
      expect(tooltip.textContent).toContain(`This service cannot be requested because its TRM status is ${trmStatus}.`);
      expect(tooltip.style.fontSize).toBe('14px');

      fireEvent.blur(cta);
      expect(screen.queryByRole('tooltip')).toBeNull();

      // Mouse: hovering the trigger reveals the same tooltip.
      fireEvent.mouseEnter(cta);
      tooltip = screen.getByRole('tooltip');
      expect(tooltip).toBeTruthy();
      fireEvent.mouseLeave(cta);
      expect(screen.queryByRole('tooltip')).toBeNull();
    },
  );

  it('does not render the non-requestable explanation for a Permitted service', () => {
    render(<Harness service={BASE_SERVICE} />);
    expect(screen.getByRole('button', { name: /^Request via ServiceNow$/ }).hasAttribute('aria-disabled')).toBe(false);
  });
});
