import { describe, expect, it } from 'vitest';
import { loadCatalog, validateDocument } from './validate';

function validDoc(overrides: Record<string, unknown> = {}) {
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

function withProfile(overrides: Record<string, unknown>) {
  return validDoc(overrides);
}

describe('validateDocument', () => {
  it('1. accepts a valid service document', () => {
    expect(validateDocument(validDoc(), 'fixture.yaml')).toEqual([]);
  });

  it('2. rejects an invented trmStatus value ("Dangerous") rather than accepting or coercing it', () => {
    const errors = validateDocument(withProfile({ trmStatus: 'Dangerous' }), 'fixture.yaml');
    expect(errors.length).toBeGreaterThan(0);
    const error = errors.find((e) => e.path === '/spec/profile/trmStatus');
    expect(error).toBeDefined();
    expect(error!.expected).toContain('Permitted');
    expect(error!.expected).not.toContain('Dangerous');
  });

  it('3. rejects an invalid Cloud ATO value', () => {
    const errors = validateDocument(withProfile({ cloudAto: ['NOT_A_REAL_ATO'] }), 'fixture.yaml');
    expect(errors.some((e) => e.path === '/spec/profile/cloudAto/0')).toBe(true);
  });

  it('4. rejects an invalid provisioning model', () => {
    const errors = validateDocument(withProfile({ provisioningModel: 'Tier 9' }), 'fixture.yaml');
    expect(errors.some((e) => e.path === '/spec/profile/provisioningModel')).toBe(true);
  });

  it('5. rejects an invalid FedRAMP status', () => {
    const errors = validateDocument(withProfile({ fedRampStatus: 'Fully Authorized' }), 'fixture.yaml');
    expect(errors.some((e) => e.path === '/spec/profile/fedRampStatus')).toBe(true);
  });

  it('6. rejects an invalid approval workflow', () => {
    const errors = validateDocument(withProfile({ approvalWorkflow: 'Rubber Stamp' }), 'fixture.yaml');
    expect(errors.some((e) => e.path === '/spec/profile/approvalWorkflow')).toBe(true);
  });

  it('7. rejects an invalid funding approach', () => {
    const errors = validateDocument(withProfile({ fundingApproach: 'Crowdfunded' }), 'fixture.yaml');
    expect(errors.some((e) => e.path === '/spec/profile/fundingApproach')).toBe(true);
  });

  it('8. rejects an invalid / unofficial cloud provider', () => {
    const errors = validateDocument(withProfile({ cloudProvider: 'Oracle Cloud' }), 'fixture.yaml');
    expect(errors.some((e) => e.path === '/spec/profile/cloudProvider')).toBe(true);
  });

  it('9. rejects a category spelling variant instead of silently creating a new category', () => {
    const errors = validateDocument(withProfile({ serviceCategory: 'AI and Machine Learning' }), 'fixture.yaml');
    const error = errors.find((e) => e.path === '/spec/profile/serviceCategory');
    expect(error).toBeDefined();
    expect(error!.expected).toContain('AI & Machine Learning');
  });

  it('10. rejects a document missing required fields', () => {
    const doc = validDoc();
    // @ts-expect-error -- intentionally deleting a required field for the test
    delete (doc.spec.profile as Record<string, unknown>).serviceDescription;
    const errors = validateDocument(doc, 'fixture.yaml');
    expect(errors.some((e) => e.message.includes('serviceDescription'))).toBe(true);
  });

  it('11. rejects Restricted without a trmRestrictionOwner', () => {
    const errors = validateDocument(withProfile({ trmStatus: 'Restricted' }), 'fixture.yaml');
    expect(errors.some((e) => e.message.includes('trmRestrictionOwner'))).toBe(true);

    // A trmRestrictionOwner alongside Restricted is fine.
    expect(
      validateDocument(withProfile({ trmStatus: 'Restricted', trmRestrictionOwner: 'CIM Platform Team' }), 'fixture.yaml')
    ).toEqual([]);
  });

  it('12. rejects duplicate service IDs across documents in the loaded catalog', () => {
    const first = validDoc();
    const second = validDoc();
    second.metadata.title = 'Example Service (duplicate)';
    const { services, errors } = loadCatalog([
      { file: 'a.yaml', doc: first },
      { file: 'b.yaml', doc: second },
    ]);
    expect(services).toEqual([]);
    expect(errors.length).toBe(2);
    expect(errors.every((e) => e.message.includes('duplicate service id'))).toBe(true);
    expect(errors.map((e) => e.file).sort()).toEqual(['a.yaml', 'b.yaml']);
  });

  it('13. rejects stale/unknown profile fields rather than silently ignoring them', () => {
    const errors = validateDocument(withProfile({ atoStatus: 'Approved', statusBadge: 'green' }), 'fixture.yaml');
    expect(errors.some((e) => e.message.includes('atoStatus'))).toBe(true);
  });

  it('errors are actionable: identify file, field path, and expected values', () => {
    const errors = validateDocument(withProfile({ trmStatus: 'Dangerous' }), 'my-service.yaml');
    const error = errors[0];
    expect(error.file).toBe('my-service.yaml');
    expect(error.path).toBe('/spec/profile/trmStatus');
    expect(error.invalidValue).toBe('Dangerous');
    expect(error.expected).toBeTruthy();
  });

  it('never accepts spec.owner as a substitute for spec.profile.serviceOwner', () => {
    const doc = validDoc();
    (doc.spec as Record<string, unknown>).owner = 'group:default/example-team';
    expect(validateDocument(doc, 'fixture.yaml')).toEqual([]);

    const { services } = loadCatalog([{ file: 'fixture.yaml', doc }]);
    expect(services[0].serviceOwner).toBe('Natasha Romanoff');
    expect(services[0]).not.toHaveProperty('owner');
  });
});
