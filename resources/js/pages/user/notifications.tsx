/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable import/order */
/* eslint-disable @typescript-eslint/consistent-type-imports */
"use client";

import { useEffect, useRef, useState } from "react";
import { Head, router } from "@inertiajs/react";
import { AnimatePresence, motion } from "framer-motion";
import { BellRing, Check, ChevronDown, Filter, Search } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: "success" | "alert" | "warning" | "info";
  is_read: boolean;
  created_at: string;
}

interface Pagination<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface Filters {
  search?: string;
  types?: Notification["type"][];
  perPage?: number;
}

interface NotificationsProps {
  notifications: Pagination<Notification>;
  filters: Filters;
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Application", href: "#" },
  { title: "Notifications", href: "/notifications" },
];

const typeStyles: Record<Notification["type"], string> = {
  success: "bg-green-500/10 text-green-600 dark:text-green-400",
  info: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  warning: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  alert: "bg-red-500/10 text-red-600 dark:text-red-400",
};

const typeLabels: Record<Notification["type"], string> = {
  success: "Succès",
  info: "Information",
  warning: "Avertissement",
  alert: "Alerte",
};

export default function Notifications({ notifications, filters }: NotificationsProps) {
  const items = notifications.data ?? [];

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState(filters.search ?? "");
  const [showFilters, setShowFilters] = useState(false);
  const [perPage, setPerPage] = useState(filters.perPage ?? notifications.per_page);
  const [selectedTypes, setSelectedTypes] = useState<Notification["type"][]>(filters.types ?? []);

  const searchInitialized = useRef(false);

  const markAsRead = async (id: number) => {
    try {
      await axios.post(`/admin/notifications/${id}/mark-as-read`);
      router.reload({ only: ["notifications"] });
      toast.success("Notification marquée lue");
    } catch {
      toast.error("Erreur lors du marquage");
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.post(`/admin/notifications/mark-all-as-read`);
      router.reload({ only: ["notifications"] });
      toast.success("Toutes les notifications ont été marquées lues");
    } catch {
      toast.error("Erreur lors du marquage global");
    }
  };

  const toggleFilter = (type: Notification["type"]) => {
    setSelectedTypes((current) => {
      const next = current.includes(type) ? current.filter((t) => t !== type) : [...current, type];
      goToPage(1, next, searchQuery, perPage);
      return next;
    });
  };

  const goToPage = (
    page: number,
    types: Notification["type"][] = selectedTypes,
    search: string = searchQuery,
    perPageValue: number = perPage
  ) => {
    const query = {
      search: search || undefined,
      types: types.length ? types : undefined,
      page,
      perPage: perPageValue,
    };

    router.get(route("notifications.index"), query, {
      preserveState: true,
      replace: true,
      preserveScroll: true,
    });
  };

  // Handle search input with debounce
  useEffect(() => {
    if (!searchInitialized.current) {
      searchInitialized.current = true;
      return;
    }

    const timeout = setTimeout(() => {
      goToPage(1, selectedTypes, searchQuery, perPage);
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery, selectedTypes, perPage]);

  const handlePageChange = (page: number) => {
    goToPage(page);
  };

  const handlePerPageChange = (value: number) => {
    setPerPage(value);
    goToPage(1, selectedTypes, searchQuery, value);
  };

  const activeFilters = selectedTypes.length;
  const hasNotifications = notifications.data.length > 0;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Notifications" />

      {!hasNotifications ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon" className="bg-foreground">
                <BellRing className="text-background" />
              </EmptyMedia>
              <EmptyTitle>Aucune notification</EmptyTitle>
              <EmptyDescription>
                Vous n&apos;avez aucune notification pour le moment.
              </EmptyDescription>
            </EmptyHeader>

            {/* <EmptyContent className="flex-row justify-center gap-2">
              <Button variant="default" size="sm">
                <Plus className="mr-2 h-4 w-4" /> Ajouter une notification
              </Button>
            </EmptyContent> */}
          </Empty>
        </div>
      ) : (
      <div className="flex flex-col bg-background">
          <>
        {/* HEADER */}
        <div className="bg-card px-6 py-4">
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-semibold">Notifications ({notifications.total})</h1>
            </div>

            <div className="flex gap-2 relative">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 pl-9 text-sm"
                />
              </div>

              <Button
                variant={showFilters ? "default" : "outline"}
                size="sm"
                onClick={() => setShowFilters((prev) => !prev)}
                className="relative"
              >
                <Filter className="h-4 w-4" />
                {activeFilters > 0 && (
                  <Badge
                    variant="default"
                    className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center p-0 text-xs"
                  >
                    {activeFilters}
                  </Badge>
                )}
              </Button>

              {notifications.data.length > 0 && (
                <Button size="sm" onClick={markAllAsRead}>
                  <Check className="w-4 h-4 mr-2" />
                  Tout Marquer
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* BODY */}
        <div className="flex overflow-hidden mx-6 border border-border rounded-lg">
          <AnimatePresence initial={false}>
            {showFilters && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 260, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden border-r border-border bg-card"
              >
                <div className="p-4 space-y-4">
                  <h3 className="text-sm font-semibold">Filtrer par type</h3>

                  {(["success", "info", "warning", "alert"] as Notification["type"][]).map((type) => (
                    <Button
                      key={type}
                      variant={selectedTypes.includes(type) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleFilter(type)}
                      className="w-full"
                    >
                      {typeLabels[type]}
                    </Button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex-1 overflow-y-auto divide-y divide-border">
            <AnimatePresence mode="popLayout">
              {items.length > 0 ? (
                items.map((n, index) => (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2, delay: index * 0.02 }}
                  >
                    <motion.button
                      onClick={() => setExpandedId((prev) => (prev === n.id ? null : n.id))}
                      className={`w-full p-4 text-left transition-colors hover:bg-muted/50 border-b border-border ${
                        n.is_read ? "bg-muted/40" : ""
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <motion.div animate={{ rotate: expandedId === n.id ? 180 : 0 }}>
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        </motion.div>

                        <Badge variant="secondary" className={typeStyles[n.type]}>
                          {typeLabels[n.type]}
                        </Badge>

                        <span className="flex-1 truncate font-medium text-sm">{n.title}</span>

                        {!n.is_read && (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(n.id);
                            }}
                          >
                            Marquer
                          </Button>
                        )}
                      </div>
                    </motion.button>

                    <AnimatePresence>
                      {expandedId === n.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden bg-muted/50 border-t border-border"
                        >
                          <div className="p-4 space-y-2">
                            {/* Header */}
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-semibold uppercase text-muted-foreground">
                                Message
                              </p>
                              <Badge variant="outline" className="text-xs">
                                {new Date(n.created_at).toLocaleDateString("fr-FR", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </Badge>
                            </div>

                            {/* Message content */}
                            <div className="p-3 rounded-md bg-background shadow-sm text-sm font-sans break-words">
                              {n.message}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-12 text-center">
                  <p className="text-muted-foreground">Aucune notification ne correspond aux filtres.</p>
                </motion.div>
              )}
            </AnimatePresence>

            {notifications.last_page && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-background">
                <p className="text-xs text-muted-foreground">
                  Page {notifications.current_page} sur {notifications.last_page}
                </p>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">Par page :</span>
                  <Select onValueChange={(v) => handlePerPageChange(Number(v))} value={String(perPage)}>
                    <SelectTrigger className="h-8 w-16">
                      <SelectValue placeholder="Par page" />
                    </SelectTrigger>
                    <SelectContent>
                      {[5, 10, 20, 30, 50].map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    size="sm"
                    variant="outline"
                    disabled={notifications.current_page <= 1}
                    onClick={() => handlePageChange(notifications.current_page - 1)}
                  >
                    Précédent
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    disabled={notifications.current_page >= notifications.last_page}
                    onClick={() => handlePageChange(notifications.current_page + 1)}
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
          </>
      </div>
      )}
    </AppLayout>
  );
}