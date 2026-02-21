/* eslint-disable import/order */
/* eslint-disable @typescript-eslint/consistent-type-imports */
"use client";

import React, { useMemo, useState } from "react";
import { Head } from "@inertiajs/react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Filter, Search } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: "success" | "alert" | "warning" | "info";
  is_read: boolean;
  created_at: string;
}

interface NotificationsProps {
  notifications: Notification[];
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Plateforme", href: "#" },
  { title: "Notifications", href: "/notifications" },
];

const typeStyles: Record<Notification["type"], string> = {
  success: "bg-green-500/10 text-green-600 dark:text-green-400",
  info: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  warning: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  alert: "bg-red-500/10 text-red-600 dark:text-red-400",
};

/* 🔥 French Labels */
const typeLabels: Record<Notification["type"], string> = {
  success: "Succès",
  info: "Information",
  warning: "Avertissement",
  alert: "Alerte",
};

export default function Notifications({
  notifications: initial,
}: NotificationsProps) {
  const [notifications, setNotifications] =
    useState<Notification[]>(initial);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<{ type: Notification["type"][] }>({
    type: [],
  });

  const markAsRead = async (id: number) => {
    try {
      await axios.post(`/admin/notifications/${id}/mark-as-read`);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, is_read: true } : n
        )
      );
      toast.success("Notification marquée lue");
    } catch {
      toast.error("Erreur lors du marquage");
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.post(`/admin/notifications/mark-all-as-read`);
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true }))
      );
      toast.success("Toutes les notifications ont été marquées lues");
    } catch {
      toast.error("Erreur lors du marquage global");
    }
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      const matchSearch =
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.message.toLowerCase().includes(searchQuery.toLowerCase());

      const matchType =
        filters.type.length === 0 ||
        filters.type.includes(n.type);

      return matchSearch && matchType;
    });
  }, [notifications, searchQuery, filters]);

  const toggleFilter = (type: Notification["type"]) => {
    setFilters((current) => ({
      type: current.type.includes(type)
        ? current.type.filter((t) => t !== type)
        : [...current.type, type],
    }));
  };

  const activeFilters = filters.type.length;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Notifications" />

      <div className="flex h-full flex-col bg-background">

        {/* HEADER */}
        <div className="bg-card p-6">
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-semibold">
                Notifications
              </h1>
              <p className="text-sm text-muted-foreground">
                {filteredNotifications.length} sur {notifications.length}
              </p>
            </div>

            <div className="flex gap-2 relative">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) =>
                    setSearchQuery(e.target.value)
                  }
                  className="h-9 pl-9 text-sm"
                />
              </div>

              <Button
                variant={showFilters ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  setShowFilters((prev) => !prev)
                }
                className="relative"
              >
                <Filter className="h-4 w-4" />
                {activeFilters > 0 && (
                  <Badge variant='default' className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center p-0 text-xs">
                    {activeFilters}
                  </Badge>
                )}
              </Button>

              {notifications.length > 0 && (
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

          {/* FILTER PANEL */}
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
                  <h3 className="text-sm font-semibold">
                    Filtrer par type
                  </h3>

                  {(["success", "info", "warning", "alert"] as Notification["type"][]).map(
                    (type) => (
                      <Button
                        key={type}
                        variant={
                          filters.type.includes(type)
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => toggleFilter(type)}
                        className="w-full"
                      >
                        {typeLabels[type]}
                      </Button>
                    )
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* LIST */}
          <div className="flex-1 overflow-y-auto divide-y divide-border">

            <AnimatePresence mode="popLayout">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((n, index) => (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{
                      duration: 0.2,
                      delay: index * 0.02,
                    }}
                  >
                    <motion.button
                      onClick={() =>
                        setExpandedId((prev) =>
                          prev === n.id ? null : n.id
                        )
                      }
                      className={`w-full p-4 text-left transition-colors hover:bg-muted/50 border-b border-border ${
                        n.is_read ? "bg-muted/40" : ""
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <motion.div
                          animate={{
                            rotate:
                              expandedId === n.id
                                ? 180
                                : 0,
                          }}
                        >
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        </motion.div>

                        <Badge
                          variant="secondary"
                          className={typeStyles[n.type]}
                        >
                          {typeLabels[n.type]}
                        </Badge>

                        <span className="flex-1 truncate font-medium text-sm">
                          {n.title}
                        </span>

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
                          initial={{
                            height: 0,
                            opacity: 0,
                          }}
                          animate={{
                            height: "auto",
                            opacity: 1,
                          }}
                          exit={{
                            height: 0,
                            opacity: 0,
                          }}
                          transition={{
                            duration: 0.2,
                          }}
                          className="overflow-hidden bg-muted/50 border-t border-border"
                        >
                          <div className="p-4">
                            <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                              Message
                            </p>
                            <p className="p-3 rounded font-mono text-sm">
                              {n.message} - {n.created_at}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-12 text-center"
                >
                  <p className="text-muted-foreground">
                    Aucune notification ne correspond aux filtres.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </div>
    </AppLayout>
  );
}