import { Card } from '@/components/ui/Card';
import type { SeasonalNotice } from '@/lib/types';

export function NoticeCard({ notices }: { notices: SeasonalNotice[] }) {
  if (notices.length === 0) return null;

  return (
    <div className="space-y-2">
      {notices.map((notice) => (
        <Card key={notice.id} className="flex items-start gap-3">
          {notice.icon && (
            <span className="shrink-0 text-lg" aria-hidden="true">
              {notice.icon}
            </span>
          )}
          <p className="text-sm text-gray-600 dark:text-gray-300">{notice.message}</p>
        </Card>
      ))}
    </div>
  );
}
