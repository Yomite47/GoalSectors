import { getOpikConfig } from '@/lib/opik/client';
import OpsDashboardClient from './OpsDashboardClient';

export const dynamic = 'force-dynamic';

export default function OpsPage() {
  const config = getOpikConfig();
  const opikStatus = {
    enabled: Boolean(config.enabled && config.apiKey),
    project: config.project || 'goalsectors',
  };

  return <OpsDashboardClient opikStatus={opikStatus} />;
}
