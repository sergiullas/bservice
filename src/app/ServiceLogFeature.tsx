import React from 'react';
import { ServiceOfferingsPage } from './components/ServiceOfferingsPage';
import { Service } from './data/types';

interface ServiceLogFeatureProps {
  services: Service[];
}

/**
 * Host-neutral entry point for the ServiceLog product experience.
 *
 * Renders the same ServiceOfferingsPage regardless of host (standalone demo
 * shell today, Backstage page in a future story). Takes the normalized
 * catalog as a plain prop rather than importing it -- the host/data adapter
 * is responsible for producing `Service[]`, whether that's a YAML-backed
 * standalone adapter (see src/standalone/data) or a future Backstage
 * catalog adapter. Must stay free of any host-owned chrome, theme, or
 * viewport assumptions, and of any knowledge of how the data was loaded --
 * see STORY 2.1 and STORY 2.2.
 */
export function ServiceLogFeature({ services }: ServiceLogFeatureProps) {
  return <ServiceOfferingsPage services={services} />;
}
