import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { ServiceLogFeature } from './ServiceLogFeature';
import { Service } from './data/types';

afterEach(cleanup);

// Host-neutral fixture data: a future Backstage host (or this test) supplies
// Service[] directly, the way any data adapter would -- ServiceLogFeature
// must not care where it came from.
const FIXTURE_SERVICES: Service[] = [
  {
    id: 'fixture-service',
    serviceName: 'Fixture Service',
    cloudProvider: 'AWS',
    serviceCategory: 'Compute',
    serviceDescription: 'A fixture service used only to exercise ServiceLogFeature in isolation.',
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
  },
];

describe('ServiceLogFeature (host-neutral)', () => {
  it('renders the ServiceLog experience in a constrained container with no standalone host mounted', () => {
    // No StandaloneApp, no ThemeProvider, no Sidebar, no 100vh shell -- only
    // a small constrained parent, the way a future Backstage page would host
    // this feature. Proves the boundary from STORY 2.1 scope A/C.
    const { container } = render(
      <div style={{ width: 480, height: 320, overflow: 'auto' }}>
        <ServiceLogFeature services={FIXTURE_SERVICES} />
      </div>,
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Service Offerings' })).toBeTruthy();
    expect(screen.getByPlaceholderText('Search service offerings...')).toBeTruthy();

    // Sidebar was never imported by this test, so its markers must be
    // absent -- confirms ServiceLogFeature has no dependency on it.
    expect(screen.queryByLabelText(/sidebar/i)).toBeNull();
    expect(container.querySelector('[data-name="Vector"]')).toBeNull();
  });
});
