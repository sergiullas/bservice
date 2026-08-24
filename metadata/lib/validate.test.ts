import { describe, expect, it } from 'vitest';
import { loadCatalog, validateCatalog } from './validate';

function validEntry(overrides: Record<string, unknown> = {}) {
  return {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Resource',
    metadata: { name: 'aws-example-service', title: 'Example Service' },
    spec: {
      type: 'service-offering',
      profile: {
        cloudProvider: 'AWS',
        serviceCategory: 'Compute',
        serviceDescription: 'An example service used for schema validation tests.',
        serviceExternalDoc: 'https://docs.aws.amazon.com/example/',
        serviceInternalDoc: 'https://cloud-docs.cbp.dhs.gov/example',
        provisioningModel: 'Tier 1',
        cloudAto: ['CACE'],
        serviceOwner: 'Natasha Romanoff',
        fedRampStatus: 'FedRAMP Certified',
        trmStatus: 'Permitted',
        trmLink: 'https://cloud-docs.cbp.dhs.gov/governance/trm.html#aws-example-service',
        fundingApproach: 'ECSD pay',
        approvalWorkflow: 'Auto-Approved',
        provisioningSLA: 'Same day',
        serviceUseCases: ['Example use case'],
        ...overrides,
      },
    },
  };
}

function catalogWithProfile(overrides: Record<string, unknown>) {
  return { services: [validEntry(overrides)] };
}

describe('validateCatalog', () => {
  it('1. accepts a catalog containing a valid service entry', () => {
    expect(validateCatalog({ services: [validEntry()] }, 'fixture.yaml')).toEqual([]);
  });

  it('2. rejects an invented trmStatus value ("Dangerous") rather than accepting or coercing it', () => {
    const errors = validateCatalog(catalogWithProfile({ trmStatus: 'Dangerous' }), 'fixture.yaml');
    expect(errors.length).toBeGreaterThan(0);
    const error = errors.find((e) => e.path === 'services[0].spec.profile.trmStatus');
    expect(error).toBeDefined();
    expect(error!.expected).toContain('Permitted');
    expect(error!.expected).not.toContain('Dangerous');
  });

  it('3. rejects an invalid Cloud ATO value', () => {
    const errors = validateCatalog(catalogWithProfile({ cloudAto: ['NOT_A_REAL_ATO'] }), 'fixture.yaml');
    expect(errors.some((e) => e.path === 'services[0].spec.profile.cloudAto[0]')).toBe(true);
  });

  it('4. rejects an invalid provisioning model', () => {
    const errors = validateCatalog(catalogWithProfile({ provisioningModel: 'Tier 9' }), 'fixture.yaml');
    expect(errors.some((e) => e.path === 'services[0].spec.profile.provisioningModel')).toBe(true);
  });

  it('5. rejects an invalid FedRAMP status', () => {
    const errors = validateCatalog(catalogWithProfile({ fedRampStatus: 'Fully Authorized' }), 'fixture.yaml');
    expect(errors.some((e) => e.path === 'services[0].spec.profile.fedRampStatus')).toBe(true);
  });

  it('6. rejects an invalid approval workflow', () => {
    const errors = validateCatalog(catalogWithProfile({ approvalWorkflow: 'Rubber Stamp' }), 'fixture.yaml');
    expect(errors.some((e) => e.path === 'services[0].spec.profile.approvalWorkflow')).toBe(true);
  });

  it('7. rejects an invalid funding approach', () => {
    const errors = validateCatalog(catalogWithProfile({ fundingApproach: 'Crowdfunded' }), 'fixture.yaml');
    expect(errors.some((e) => e.path === 'services[0].spec.profile.fundingApproach')).toBe(true);
  });

  it('8. rejects an invalid / unofficial cloud provider', () => {
    const errors = validateCatalog(catalogWithProfile({ cloudProvider: 'Oracle Cloud' }), 'fixture.yaml');
    expect(errors.some((e) => e.path === 'services[0].spec.profile.cloudProvider')).toBe(true);
  });

  it('9. rejects a category spelling variant instead of silently creating a new category', () => {
    const errors = validateCatalog(catalogWithProfile({ serviceCategory: 'AI and Machine Learning' }), 'fixture.yaml');
    const error = errors.find((e) => e.path === 'services[0].spec.profile.serviceCategory');
    expect(error).toBeDefined();
    expect(error!.expected).toContain('AI & Machine Learning');
  });

  it('10. rejects an entry missing required fields', () => {
    const catalog = { services: [validEntry()] };
    // @ts-expect-error -- intentionally deleting a required field for the test
    delete (catalog.services[0].spec.profile as Record<string, unknown>).serviceDescription;
    const errors = validateCatalog(catalog, 'fixture.yaml');
    expect(errors.some((e) => e.message.includes('serviceDescription'))).toBe(true);
  });

  it('11. rejects Restricted without a trmRestrictionOwner', () => {
    const errors = validateCatalog(catalogWithProfile({ trmStatus: 'Restricted' }), 'fixture.yaml');
    expect(errors.some((e) => e.message.includes('trmRestrictionOwner'))).toBe(true);

    // A trmRestrictionOwner alongside Restricted is fine.
    expect(
      validateCatalog(
        catalogWithProfile({ trmStatus: 'Restricted', trmRestrictionOwner: 'CIM Platform Team' }),
        'fixture.yaml'
      )
    ).toEqual([]);
  });

  it('12. rejects duplicate service IDs within the aggregate catalog', () => {
    const first = validEntry();
    const second = validEntry();
    second.metadata.title = 'Example Service (duplicate)';
    const { services, errors } = loadCatalog({ services: [first, second] }, 'services.yaml');
    expect(services).toEqual([]);
    expect(errors.length).toBe(2);
    expect(errors.every((e) => e.message.includes('duplicate service id'))).toBe(true);
    expect(errors.map((e) => e.path).sort()).toEqual([
      'services[0].metadata.name',
      'services[1].metadata.name',
    ]);
  });

  it('13. rejects stale/unknown profile fields rather than silently ignoring them', () => {
    const errors = validateCatalog(catalogWithProfile({ atoStatus: 'Approved', statusBadge: 'green' }), 'fixture.yaml');
    expect(errors.some((e) => e.message.includes('atoStatus'))).toBe(true);
  });

  it('errors are actionable: identify file, entry index/id, field path, and expected values', () => {
    const errors = validateCatalog(catalogWithProfile({ trmStatus: 'Dangerous' }), 'my-catalog.yaml');
    const error = errors[0];
    expect(error.file).toBe('my-catalog.yaml');
    expect(error.path).toBe('services[0].spec.profile.trmStatus');
    expect(error.serviceIndex).toBe(0);
    expect(error.serviceId).toBe('aws-example-service');
    expect(error.invalidValue).toBe('Dangerous');
    expect(error.expected).toBeTruthy();
  });

  it('never accepts spec.owner as a substitute for spec.profile.serviceOwner', () => {
    const entry = validEntry();
    (entry.spec as Record<string, unknown>).owner = 'group:default/example-team';
    expect(validateCatalog({ services: [entry] }, 'fixture.yaml')).toEqual([]);

    const { services } = loadCatalog({ services: [entry] }, 'fixture.yaml');
    expect(services[0].serviceOwner).toBe('Natasha Romanoff');
    expect(services[0]).not.toHaveProperty('owner');
  });

  it('rejects a catalog missing the services array', () => {
    const errors = validateCatalog({}, 'fixture.yaml');
    expect(errors.some((e) => e.message.includes('services'))).toBe(true);
  });
});
