import type { ReportStatus } from '../types';
import { STATUS_BG_CLASSES, STATUS_DOT_CLASSES } from '../utils/constants';

interface Props {
  status: ReportStatus;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'md' }: Props) {
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${STATUS_BG_CLASSES[status]} ${sizeClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT_CLASSES[status]}`} />
      {status}
    </span>
  );
}
