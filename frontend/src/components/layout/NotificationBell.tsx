import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, Check, CheckCheck, ClipboardList, X } from "lucide-react";
import { getAllComplaints, getMyComplaints } from "../../api";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "success" | "warning" | "info";
};

type NotificationBellProps = {
  role: "student" | "admin";
};

function NotificationBell({ role }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const storageKey =
    role === "student"
      ? "campusai_student_read_notifications"
      : "campusai_admin_read_notifications";

  useEffect(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem(storageKey) || "[]"
      );
      setReadIds(Array.isArray(saved) ? saved : []);
    } catch {
      setReadIds([]);
    }
  }, [storageKey]);

  async function loadNotifications() {
    setLoading(true);

    try {
      if (role === "student") {
        const complaints = await getMyComplaints();

        const items: NotificationItem[] = [];

        complaints.forEach((complaint: any) => {
          const baseId = complaint.complaint_id;
          const title = complaint.title || "Your complaint";
          const time =
            complaint.updated_at ||
            complaint.created_at ||
            new Date().toISOString();

          items.push({
            id: `${baseId}-submitted`,
            title: "Complaint received",
            message: title,
            time,
            type: "info",
          });

          if (complaint.status === "Resolved") {
            items.push({
              id: `${baseId}-resolved`,
              title: "Complaint resolved",
              message: `${title} has been resolved.`,
              time,
              type: "success",
            });
          } else if (complaint.status === "In Progress") {
            items.push({
              id: `${baseId}-progress`,
              title: "Complaint in progress",
              message: `${title} is being worked on.`,
              time,
              type: "warning",
            });
          } else {
            items.push({
              id: `${baseId}-review`,
              title: "Complaint under review",
              message: `${title} is currently under review.`,
              time,
              type: "info",
            });
          }
        });

        items.sort(
          (a, b) =>
            new Date(b.time).getTime() -
            new Date(a.time).getTime()
        );

        setNotifications(items.slice(0, 8));
      } else {
        const complaints = await getAllComplaints();

        const items: NotificationItem[] = complaints.map(
          (complaint: any) => {
            const isHighPriority =
              complaint.priority === "High" ||
              complaint.priority === "Critical";

            return {
              id: `admin-${complaint.complaint_id}`,
              title: isHighPriority
                ? "High-priority complaint"
                : "New complaint received",
              message: `${complaint.title || "Complaint"} • ${
                complaint.location || "Campus"
              }`,
              time:
                complaint.updated_at ||
                complaint.created_at ||
                new Date().toISOString(),
              type: isHighPriority ? "warning" : "info",
            };
          }
        );

        items.sort(
          (a: NotificationItem, b: NotificationItem) =>
            new Date(b.time).getTime() -
            new Date(a.time).getTime()
        );

        setNotifications(items.slice(0, 8));
      }
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();

    const interval = window.setInterval(
      loadNotifications,
      30000
    );

    return () => window.clearInterval(interval);
  }, [role]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        ref.current &&
        !ref.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
  }, []);

  const unreadCount = useMemo(
    () =>
      notifications.filter(
        (notification) =>
          !readIds.includes(notification.id)
      ).length,
    [notifications, readIds]
  );

  function markAsRead(id: string) {
    const updated = readIds.includes(id)
      ? readIds
      : [...readIds, id];

    setReadIds(updated);
    localStorage.setItem(
      storageKey,
      JSON.stringify(updated)
    );
  }

  function markAllAsRead() {
    const ids = notifications.map(
      (notification) => notification.id
    );

    setReadIds(ids);
    localStorage.setItem(
      storageKey,
      JSON.stringify(ids)
    );
  }

  function formatTime(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Notifications"
        className="relative rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
      >
        <Bell size={18} />

        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Notifications
              </h3>
              <p className="text-xs text-slate-500">
                {unreadCount > 0
                  ? `${unreadCount} unread`
                  : "All caught up"}
              </p>
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  title="Mark all as read"
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                >
                  <CheckCheck size={16} />
                </button>
              )}

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="max-h-[390px] overflow-y-auto">
            {loading ? (
              <div className="px-4 py-10 text-center text-sm text-slate-500">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <Bell className="mx-auto mb-2 text-slate-300" size={28} />
                <p className="text-sm font-medium text-slate-700">
                  No notifications
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  New activity will appear here.
                </p>
              </div>
            ) : (
              notifications.map((notification) => {
                const unread = !readIds.includes(
                  notification.id
                );

                return (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() =>
                      markAsRead(notification.id)
                    }
                    className={`flex w-full gap-3 border-b border-slate-100 px-4 py-3 text-left transition hover:bg-slate-50 ${
                      unread ? "bg-slate-50/80" : "bg-white"
                    }`}
                  >
                    <div
                      className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                        notification.type === "success"
                          ? "bg-emerald-50 text-emerald-600"
                          : notification.type === "warning"
                            ? "bg-amber-50 text-amber-600"
                            : "bg-indigo-50 text-indigo-600"
                      }`}
                    >
                      {notification.type === "success" ? (
                        <Check size={17} />
                      ) : (
                        <ClipboardList size={17} />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-800">
                          {notification.title}
                        </p>

                        {unread && (
                          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
                        )}
                      </div>

                      <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-slate-500">
                        {notification.message}
                      </p>

                      <p className="mt-1 text-[10px] text-slate-400">
                        {formatTime(notification.time)}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div className="border-t border-slate-200 px-4 py-2.5">
            <p className="text-center text-[10px] text-slate-400">
              CampusAI • Live activity updates every 30 seconds
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
