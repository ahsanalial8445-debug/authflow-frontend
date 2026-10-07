import { useEffect, useRef, useState } from "react";
import { Bell, Check, CheckCheck } from "lucide-react";
import api from "../api/axios";

const formatCreatedAt = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [countError, setCountError] = useState(false);
  const [panelError, setPanelError] = useState("");
  const containerRef = useRef(null);

  useEffect(() => {
    let active = true;
    const refreshUnreadCount = async () => {
      try {
        const { data } = await api.get("/notifications/unread-count");
        if (active) {
          setUnreadCount(data.unreadCount);
          setCountError(false);
        }
      } catch (error) {
        console.error("Unable to load notification count:", error);
        if (active) setCountError(true);
      }
    };

    refreshUnreadCount();
    const intervalId = window.setInterval(refreshUnreadCount, 30_000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleOutsideClick = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const loadNotifications = async () => {
    setIsLoading(true);
    setPanelError("");
    try {
      const { data } = await api.get("/notifications");
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
      setCountError(false);
    } catch (error) {
      console.error("Unable to load notifications:", error);
      setPanelError("Unable to load notifications. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return undefined;

    let active = true;
    const refreshNotifications = async () => {
      try {
        const { data } = await api.get("/notifications");
        if (active) {
          setNotifications(data.notifications);
          setUnreadCount(data.unreadCount);
          setCountError(false);
          setPanelError("");
        }
      } catch (error) {
        console.error("Unable to refresh notifications:", error);
        if (active) {
          setPanelError("Unable to refresh notifications. Please try again.");
        }
      }
    };

    const intervalId = window.setInterval(refreshNotifications, 30_000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [isOpen]);

  const togglePanel = () => {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);
    if (nextOpen) loadNotifications();
  };

  const markAsRead = async (notificationId) => {
    setBusyId(notificationId);
    setPanelError("");
    try {
      const { data } = await api.patch(`/notifications/${notificationId}/read`);
      setNotifications((current) =>
        current.map((notification) =>
          notification._id === notificationId ? data.notification : notification
        )
      );
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error("Unable to mark notification as read:", error);
      setPanelError("Unable to update this notification. Please try again.");
    } finally {
      setBusyId("");
    }
  };

  const markAllAsRead = async () => {
    setBusyId("all");
    setPanelError("");
    try {
      const { data } = await api.patch("/notifications/read-all");
      setNotifications((current) =>
        current.map((notification) => ({ ...notification, read: true }))
      );
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error("Unable to mark all notifications as read:", error);
      setPanelError("Unable to update notifications. Please try again.");
    } finally {
      setBusyId("");
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={togglePanel}
        className={`relative flex h-9 w-9 items-center justify-center rounded-xl border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
          isOpen
            ? "border-brand-200 bg-brand-50 text-brand-700"
            : "border-slate-200/80 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800"
        }`}
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        title={countError ? "Notification count unavailable" : "Notifications"}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-white bg-red-500 px-1 text-[9px] font-bold leading-none text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
        {countError && (
          <span className="absolute right-0 top-0 h-2 w-2 rounded-full border border-white bg-amber-500" />
        )}
      </button>

      {isOpen && (
        <section
          className="fixed right-3 top-20 z-[60] w-[min(24rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/15 md:absolute md:right-0 md:top-[calc(100%+0.75rem)]"
          role="dialog"
          aria-label="Notification center"
        >
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3.5">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Notifications</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                {unreadCount} unread
              </p>
            </div>
            <button
              type="button"
              onClick={markAllAsRead}
              disabled={!unreadCount || busyId !== ""}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-50 disabled:cursor-not-allowed disabled:text-slate-400 disabled:hover:bg-transparent"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all as read
            </button>
          </div>

          {panelError && (
            <div
              className="mx-3 mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800"
              role="status"
            >
              <p>{panelError}</p>
              <button
                type="button"
                onClick={loadNotifications}
                className="mt-1 font-semibold underline underline-offset-2"
              >
                Try again
              </button>
            </div>
          )}

          <div className="max-h-[min(65vh,28rem)] overflow-y-auto">
            {isLoading ? (
              <p className="px-4 py-10 text-center text-sm text-slate-500">
                Loading notifications…
              </p>
            ) : notifications.length ? (
              <ul className="divide-y divide-slate-100">
                {notifications.map((notification) => (
                  <li
                    key={notification._id}
                    className={`flex min-w-0 items-start gap-3 px-4 py-3.5 ${
                      notification.read ? "bg-white" : "bg-brand-50/40"
                    }`}
                  >
                    <span
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                        notification.read ? "bg-slate-200" : "bg-brand-500"
                      }`}
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="break-words text-sm font-semibold text-slate-900">
                        {notification.title}
                      </p>
                      <p className="mt-1 break-words text-xs leading-relaxed text-slate-600">
                        {notification.message}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-2 text-[11px] text-slate-400">
                        <time dateTime={notification.createdAt}>
                          {formatCreatedAt(notification.createdAt)}
                        </time>
                        <span
                          className={
                            notification.read
                              ? "text-slate-400"
                              : "font-semibold text-brand-700"
                          }
                        >
                          {notification.read ? "Read" : "Unread"}
                        </span>
                      </div>
                    </div>
                    {!notification.read && (
                      <button
                        type="button"
                        onClick={() => markAsRead(notification._id)}
                        disabled={busyId !== ""}
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white hover:text-brand-700 disabled:opacity-50"
                        aria-label={`Mark ${notification.title} as read`}
                        title="Mark as read"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            ) : !panelError ? (
              <p className="px-4 py-10 text-center text-sm text-slate-500">
                You’re all caught up.
              </p>
            ) : null}
          </div>
        </section>
      )}
    </div>
  );
};

export default NotificationCenter;
