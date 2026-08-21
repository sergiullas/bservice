import React from 'react';
import { ServiceOfferingsPage } from './components/ServiceOfferingsPage';

/**
 * Host-neutral entry point for the ServiceLog product experience.
 *
 * Renders the same ServiceOfferingsPage regardless of host (standalone demo
 * shell today, Backstage page in a future story). Must stay free of any
 * host-owned chrome, theme, or viewport assumptions — see STORY 2.1.
 */
export function ServiceLogFeature() {
  return <ServiceOfferingsPage />;
}
