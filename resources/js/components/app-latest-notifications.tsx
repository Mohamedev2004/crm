/* eslint-disable import/order */
import { Bell, BellRing, Clock } from 'lucide-react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
} from 'lucide-react';

import { Link, usePage } from '@inertiajs/react';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/* -----------------------------
   Types
-------------------------------- */
type NotificationType = 'success' | 'alert' | 'warning' | 'info';

interface Notification {
  id: number;
  title: string;
  type: NotificationType;
  time: string;
}

interface NotificationsProps {
  latestNotifications?: Notification[];
  unreadNotificationsCount?: number;
}

/* -----------------------------
   Config
-------------------------------- */
const notificationConfig = {
  success: {
    icon: CheckCircle2,
    color: 'text-green-600',
    bg: 'bg-green-500/10',
    badgetext: 'text-green-600',
  },
  alert: {
    icon: XCircle,
    color: 'text-red-600',
    bg: 'bg-red-500/10',
    badgetext: 'text-red-600',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-yellow-600',
    bg: 'bg-yellow-500/10',
    badgetext: 'text-yellow-600',
  },
  info: {
    icon: Info,
    color: 'text-blue-600',
    bg: 'bg-blue-500/10',
    badgetext: 'text-blue-600',
  },
};

/* -----------------------------
   Component
-------------------------------- */
export function AppLatestNotifications() {
  const { latestNotifications = [], unreadNotificationsCount = 0 } =
    usePage().props as NotificationsProps;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="md"
          className="relative cursor-pointer border"
        >
          <Bell className="h-5 w-5" />

          {/* Unread Badge */}
          {unreadNotificationsCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-sm text-xs text-white dark:text-black bg-black dark:bg-white">
              {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-96 p-0 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <span className="text-sm font-semibold">Notifications</span>
          <Link href="/notifications">
            <Button variant="link" size="xs" className="text-xs cursor-pointer">
              Voir tout
            </Button>
          </Link>
        </div>

        {/* List */}
        <div className="max-h-[380px] overflow-visible flex flex-col gap-1 relative p-2">
          {latestNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <BellRing className="h-10 w-10 mb-3 opacity-40" />
              <p className="text-sm font-medium">Aucune notification</p>
              <p className="text-xs mt-1 opacity-70">Vous êtes à jour !</p>
            </div>
          ) : (
            latestNotifications.map((n) => {
              const config = notificationConfig[n.type];
              const Icon = config.icon;

              return (
                <div
                  key={n.id}
                  className="
                    group relative flex gap-3 px-4 py-3 text-sm 
                    bg-card rounded-md 
                    shadow-md dark:shadow-[0_0_0_1px_rgba(255,255,255,0.06)]
                    hover:shadow-2xl dark:hover:shadow-[0_8px_25px_rgba(0,0,0,0.6)]
                    transform transition-all duration-300 ease-out
                    hover:scale-105 hover:z-50
                  "
                >
                  {/* Icon */}
                  <div
                    className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-full ${config.bg}`}
                  >
                    <Icon className={`h-5 w-5 ${config.color}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 overflow-hidden">
                    <p className="font-medium text-foreground leading-tight truncate">
                      {n.title}
                    </p>
                    <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <Badge
                        variant="outline"
                        className={`capitalize ${config.badgetext} mr-2`}
                      >
                        {n.type === 'success'
                          ? 'succès'
                          : n.type === 'alert'
                          ? 'alerte'
                          : n.type === 'warning'
                          ? 'avertissement'
                          : 'information'}
                      </Badge>
                      <Clock className="h-3 w-3" />
                      <span>{n.time}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}