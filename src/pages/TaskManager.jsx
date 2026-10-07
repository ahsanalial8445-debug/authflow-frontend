import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  Check,
  CheckCircle2,
  Circle,
  CircleAlert,
  ClipboardList,
  Clock3,
  Eye,
  LayoutGrid,
  List,
  ListTodo,
  Plus,
  Search,
  SquarePen,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import api from "../api/axios";
import Button from "../components/Button";

const DEFAULT_TASK_LISTS = ["My Tasks", "Work", "University", "Personal", "Projects"];
const REMINDER_OPTIONS = [
  "No Reminder",
  "At Due Time",
  "10 minutes before",
  "30 minutes before",
  "1 hour before",
  "1 day before",
];
const RECURRENCE_OPTIONS = ["None", "Daily", "Weekly", "Monthly", "Custom"];
const EMPTY_FORM = {
  title: "",
  description: "",
  priority: "Medium",
  status: "Pending",
  dueDate: "",
  dueTime: "",
  reminder: "No Reminder",
  dueTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
  recurrence: "None",
  recurrenceDetails: "",
  taskList: "My Tasks",
  important: false,
  labels: "",
  subtasks: [],
};

const formatDate = (value) => {
  if (!value) return "No due date";
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getSubtaskProgress = (subtasks = []) => {
  const total = Array.isArray(subtasks) ? subtasks.length : 0;
  const completed = Array.isArray(subtasks)
    ? subtasks.filter((subtask) => subtask.completed).length
    : 0;
  return {
    total,
    completed,
    percentage: total ? Math.round((completed / total) * 100) : 0,
  };
};

const getTaskDueMeta = (task) => {
  if (!task?.dueDate) return null;

  let year;
  let month;
  let day;
  if (task.dueDate instanceof Date && !Number.isNaN(task.dueDate.getTime())) {
    year = task.dueDate.getFullYear();
    month = task.dueDate.getMonth() + 1;
    day = task.dueDate.getDate();
  } else if (typeof task.dueDate === "string") {
    const match = task.dueDate.match(/^(\d{4})-(\d{2})-(\d{2})(?:T.*)?$/);
    if (!match) return null;
    if (task.dueDate.includes("T") && Number.isNaN(new Date(task.dueDate).getTime())) return null;
    [, year, month, day] = match.map((part, index) => index ? Number(part) : part);
    const parsedDate = new Date(Date.UTC(year, month - 1, day));
    if (
      parsedDate.getUTCFullYear() !== year ||
      parsedDate.getUTCMonth() !== month - 1 ||
      parsedDate.getUTCDate() !== day
    ) return null;
  } else {
    return null;
  }

  const dueDay = Date.UTC(year, month - 1, day);
  const today = new Date();
  const todayDay = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const diffDays = Math.round((dueDay - todayDay) / 86400000);
  if (!Number.isSafeInteger(diffDays) || Math.abs(diffDays) > 36500) return null;

  if (diffDays < 0) return { label: "Overdue", tone: "overdue" };
  if (diffDays === 0) return { label: "Due today", tone: "today" };
  if (diffDays === 1) return { label: "Due tomorrow", tone: "tomorrow" };
  return { label: `Due in ${diffDays} days`, tone: "upcoming" };
};

const fetchTasks = async (params) => {
  const { data } = await api.get("/tasks", { params });
  return data;
};

const fetchTaskStats = async () => {
  const { data } = await api.get("/tasks/stats");
  return data.stats;
};

const TaskManager = () => {
  const location = useLocation();
  const consumedLocationState = useRef(null);
  const taskRequestId = useRef(0);
  const kanbanUpdates = useRef(new Set());
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [formOpen, setFormOpen] = useState(() => Boolean(location.state?.openCreate));
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [priorityFilter, setPriorityFilter] = useState("All priorities");
  const [importantFilter, setImportantFilter] = useState("All tasks");
  const [listFilter, setListFilter] = useState("All lists");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalTasks: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [taskStats, setTaskStats] = useState(null);
  const [viewMode, setViewMode] = useState("list");
  const [draggedTaskId, setDraggedTaskId] = useState("");
  const [detailsTask, setDetailsTask] = useState(null);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  const taskListOptions = useMemo(
    () =>
      Array.from(
        new Set([
          ...DEFAULT_TASK_LISTS,
          ...tasks.map((task) => task.taskList).filter(Boolean),
        ])
      ),
    [tasks]
  );

  const loadTasks = useCallback(async ({ silent = false } = {}) => {
    const requestId = ++taskRequestId.current;
    if (!silent) setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 10,
        sort: sortBy,
      };
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== "All statuses") params.status = statusFilter;
      if (priorityFilter !== "All priorities") params.priority = priorityFilter;
      if (importantFilter !== "All tasks") params.important = String(importantFilter === "Important");
      if (listFilter !== "All lists") params.taskList = listFilter;
      const data = await fetchTasks(params);
      if (requestId !== taskRequestId.current) return;
      setTasks(data.tasks);
      setPagination(data);
      setCurrentPage(data.currentPage);
      setError("");
    } catch (requestError) {
      if (requestId !== taskRequestId.current) return;
      setError(requestError.response?.data?.message || "Unable to load your tasks.");
    } finally {
      if (!silent && requestId === taskRequestId.current) setLoading(false);
    }
  }, [currentPage, importantFilter, listFilter, priorityFilter, search, setCurrentPage, sortBy, statusFilter]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    let active = true;
    fetchTaskStats()
      .then((stats) => {
        if (active) setTaskStats(stats);
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError.response?.data?.message || "Unable to load task statistics.");
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const loadStats = async () => {
    try {
      setTaskStats(await fetchTaskStats());
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load task statistics.");
    }
  };

  const counts = {
    total: taskStats?.totalTasks || 0,
    pending: taskStats?.pendingTasks || 0,
    inProgress: taskStats?.inProgressTasks || 0,
    completed: taskStats?.completedTasks || 0,
    important: taskStats?.importantTasks || 0,
    overdue: taskStats?.overdueTasks || 0,
  };

  const beginCreate = () => {
    setActiveTaskId(null);
    setForm(EMPTY_FORM);
    setError("");
    setFeedback("");
    setFormOpen(true);
  };

  const beginEdit = (task) => {
    setActiveTaskId(task._id);
    setForm({
      title: task.title,
      description: task.description || "",
      priority: task.priority || "Medium",
      status: task.status || "Pending",
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : "",
      dueTime: task.dueTime || "",
      dueTimeZone: task.dueTimeZone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
      reminder: task.reminder || "No Reminder",
      recurrence: task.recurrence || "None",
      recurrenceDetails: task.recurrenceDetails || "",
      taskList: task.taskList || "My Tasks",
      important: Boolean(task.important),
      labels: Array.isArray(task.labels) ? task.labels.join(", ") : "",
      subtasks: Array.isArray(task.subtasks)
        ? task.subtasks.map((subtask) => ({
            title: subtask.title || "",
            completed: Boolean(subtask.completed),
          }))
        : [],
    });
    setError("");
    setFeedback("");
    setFormOpen(true);
  };

  const addSubtaskRow = () => {
    setForm((current) => ({
      ...current,
      subtasks: [...current.subtasks, { title: "", completed: false }],
    }));
  };

  const updateSubtask = (index, field, value) => {
    setForm((current) => ({
      ...current,
      subtasks: current.subtasks.map((subtask, currentIndex) =>
        currentIndex === index ? { ...subtask, [field]: value } : subtask
      ),
    }));
  };

  const removeSubtask = (index) => {
    setForm((current) => ({
      ...current,
      subtasks: current.subtasks.filter((_, currentIndex) => currentIndex !== index),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.title.trim()) {
      setError("Enter a title for this task.");
      return;
    }

    const subtasks = form.subtasks
      .filter((subtask) => subtask.title && subtask.title.trim())
      .map((subtask) => ({ title: subtask.title.trim(), completed: Boolean(subtask.completed) }));

    if (form.subtasks.some((subtask) => !subtask.title || subtask.title.trim().length > 120)) {
      setError("Each subtask must have a valid title under 120 characters.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        status: form.status,
        priority: form.priority,
        dueDate: form.dueDate || null,
        dueTime: form.dueTime || "",
        dueTimeZone: form.dueTimeZone,
        reminder: form.reminder,
        recurrence: form.recurrence,
        recurrenceDetails: form.recurrenceDetails.trim(),
        taskList: form.taskList.trim() || "My Tasks",
        important: Boolean(form.important),
        labels: form.labels
          .split(",")
          .map((label) => label.trim())
          .filter(Boolean),
        subtasks,
      };

      const isEditing = Boolean(activeTaskId);
      if (isEditing) {
        await api.put(`/tasks/${activeTaskId}`, payload);
        setFeedback("Task updated.");
      } else {
        await api.post("/tasks", payload);
        setFeedback("Task created.");
      }

      setFormOpen(false);
      setActiveTaskId(null);
      setForm(EMPTY_FORM);
      if (!isEditing && currentPage !== 1) {
        setCurrentPage(1);
      } else {
        await loadTasks();
      }
      await loadStats();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to save this task.");
    } finally {
      setSaving(false);
    }
  };

  const handleStatus = async (task, status) => {
    setError("");
    setFeedback("");
    try {
      const { data } = await api.patch(`/tasks/${task._id}/status`, { status });
      setDetailsTask((current) => (current?._id === task._id ? data.task : current));
      await Promise.all([loadTasks(), loadStats()]);
      setFeedback(`Task moved to ${status.toLowerCase()}.`);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to update task status.");
    }
  };

  const handleKanbanDrop = async (event, status) => {
    event.preventDefault();
    const taskId = event.dataTransfer.getData("text/plain") || draggedTaskId;
    setDraggedTaskId("");
    const task = tasks.find((candidate) => candidate._id === taskId);
    if (!task || task.status === status || kanbanUpdates.current.has(taskId)) return;

    kanbanUpdates.current.add(taskId);
    setError("");
    setFeedback("");
    setTasks((current) =>
      current.map((candidate) =>
        candidate._id === taskId ? { ...candidate, status } : candidate
      )
    );
    setDetailsTask((current) =>
      current?._id === taskId ? { ...current, status } : current
    );

    try {
      await api.patch(`/tasks/${taskId}/status`, { status });
      await Promise.all([
        loadTasks({ silent: true }),
        loadStats(),
      ]);
      setFeedback(`Task moved to ${status.toLowerCase()}.`);
    } catch (requestError) {
      setTasks((current) =>
        current.map((candidate) =>
          candidate._id === taskId ? { ...candidate, status: task.status } : candidate
        )
      );
      setDetailsTask((current) =>
        current?._id === taskId ? { ...current, status: task.status } : current
      );
      setError(requestError.response?.data?.message || "Unable to update task status.");
    } finally {
      kanbanUpdates.current.delete(taskId);
    }
  };

  const handleDelete = async (task) => {
    if (!window.confirm(`Delete "${task.title}"? This cannot be undone.`)) return;
    setError("");
    setFeedback("");
    try {
      await api.delete(`/tasks/${task._id}`);
      setDetailsTask((current) => (current?._id === task._id ? null : current));
      await Promise.all([loadTasks(), loadStats()]);
      setFeedback("Task deleted.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to delete this task.");
    }
  };

  const openDetails = useCallback(async (task) => {
    try {
      const { data } = await api.get(`/tasks/${task._id}`);
      setDetailsTask(data.task);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load task details.");
    }
  }, [setDetailsTask]);

  useEffect(() => {
    const state = location.state;
    if (!state || consumedLocationState.current === state) return;
    if (state.openCreate) {
      setFormOpen(true);
      consumedLocationState.current = state;
    } else if (state.selectedTaskId && tasks.length) {
      const task = tasks.find(({ _id }) => _id === state.selectedTaskId);
      if (task) {
        let active = true;
        api
          .get(`/tasks/${task._id}`)
          .then(({ data }) => {
            if (active) {
              setDetailsTask(data.task);
              consumedLocationState.current = state;
            }
          })
          .catch((requestError) => {
            if (active) {
              setError(requestError.response?.data?.message || "Unable to load task details.");
              consumedLocationState.current = state;
            }
          });
        return () => {
          active = false;
        };
      }
      consumedLocationState.current = state;
    }
  }, [location.state, tasks]);

  const renderTaskCard = (task, compact = false) => {
    const progress = getSubtaskProgress(task.subtasks);
    const dueMeta = getTaskDueMeta(task);
    const dueToneClasses = {
      overdue: "text-red-600",
      today: "text-amber-600",
      tomorrow: "text-sky-600",
      upcoming: "text-slate-500",
    };
    const cardClasses = compact
      ? "kanban-task-card rounded-xl border p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
      : "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-5";

    return (
      <article
        key={task._id}
        className={cardClasses}
        draggable={compact}
        onDragStart={
          compact
            ? (event) => {
                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.setData("text/plain", task._id);
                setDraggedTaskId(task._id);
              }
            : undefined
        }
        onDragEnd={compact ? () => setDraggedTaskId("") : undefined}
      >
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => handleStatus(task, task.status === "Completed" ? "Pending" : "Completed")}
            className={`mt-0.5 shrink-0 rounded-full transition-colors ${task.status === "Completed" ? "text-brand-600" : compact ? "kanban-action" : "text-slate-300 hover:text-brand-500"}`}
            aria-label={task.status === "Completed" ? `Reopen ${task.title}` : `Mark ${task.title} completed`}
            title={task.status === "Completed" ? "Reopen task" : "Mark complete"}
          >
            {task.status === "Completed" ? <CheckCircle2 className="h-5 w-5" /> : <span className="block h-5 w-5 rounded-full border-2 border-current" />}
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => openDetails(task)} className={`${compact ? "kanban-task-title line-clamp-2" : "wrap-break-word text-slate-950 hover:text-brand-700"} text-left text-sm font-semibold`}>
                {task.title}
              </button>
              {task.important && <Star className="h-4 w-4 shrink-0 fill-amber-400 text-amber-400" />}
            </div>

            {task.description && <p className={`mt-1 line-clamp-2 text-sm leading-5 ${compact ? "kanban-task-description" : "text-slate-600"}`}>{task.description}</p>}

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusStyle[task.status]}`}>{task.status}</span>
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${priorityStyle[task.priority]}`}>{task.priority}</span>
              {task.taskList && <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${compact ? "kanban-task-list" : "border-slate-200 bg-slate-100 text-slate-600"}`}>{task.taskList}</span>}
            </div>

            {Array.isArray(task.labels) && task.labels.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {task.labels.map((label) => (
                  <span key={label} className={`rounded-full px-2 py-1 text-[10px] font-semibold ${compact ? "kanban-task-label" : "bg-brand-50 text-brand-700"}`}>
                    {label}
                  </span>
                ))}
              </div>
            )}

            <div className={`mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] ${compact ? "kanban-task-meta" : "text-slate-500"}`}>
              {dueMeta && (
                <span className={`inline-flex items-center gap-1 ${dueToneClasses[dueMeta.tone] || "text-slate-500"}`}>
                  <CalendarDays className="h-3.5 w-3.5" />{dueMeta.label}
                </span>
              )}
              {dueMeta && task.dueTime && <span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" />{task.dueTime}</span>}
              {progress.total > 0 && (
                <span className="inline-flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {progress.completed}/{progress.total}
                </span>
              )}
              {task.reminder && task.reminder !== "No Reminder" && <span>{task.reminder}</span>}
            </div>
          </div>
          <div className={`flex shrink-0 ${compact ? "gap-0.5" : "gap-1"}`}>
            <button type="button" onClick={() => openDetails(task)} title="View task details" aria-label={`View ${task.title}`} className={`rounded-lg transition-colors ${compact ? "kanban-action p-1.5" : "p-2 text-slate-500 hover:bg-slate-100 hover:text-brand-700"}`}><Eye className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} /></button>
            <button type="button" onClick={() => beginEdit(task)} title="Edit task" aria-label={`Edit ${task.title}`} className={`rounded-lg transition-colors ${compact ? "kanban-action p-1.5" : "p-2 text-slate-500 hover:bg-slate-100 hover:text-brand-700"}`}><SquarePen className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} /></button>
            {!compact && <button type="button" onClick={() => handleDelete(task)} title="Delete task" aria-label={`Delete ${task.title}`} className="rounded-lg p-2 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>}
          </div>
        </div>
      </article>
    );
  };

  const statusStyle = {
    Pending: "text-amber-800 bg-amber-50 border-amber-200",
    "In Progress": "text-sky-800 bg-sky-50 border-sky-200",
    Completed: "text-emerald-800 bg-emerald-50 border-emerald-200",
  };
  const priorityStyle = {
    Low: "text-slate-700 bg-slate-100",
    Medium: "text-amber-800 bg-amber-50",
    High: "text-red-700 bg-red-50",
  };

  return (
    <main className="app-page min-h-[calc(100vh-4rem)] bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
        <div className="mb-8 flex flex-col gap-5 animate-slideUp sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-brand-700">
              <ListTodo className="h-4 w-4" />
              Personal workspace
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Task Manager</h1>
            <p className="mt-2 text-slate-600">Manage your tasks and stay organized.</p>
          </div>
          <Button onClick={beginCreate} className="w-full rounded-xl px-5 py-3 sm:w-auto">
            <Plus className="h-4 w-4" /> Add task
          </Button>
        </div>

        <section aria-label="Task statistics" className="mb-7 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-6">
          {[
            { label: "Total tasks", value: counts.total, icon: <ClipboardList className="w-5 h-5" />, color: "text-brand-700 bg-brand-50" },
            { label: "Pending", value: counts.pending, icon: <Clock3 className="w-5 h-5" />, color: "text-amber-700 bg-amber-50" },
            { label: "In progress", value: counts.inProgress, icon: <CircleAlert className="w-5 h-5" />, color: "text-sky-700 bg-sky-50" },
            { label: "Completed", value: counts.completed, icon: <Check className="w-5 h-5" />, color: "text-emerald-700 bg-emerald-50" },
            { label: "Important", value: counts.important, icon: <Star className="w-5 h-5 fill-current" />, color: "text-yellow-700 bg-yellow-50" },
            { label: "Overdue", value: counts.overdue, icon: <CalendarDays className="w-5 h-5" />, color: "text-red-700 bg-red-50" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.color}`}>
                {stat.icon}
              </div>
              <p className="mt-4 text-sm text-slate-600">{stat.label}</p>
              <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">{stat.value}</p>
            </div>
          ))}
        </section>

        {feedback && (
          <div role="status" className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 shadow-sm">
            {feedback}
          </div>
        )}
        {error && !formOpen && (
          <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 shadow-sm">
            {error}
          </div>
        )}

        {formOpen && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/45 p-3 backdrop-blur-sm sm:p-6"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setFormOpen(false);
            }}
          >
            <form
              onSubmit={handleSubmit}
              role="dialog"
              aria-modal="true"
              aria-labelledby="task-form-title"
              className="w-full max-w-3xl max-h-[calc(100vh-1.5rem)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-950/20 sm:p-8"
            >
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <h2 id="task-form-title" className="text-xl font-semibold tracking-tight text-slate-950">{activeTaskId ? "Edit task" : "Create a task"}</h2>
                  <p className="mt-1 text-sm text-slate-500">Add the details and keep your work on track.</p>
                </div>
                <button type="button" onClick={() => setFormOpen(false)} aria-label="Close task form" className="rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                  <X className="w-5 h-5" />
                </button>
              </div>
              {error && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="sm:col-span-2 text-sm font-medium text-slate-700">
                  Title <span className="text-red-600">*</span>
                  <input autoFocus maxLength={120} required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="What needs to get done?" className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100" />
                </label>

                <label className="sm:col-span-2 text-sm font-medium text-slate-700">
                  Description
                  <textarea maxLength={2000} rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Add useful details" className="mt-2 w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100" />
                </label>

                <label className="text-sm font-medium text-slate-700">
                  Status
                  <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100">
                    {['Pending', 'In Progress', 'Completed'].map((value) => <option key={value}>{value}</option>)}
                  </select>
                </label>

                <label className="text-sm font-medium text-slate-700">
                  Priority
                  <select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })} className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100">
                    {['Low', 'Medium', 'High'].map((value) => <option key={value}>{value}</option>)}
                  </select>
                </label>

                <label className="text-sm font-medium text-slate-700">
                  Due date
                  <input type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100" />
                </label>

                <label className="text-sm font-medium text-slate-700">
                  Due time
                  <input type="time" value={form.dueTime} onChange={(event) => setForm({ ...form, dueTime: event.target.value })} className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100" />
                </label>

                <label className="text-sm font-medium text-slate-700">
                  Reminder
                  <select value={form.reminder} onChange={(event) => setForm({ ...form, reminder: event.target.value })} className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100">
                    {REMINDER_OPTIONS.map((value) => <option key={value}>{value}</option>)}
                  </select>
                </label>

                <label className="text-sm font-medium text-slate-700">
                  Recurrence
                  <select value={form.recurrence} onChange={(event) => setForm({ ...form, recurrence: event.target.value })} className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100">
                    {RECURRENCE_OPTIONS.map((value) => <option key={value}>{value}</option>)}
                  </select>
                </label>

                {form.recurrence === "Custom" && (
                  <label className="sm:col-span-2 text-sm font-medium text-slate-700">
                    Recurrence details
                    <input value={form.recurrenceDetails} onChange={(event) => setForm({ ...form, recurrenceDetails: event.target.value })} placeholder="Every Monday" className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100" />
                  </label>
                )}

                <label className="text-sm font-medium text-slate-700">
                  Task list
                  <input list="task-list-options" value={form.taskList} onChange={(event) => setForm({ ...form, taskList: event.target.value })} className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100" />
                  <datalist id="task-list-options">
                    {taskListOptions.map((value) => <option key={value} value={value} />)}
                  </datalist>
                </label>

                <label className="text-sm font-medium text-slate-700">
                  Labels
                  <input value={form.labels} onChange={(event) => setForm({ ...form, labels: event.target.value })} placeholder="Work, Study, Personal" className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100" />
                </label>

                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 sm:col-span-2">
                  <input type="checkbox" checked={form.important} onChange={(event) => setForm({ ...form, important: event.target.checked })} className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                  Mark as important
                </label>

                <div className="sm:col-span-2">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-700">Subtasks</p>
                    <button type="button" onClick={addSubtaskRow} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                      <Plus className="h-3.5 w-3.5" /> Add subtask
                    </button>
                  </div>
                  <div className="space-y-2">
                    {form.subtasks.length === 0 ? (
                      <p className="rounded-xl border border-dashed border-slate-200 px-3 py-4 text-sm text-slate-500">No subtasks yet.</p>
                    ) : (
                      form.subtasks.map((subtask, index) => (
                        <div key={`${subtask.title}-${index}`} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2">
                          <input type="checkbox" checked={Boolean(subtask.completed)} onChange={(event) => updateSubtask(index, "completed", event.target.checked)} className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                          <input value={subtask.title} onChange={(event) => updateSubtask(index, "title", event.target.value)} placeholder="Subtask title" className="min-h-10 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100" />
                          <button type="button" onClick={() => removeSubtask(index)} className="rounded-lg p-2 text-slate-500 hover:bg-white hover:text-red-600" aria-label="Remove subtask">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button type="button" variant="ghost" className="w-full sm:w-auto px-5 py-3" onClick={() => setFormOpen(false)}>Cancel</Button>
                <Button type="submit" loading={saving} loadingText="Saving..." className="w-full sm:w-auto px-5 py-3">{activeTaskId ? "Save task" : "Create task"}</Button>
              </div>
            </form>
          </div>
        )}

        <section aria-label="Your tasks">
          <div className="mb-5 grid gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4 lg:grid-cols-[minmax(220px,1fr)_170px_170px_170px_150px]">
            <label className="relative block">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={(event) => { setSearch(event.target.value); setCurrentPage(1); }} placeholder="Search tasks..." aria-label="Search tasks" className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100" />
            </label>
            <select aria-label="Filter by status" value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setCurrentPage(1); }} className="min-h-11 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100">
              {['All statuses', 'Pending', 'In Progress', 'Completed'].map((value) => <option key={value}>{value}</option>)}
            </select>
            <select aria-label="Filter by priority" value={priorityFilter} onChange={(event) => { setPriorityFilter(event.target.value); setCurrentPage(1); }} className="min-h-11 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100">
              {['All priorities', 'Low', 'Medium', 'High'].map((value) => <option key={value}>{value}</option>)}
            </select>
            <select aria-label="Filter by importance" value={importantFilter} onChange={(event) => { setImportantFilter(event.target.value); setCurrentPage(1); }} className="min-h-11 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100">
              {['All tasks', 'Important', 'Non-important'].map((value) => <option key={value}>{value}</option>)}
            </select>
            <select aria-label="Filter by list" value={listFilter} onChange={(event) => { setListFilter(event.target.value); setCurrentPage(1); }} className="min-h-11 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100">
              {['All lists', ...taskListOptions].map((value) => <option key={value}>{value}</option>)}
            </select>
            <div className="flex items-center justify-between gap-2 lg:col-span-5">
              <span className="text-xs font-medium text-slate-500">{pagination.totalTasks} {pagination.totalTasks === 1 ? "task" : "tasks"}</span>
              <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1" aria-label="Task view">
                <button type="button" onClick={() => setViewMode("list")} aria-pressed={viewMode === "list"} className={`inline-flex min-h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold ${viewMode === "list" ? "bg-white text-brand-700 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>
                  <List className="h-3.5 w-3.5" /> List
                </button>
                <button type="button" onClick={() => setViewMode("board")} aria-pressed={viewMode === "board"} className={`inline-flex min-h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold ${viewMode === "board" ? "bg-white text-brand-700 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>
                  <LayoutGrid className="h-3.5 w-3.5" /> Board
                </button>
              </div>
            </div>
            <label className="relative block lg:col-span-5">
              <span className="sr-only">Sort tasks</span>
              <select aria-label="Sort tasks" value={sortBy} onChange={(event) => { setSortBy(event.target.value); setCurrentPage(1); }} className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100">
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="dueDate">Due Date</option>
                <option value="priority">Priority</option>
                <option value="important">Important</option>
              </select>
            </label>
          </div>

          {loading ? (
            <div className="space-y-3" role="status" aria-label="Loading tasks">
              {[0, 1, 2].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-white p-5 animate-pulse"><div className="h-4 w-2/5 rounded bg-slate-200" /><div className="mt-3 h-3 w-4/5 rounded bg-slate-100" /><div className="mt-4 h-3 w-1/3 rounded bg-slate-100" /></div>)}
            </div>
          ) : error && tasks.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
              <p className="text-sm text-slate-700">{error}</p>
              <button onClick={loadTasks} className="mt-4 rounded-xl px-4 py-2 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">Try again</button>
            </div>
          ) : tasks.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-brand-100 bg-brand-50 text-brand-700"><ClipboardList className="h-6 w-6" /></div>
              <h2 className="text-lg font-semibold tracking-tight text-slate-950">{counts.total ? "No matching tasks" : "No tasks yet"}</h2>
              <p className="mt-2 text-sm text-slate-600">{counts.total ? "Try changing your search or filters." : "Create your first task to get started."}</p>
              {!counts.total && <button onClick={beginCreate} className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"><Plus className="h-4 w-4" />Create task</button>}
            </div>
          ) : viewMode === "list" ? (
            <div className="space-y-3">{tasks.map((task) => renderTaskCard(task))}</div>
          ) : (
            <div className="kanban-board pb-3">
              <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  {
                    status: "Pending",
                    Icon: Circle,
                    titleTone: "text-amber-700",
                    countStyle: "border border-amber-200 bg-amber-50 text-amber-700",
                    emptyTitle: "No pending tasks",
                  },
                  {
                    status: "In Progress",
                    Icon: Clock3,
                    titleTone: "text-sky-700",
                    countStyle: "border border-sky-200 bg-sky-50 text-sky-700",
                    emptyTitle: "No tasks in progress",
                  },
                  {
                    status: "Completed",
                    Icon: CheckCircle2,
                    titleTone: "text-emerald-700",
                    countStyle: "border border-emerald-200 bg-emerald-50 text-emerald-700",
                    emptyTitle: "No completed tasks",
                  },
                ].map(({ status, Icon, titleTone, countStyle, emptyTitle }) => {
                  const columnTasks = tasks.filter((task) => task.status === status);
                  return (
                    <section
                      key={status}
                      aria-label={`${status} tasks`}
                      data-status={status}
                      onDragOver={(event) => {
                        event.preventDefault();
                        event.dataTransfer.dropEffect = "move";
                      }}
                      onDrop={(event) => handleKanbanDrop(event, status)}
                      className="kanban-column min-h-80 rounded-xl border p-4 shadow-sm"
                    >
                      <header className="kanban-column-header mb-4 flex items-center justify-between rounded-lg border px-3 py-2.5">
                        <h2 className={`flex items-center gap-2 text-sm font-semibold ${titleTone}`}>
                          <Icon className="h-4 w-4" />
                          {status}
                        </h2>
                        <span className={`min-w-7 rounded-full px-2 py-1 text-center text-xs font-semibold ${countStyle}`}>{columnTasks.length}</span>
                      </header>
                      <div className="space-y-3">
                        {columnTasks.length ? columnTasks.map((task) => renderTaskCard(task, true)) : (
                          <div className="kanban-empty flex items-start gap-3 rounded-lg border border-dashed px-3 py-4">
                            <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${titleTone}`} />
                            <div>
                              <p className="kanban-empty-title text-xs font-medium">{emptyTitle}</p>
                              <p className="kanban-empty-copy mt-1 text-[11px]">Tasks you add will appear here.</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </section>
                  );
                })}
              </div>
            </div>
          )}

          {pagination.totalPages > 1 && (
            <nav aria-label="Task pagination" className="mt-5 flex items-center justify-between gap-3">
              <button type="button" disabled={!pagination.hasPreviousPage} onClick={() => { setCurrentPage((page) => page - 1); }} className="min-h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50">Previous</button>
              <span className="text-sm text-slate-600">Page {pagination.currentPage} of {pagination.totalPages}</span>
              <button type="button" disabled={!pagination.hasNextPage} onClick={() => { setCurrentPage((page) => page + 1); }} className="min-h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50">Next</button>
            </nav>
          )}
        </section>

        {detailsTask && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/45 p-3 backdrop-blur-sm sm:p-6" onMouseDown={(event) => {
            if (event.target === event.currentTarget) setDetailsTask(null);
          }}>
            <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-950/20">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-700">Task details</p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-950">{detailsTask.title}</h2>
                </div>
                <button type="button" onClick={() => setDetailsTask(null)} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"><X className="h-5 w-5" /></button>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyle[detailsTask.status]}`}>{detailsTask.status}</span>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${priorityStyle[detailsTask.priority]}`}>{detailsTask.priority}</span>
                {detailsTask.important && <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">Important</span>}
                {detailsTask.taskList && <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{detailsTask.taskList}</span>}
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Due</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{formatDate(detailsTask.dueDate)}</p>
                  {detailsTask.dueTime && <p className="text-sm text-slate-600">{detailsTask.dueTime}</p>}
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Reminder</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{detailsTask.reminder || "No Reminder"}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Recurrence</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{detailsTask.recurrence || "None"}</p>
                  {detailsTask.recurrenceDetails && <p className="text-sm text-slate-600">{detailsTask.recurrenceDetails}</p>}
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Progress</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{getSubtaskProgress(detailsTask.subtasks).completed} / {getSubtaskProgress(detailsTask.subtasks).total} completed</p>
                </div>
              </div>

              {detailsTask.description && (
                <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Description</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{detailsTask.description}</p>
                </div>
              )}

              {Array.isArray(detailsTask.labels) && detailsTask.labels.length > 0 && (
                <div className="mt-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Labels</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {detailsTask.labels.map((label) => (
                      <span key={label} className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">{label}</span>
                    ))}
                  </div>
                </div>
              )}

              {Array.isArray(detailsTask.subtasks) && detailsTask.subtasks.length > 0 && (
                <div className="mt-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Subtasks</p>
                  <div className="mt-2 space-y-2">
                    {detailsTask.subtasks.map((subtask, index) => (
                      <div key={`${subtask.title}-${index}`} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                        {subtask.completed ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Circle className="h-4 w-4 text-slate-400" />}
                        <span className={subtask.completed ? "line-through text-slate-400" : ""}>{subtask.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default TaskManager;
