import { AppShell } from '@/components/AppShell';
import { MapContent } from '@/components/MapContent';
import { PicsumSimulator } from '@/components/PicsumSimulator';
import { PersonaStudio } from '@/components/PersonaStudio';
import { demoReports, DEMO_IDENTITY } from '@/lib/demo';

export default function Demo() {
  return (
    <AppShell demo identity={DEMO_IDENTITY}>
      <div className="page">
        <PersonaStudio identity={DEMO_IDENTITY} />
        <MapContent reports={demoReports} demo />
        <PicsumSimulator />
      </div>
    </AppShell>
  );
}


