import { useEffect, useState } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { Progress, ResponseErrorPanel } from '@backstage/core-components';
import { SERVICELOG_SCOPE_CLASS_NAME, ServiceLogFeature, type Service } from '@servicelog/core';
import { servicelogApiRef } from '../api';
import { useInjectServicelogStyles } from '../styles/useInjectPluginStyles';

interface LoadState {
  loading: boolean;
  error?: Error;
  services: Service[];
}

/**
 * The Backstage wrapper for ServiceLogFeature (STORY 2.3 checkpoint D).
 * Backstage-specific concerns stop here: async loading/error handling (the
 * Backstage data path is async, unlike the standalone host's synchronous
 * YAML adapter) and the `.servicelog-scope` wrapper class the plugin's
 * scoped stylesheet targets (see ../styles/servicelog-plugin.css and
 * STORY 2.3 checkpoint B1). `Progress`/`ResponseErrorPanel` are the
 * standard Backstage core-components primitives for this, deliberately
 * not a bespoke loading/dashboard redesign.
 */
export function ServiceLogPage() {
  useInjectServicelogStyles();
  const api = useApi(servicelogApiRef);
  const [state, setState] = useState<LoadState>({ loading: true, services: [] });

  useEffect(() => {
    let cancelled = false;
    api
      .getServices()
      .then((services) => {
        if (!cancelled) setState({ loading: false, services });
      })
      .catch((error: Error) => {
        if (!cancelled) setState({ loading: false, error, services: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [api]);

  if (state.loading) return <Progress />;
  if (state.error) return <ResponseErrorPanel error={state.error} />;

  return (
    <div className={SERVICELOG_SCOPE_CLASS_NAME}>
      <ServiceLogFeature services={state.services} />
    </div>
  );
}
