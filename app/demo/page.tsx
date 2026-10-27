import { AppShell } from '@/components/AppShell';
import { MapContent } from '@/components/MapContent';
import { PicsumSimulator } from '@/components/PicsumSimulator';
import { demoReports } from '@/lib/demo';

export default function Demo() {
  return (
    <AppShell demo>
      <div className="page">
        <MapContent reports={demoReports} demo />
        <PicsumSimulator />
      </div>
    </AppShell>
  );
}

