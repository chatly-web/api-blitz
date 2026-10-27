import { T } from '@/components/LanguageProvider';
import { cn } from '@/lib/utils';
import type { ReportStatus } from '@/lib/types';
export const statusLabels: Record<ReportStatus, string> = { open: 'Open', acknowledged: 'Acknowledged', in_progress: 'In progress', resolved: 'Resolved' };
export function StatusBadge({ status }: { status: ReportStatus }) { return <span className={cn('status-badge', `status-${status}`)}><span aria-hidden="true" /><T>{statusLabels[status]}</T></span>; }
