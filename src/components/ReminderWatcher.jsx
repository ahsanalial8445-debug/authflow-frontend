import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const CHECK_INTERVAL_MS = 30_000;

const ReminderWatcher = () => {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return undefined;

    let active = true;
    let checking = false;
    const checkReminders = async () => {
      if (checking) return;
      checking = true;
      try {
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
        const { data } = await api.get("/tasks/reminders/due", {
          params: { timeZone },
        });
        if (active && data.reminders.length) {
          const messages = data.reminders.map(
            ({ title, dueDate, dueTime, reminder }) =>
              `${title} — ${reminder} (due ${String(dueDate).slice(0, 10)} at ${dueTime})`
          );
          window.alert(`Task reminder${messages.length === 1 ? "" : "s"}:\n\n${messages.join("\n")}`);
        }
      } catch (error) {
        console.error("Unable to check task reminders:", error);
      } finally {
        checking = false;
      }
    };

    checkReminders();
    const intervalId = window.setInterval(checkReminders, CHECK_INTERVAL_MS);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [isAuthenticated]);

  return null;
};

export default ReminderWatcher;
