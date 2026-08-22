import React, { useMemo, useRef, useState } from 'react';
import { FilterBar } from './FilterBar';
import { ServiceCard } from './ServiceCard';
import { ServiceDetailDrawer } from './ServiceDetailDrawer';
import { Service, TrmStatus } from '../data/types';

interface ServiceOfferingsPageProps {
  services: Service[];
}

export function ServiceOfferingsPage({ services }: ServiceOfferingsPageProps) {
  const [search, setSearch] = useState('');
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTrmStatuses, setSelectedTrmStatuses] = useState<TrmStatus[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const pageHeadingRef = useRef<HTMLHeadingElement>(null);
  const handleSelect = (service: Service, trigger: HTMLElement) => {
    triggerRef.current = trigger;
    setSelectedService(service);
  };

  const providerOptions = useMemo(() => Array.from(new Set(services.map((service) => service.cloudProvider))).sort(), [services]);
  const categoryOptions = useMemo(() => Array.from(new Set(services.map((service) => service.serviceCategory))).sort(), [services]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return services.filter((service) => {
      const matchesProvider = selectedProviders.length === 0 || selectedProviders.includes(service.cloudProvider);
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(service.serviceCategory);
      const matchesTrm = selectedTrmStatuses.length === 0 || selectedTrmStatuses.includes(service.trmStatus);
      const matchesSearch = !query || [service.serviceName, service.cloudProvider, service.serviceCategory, service.serviceDescription]
        .some((value) => value.toLowerCase().includes(query));
      return matchesProvider && matchesCategory && matchesTrm && matchesSearch;
    });
  }, [services, search, selectedProviders, selectedCategories, selectedTrmStatuses]);

  const grouped = useMemo(() => filtered.reduce((map, service) => {
    (map[service.serviceCategory] ??= []).push(service);
    return map;
  }, {} as Record<string, Service[]>), [filtered]);
  const visibleCategories = categoryOptions.filter((category) => grouped[category]?.length);
  const showFlat = selectedCategories.length === 1;
  const clearAll = () => { setSearch(''); setSelectedProviders([]); setSelectedCategories([]); setSelectedTrmStatuses([]); };

  return (
    <div>
      <header className="mb-6">
        <h1 ref={pageHeadingRef} tabIndex={-1} className="mb-1.5 text-[28px] font-bold leading-[1.3] text-[#1A1A2E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1565C0]">Service Offerings</h1>
        <p className="max-w-[560px] text-[14px] leading-[1.6] text-[#555]">Discover the cloud capabilities available to you, see whether approval is required, and learn how to get started.</p>
      </header>

      <FilterBar search={search} onSearchChange={setSearch} providerOptions={providerOptions} selectedProviders={selectedProviders} onProvidersChange={setSelectedProviders} categoryOptions={categoryOptions} selectedCategories={selectedCategories} onCategoriesChange={setSelectedCategories} selectedTrmStatuses={selectedTrmStatuses} onTrmStatusesChange={setSelectedTrmStatuses} totalCount={services.length} filteredCount={filtered.length} onClearAll={clearAll} />

      {filtered.length === 0 ? <div className="py-16 text-center text-[14px]"><p className="text-slate-600">No service offerings match your search and filters.</p><button type="button" onClick={clearAll} className="mt-2 font-medium text-[#1565C0] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1565C0]">Clear all</button></div> : showFlat ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{filtered.map((service) => <ServiceCard key={service.id} service={service} onSelect={handleSelect} headingLevel={2} />)}</div>
      ) : visibleCategories.map((category) => (
        <section key={category} className="mb-9">
          <div className="mb-4 flex items-center gap-2 border-b border-slate-200 pb-3">
            <h2 className="text-[16px] font-bold text-[#1A1A2E]">{category}</h2>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[12px] font-bold text-slate-600">{grouped[category]?.length}</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{grouped[category]?.map((service) => <ServiceCard key={service.id} service={service} onSelect={handleSelect} headingLevel={3} />)}</div>
        </section>
      ))}
      <ServiceDetailDrawer service={selectedService} onClose={() => setSelectedService(null)} triggerRef={triggerRef} fallbackFocusRef={pageHeadingRef} />
    </div>
  );
}
