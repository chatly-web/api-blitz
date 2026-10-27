import { AppShell } from '@/components/AppShell';
import { MapContent } from '@/components/MapContent';
import { PicsumSimulator } from '@/components/PicsumSimulator';
import { PersonaStudio } from '@/components/PersonaStudio';
import { demoReports } from '@/lib/demo';

const DEMO_IDENTITY = {
  handle: 'Ward 4 Resident #7a2f',
  avatarSeed: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
};

export default function Demo() {
  return (
    <AppShell demo>
      <div className="page">
        <PersonaStudio identity={DEMO_IDENTITY} />
        <MapContent reports={demoReports} demo />
        <PicsumSimulator />
      </div>
    </AppShell>
  );
}


