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
 * shell today, Backstage page in a future story). Must stay free of any
 * host-owned chrome, theme, or viewport assumptions -- see STORY 2.1. It
 * also has no idea how `services` was produced: a host/data adapter (the
 * standalone YAML adapter today, a future Backstage catalog adapter) is
 * responsible for validating and normalizing raw metadata into `Service[]`
 * before it ever reaches this component -- see STORY 2.2.
 */
export function ServiceLogFeature({ services }: ServiceLogFeatureProps) {
  return <ServiceOfferingsPage services={services} />;
}
