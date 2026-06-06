export const STATUS_COLORS: Record<string, string> = {
  Open: '#EF4444',
  'Under Review': '#F59E0B',
  'In Progress': '#3B82F6',
  Resolved: '#22C55E',
};

export const STATUS_BG_CLASSES: Record<string, string> = {
  Open: 'bg-red-100 text-red-800',
  'Under Review': 'bg-amber-100 text-amber-800',
  'In Progress': 'bg-blue-100 text-blue-800',
  Resolved: 'bg-green-100 text-green-800',
};

export const STATUS_DOT_CLASSES: Record<string, string> = {
  Open: 'bg-red-500',
  'Under Review': 'bg-amber-500',
  'In Progress': 'bg-blue-500',
  Resolved: 'bg-green-500',
};

export const REPORT_STATUSES = ['Open', 'Under Review', 'In Progress', 'Resolved'] as const;

export const MAP_DEFAULT_CENTER: [number, number] = [20.5937, 78.9629];
export const MAP_DEFAULT_ZOOM = 5;

export const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
