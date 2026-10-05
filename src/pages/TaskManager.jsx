import { useCallback, useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  Check,
  CircleAlert,
  ClipboardList,
  Clock3,
  Eye,
  LayoutGrid,
  ListTodo,
  Plus,
  Search,
  SquarePen,
  Trash2,
  X,
  List,
  CheckCircle2,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import api from "../api/axios";
import Button from "../components/Button";

const EMPTY_FORM = {
  title: "",
  description: "",
  priority: "Medium",
  status: "Pending",
  dueDate: "",
};

const formatDate = (value) => {
  if (!value) return "No due date";
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
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
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [formOpen, setFormOpen] = useState(() => Boolean(location.state?.openCreate));
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [priorityFilter, setPriorityFilter] = useState("All priorities");
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
  const [detailsTask, setDetailsTask] = useState(null);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  const loadTasks = useCallback(async () => {
    const requestId = ++taskRequestId.current;
    try {
      const params = {
        page: currentPage,
        limit: 10,
        sort: sortBy,
      };
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== "All statuses") params.status = statusFilter;
      if (priorityFilter !== "All priorities") params.priority = priorityFilter;
      const data = await fetchTasks(params);
      if (requestId !== taskRequestId.current) return;
      setError("");
      setTasks(data.tasks);
      setPagination(data);
      setCurrentPage(data.currentPage);
    } catch (requestError) {
      if (requestId === taskRequestId.current) {
        setError(requestError.response?.data?.message || "Unable to load your tasks.");
      }
    } finally {
      if (requestId === taskRequestId.current) setLoading(false);
    }
  }, [currentPage, priorityFilter, search, sortBy, statusFilter]);

  useEffect(() => {
    const requestId = ++taskRequestId.current;
    let isActive = true;
    const params = {
      page: currentPage,
      limit: 10,
      sort: sortBy,
    };
    if (search.trim()) params.search = search.trim();
    if (statusFilter !== "All statuses") params.status = statusFilter;
    if (priorityFilter !== "All priorities") params.priority = priorityFilter;

    fetchTasks(params)
      .then((data) => {
        if (!isActive || requestId !== taskRequestId.current) return;
        setError("");
        setTasks(data.tasks);
        setPagination(data);
        setCurrentPage(data.currentPage);
      })
      .catch((requestError) => {
        if (isActive && requestId === taskRequestId.current) {
          setError(requestError.response?.data?.message || "Unable to load your tasks.");
        }
      })
      .finally(() => {
        if (isActive && requestId === taskRequestId.current) setLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [currentPage, priorityFilter, search, sortBy, statusFilter]);

  useEffect(() => {
    let isActive = true;
    fetchTaskStats()
      .then((stats) => {
        if (isActive) setTaskStats(stats);
      })
      .catch((requestError) => {
        if (isActive) {
          setError(requestError.response?.data?.message || "Unable to load task statistics.");
        }
      });
    return () => {
      isActive = false;
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
  };
  const filteredTasks = tasks;
  const sortedTasks = tasks;

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
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : "",
    });
    setError("");
    setFeedback("");
    setFormOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.title.trim()) {
      setError("Enter a title for this task.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const payload = { ...form, title: form.title.trim(), dueDate: form.dueDate || null };
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
      setDetailsTask((current) =>
        current?._id === task._id ? data.task : current
      );
      await Promise.all([loadTasks(), loadStats()]);
      setFeedback(`Task moved to ${status.toLowerCase()}.`);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to update task status.");
    }
  };

  const handleDelete = async (task) => {
    if (!window.confirm(`Delete "${task.title}"? This cannot be undone.`)) return;
    setError("");
    setFeedback("");
    try {
      await api.delete(`/tasks/${task._id}`);
      setDetailsTask((current) => current?._id === task._id ? null : current);
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
  }, []);

  useEffect(() => {
    const state = location.state;
    if (!state || consumedLocationState.current === state) return;
    if (state.openCreate) {
      consumedLocationState.current = state;
    } else if (state.selectedTaskId && tasks.length) {
      const task = tasks.find(({ _id }) => _id === state.selectedTaskId);
      if (task) {
        let isActive = true;
        api
          .get(`/tasks/${task._id}`)
          .then(({ data }) => {
            if (isActive) {
              consumedLocationState.current = state;
              setDetailsTask(data.task);
            }
          })
          .catch((requestError) => {
            if (isActive) {
              consumedLocationState.current = state;
              setError(requestError.response?.data?.message || "Unable to load task details.");
            }
          });
        return () => {
          isActive = false;
        };
      }
      consumedLocationState.current = state;
    }
  }, [location.state, tasks]);

  const renderTaskCard = (task, compact = false) => (
    <article key={task._id} className={`glass glow-border rounded-2xl p-4 transition-all duration-200 hover:shadow-md ${compact ? "" : "sm:p-5"}`}>
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => handleStatus(task, task.status === "Completed" ? "Pending" : "Completed")}
          className={`mt-0.5 shrink-0 rounded-full ${task.status === "Completed" ? "text-brand-600" : "text-slate-300 hover:text-brand-500"}`}
          aria-label={task.status === "Completed" ? `Reopen ${task.title}` : `Mark ${task.title} completed`}
          title={task.status === "Completed" ? "Reopen task" : "Mark complete"}
        >
          {task.status === "Completed" ? <CheckCircle2 className="h-5 w-5" /> : <span className="block h-5 w-5 rounded-full border-2 border-current" />}
        </button>
        <div className="min-w-0 flex-1">
          <button type="button" onClick={() => openDetails(task)} className="break-words text-left text-sm font-semibold text-slate-950 hover:text-brand-700">
            {task.title}
          </button>
          {task.description && <p className={`mt-1 text-sm leading-5 text-slate-600 ${compact ? "line-clamp-2" : "line-clamp-2"}`}>{task.description}</p>}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyle[task.status]}`}>{task.status}</span>
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${priorityStyle[task.priority]}`}>{task.priority}</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />Due {formatDate(task.dueDate)}</span>
            {!compact && <span>Created {formatDate(task.createdAt)}</span>}
          </div>
        </div>
        <div className="flex shrink-0 gap-1">
          <button type="button" onClick={() => openDetails(task)} title="View task details" aria-label={`View ${task.title}`} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-brand-700"><Eye className="h-4 w-4" /></button>
          <button type="button" onClick={() => beginEdit(task)} title="Edit task" aria-label={`Edit ${task.title}`} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-brand-700"><SquarePen className="h-4 w-4" /></button>
          {!compact && <button type="button" onClick={() => handleDelete(task)} title="Delete task" aria-label={`Delete ${task.title}`} className="rounded-lg p-2 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>}
        </div>
      </div>
    </article>
  );

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

        <section aria-label="Task statistics" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-7 stagger">
          {[
            { label: "Total tasks", value: counts.total, icon: <ClipboardList className="w-5 h-5" />, color: "text-brand-700 bg-brand-50" },
            { label: "Pending", value: counts.pending, icon: <Clock3 className="w-5 h-5" />, color: "text-amber-700 bg-amber-50" },
            { label: "In progress", value: counts.inProgress, icon: <CircleAlert className="w-5 h-5" />, color: "text-sky-700 bg-sky-50" },
            { label: "Completed", value: counts.completed, icon: <Check className="w-5 h-5" />, color: "text-emerald-700 bg-emerald-50" },
          ].map((stat) => (
            <div key={stat.label} className="glass glow-border rounded-2xl p-4 sm:p-5">
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
              className="task-modal w-full max-w-2xl max-h-[calc(100vh-1.5rem)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-950/20 sm:p-8"
            >
              <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                  <h2 id="task-form-title" className="text-xl font-semibold tracking-tight text-slate-950">{activeTaskId ? "Edit task" : "Create a task"}</h2>
                  <p className="mt-1 text-sm text-slate-500">Add the details and keep your work on track.</p>
                </div>
                <button type="button" onClick={() => setFormOpen(false)} aria-label="Close task form" className="rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                  <X className="w-5 h-5" />
                </button>
              </div>
              {error && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}
              <div className="grid sm:grid-cols-2 gap-4">
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
                    {["Pending", "In Progress", "Completed"].map((value) => <option key={value}>{value}</option>)}
                  </select>
                </label>
                <label className="text-sm font-medium text-slate-700">
                  Priority
                  <select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })} className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100">
                    {["Low", "Medium", "High"].map((value) => <option key={value}>{value}</option>)}
                  </select>
                </label>
                <label className="text-sm font-medium text-slate-700">
                  Due date
                  <input type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100" />
                </label>
              </div>
              <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                <Button type="button" variant="ghost" className="w-full sm:w-auto px-5 py-3" onClick={() => setFormOpen(false)}>Cancel</Button>
                <Button type="submit" loading={saving} loadingText="Saving..." className="w-full sm:w-auto px-5 py-3">{activeTaskId ? "Save task" : "Create task"}</Button>
              </div>
            </form>
          </div>
        )}

        <section aria-label="Your tasks">
          <div className="mb-5 grid gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4 lg:grid-cols-[minmax(220px,1fr)_170px_170px_150px]">
            <label className="relative block">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={(event) => { setLoading(true); setSearch(event.target.value); setCurrentPage(1); }} placeholder="Search tasks..." aria-label="Search tasks" className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100" />
            </label>
            <select aria-label="Filter by status" value={statusFilter} onChange={(event) => { setLoading(true); setStatusFilter(event.target.value); setCurrentPage(1); }} className="min-h-11 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100">
              {["All statuses", "Pending", "In Progress", "Completed"].map((value) => <option key={value}>{value}</option>)}
            </select>
            <select aria-label="Filter by priority" value={priorityFilter} onChange={(event) => { setLoading(true); setPriorityFilter(event.target.value); setCurrentPage(1); }} className="min-h-11 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100">
              {["All priorities", "Low", "Medium", "High"].map((value) => <option key={value}>{value}</option>)}
            </select>
            <select aria-label="Sort tasks" value={sortBy} onChange={(event) => { setLoading(true); setSortBy(event.target.value); setCurrentPage(1); }} className="min-h-11 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100">
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
            </select>
            <div className="flex items-center justify-between gap-2 lg:col-span-4">
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
          </div>

          {loading ? (
            <div className="space-y-3" role="status" aria-label="Loading tasks">
              {[0, 1, 2].map((item) => <div key={item} className="glass animate-pulse rounded-2xl p-5"><div className="h-4 w-2/5 rounded bg-slate-200" /><div className="mt-3 h-3 w-4/5 rounded bg-slate-100" /><div className="mt-4 h-3 w-1/3 rounded bg-slate-100" /></div>)}
            </div>
          ) : error && tasks.length === 0 ? (
            <div className="glass rounded-2xl px-6 py-14 text-center">
              <p className="text-sm text-slate-700">{error}</p>
              <button onClick={() => { setLoading(true); setError(""); loadTasks(); }} className="mt-4 rounded-xl px-4 py-2 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">Try again</button>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="glass rounded-2xl px-6 py-16 text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-brand-100 bg-brand-50 text-brand-700"><ClipboardList className="h-6 w-6" /></div>
              <h2 className="text-lg font-semibold tracking-tight text-slate-950">{counts.total ? "No matching tasks" : "No tasks yet"}</h2>
              <p className="mt-2 text-sm text-slate-600">{counts.total ? "Try changing your search or filters." : "Create your first task to get started."}</p>
              {!counts.total && <button onClick={beginCreate} className="auth-submit mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"><Plus className="h-4 w-4" />Create task</button>}
            </div>
          ) : (
            viewMode === "list" ? (
              <div className="space-y-3">{sortedTasks.map((task) => renderTaskCard(task))}</div>
            ) : (
              <div className="-mx-4 overflow-x-auto px-4 pb-3 sm:mx-0 sm:px-0">
                <div className="grid min-w-[850px] grid-cols-3 gap-4">
                  {["Pending", "In Progress", "Completed"].map((status) => {
                    const columnTasks = sortedTasks.filter((task) => task.status === status);
                    return (
                      <section key={status} aria-label={`${status} tasks`} className="rounded-2xl bg-slate-100/70 p-3">
                        <header className="mb-3 flex items-center justify-between px-1">
                          <h2 className="text-sm font-semibold text-slate-800">{status}</h2>
                          <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-slate-500">{columnTasks.length}</span>
                        </header>
                        <div className="space-y-3">
                          {columnTasks.length
                            ? columnTasks.map((task) => renderTaskCard(task, true))
                            : <p className="rounded-xl border border-dashed border-slate-300 px-3 py-6 text-center text-xs text-slate-500">No tasks in this status</p>}
                        </div>
                      </section>
                    );
                  })}
                </div>
              </div>
            )
          )}
          {pagination.totalPages > 1 && (
            <nav aria-label="Task pagination" className="mt-5 flex items-center justify-between gap-3">
              <button
                type="button"
                disabled={!pagination.hasPreviousPage}
                onClick={() => { setLoading(true); setCurrentPage((page) => page - 1); }}
                className="min-h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-slate-600">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                type="button"
                disabled={!pagination.hasNextPage}
                onClick={() => { setLoading(true); setCurrentPage((page) => page + 1); }}
                className="min-h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </nav>
          )}
        </section>

        {detailsTask && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/45 p-3 backdrop-blur-sm sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) setDetailsTask(null); }}>
            <section role="dialog" aria-modal="true" aria-labelledby="task-details-title" className="task-modal w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-950/20 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Task details</p>
                  <h2 id="task-details-title" className="mt-2 break-words text-xl font-bold text-slate-950">{detailsTask.title}</h2>
                </div>
                <button type="button" onClick={() => setDetailsTask(null)} aria-label="Close task details" className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button>
              </div>
              <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">{detailsTask.description || "No description provided."}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyle[detailsTask.status]}`}>{detailsTask.status}</span>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${priorityStyle[detailsTask.priority]}`}>{detailsTask.priority} priority</span>
              </div>
              <dl className="mt-5 grid gap-3 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2">
                <div><dt className="text-xs text-slate-500">Due date</dt><dd className="mt-1 font-medium text-slate-800">{formatDate(detailsTask.dueDate)}</dd></div>
                <div><dt className="text-xs text-slate-500">Created</dt><dd className="mt-1 font-medium text-slate-800">{formatDate(detailsTask.createdAt)}</dd></div>
                <div className="sm:col-span-2"><dt className="text-xs text-slate-500">Last updated</dt><dd className="mt-1 font-medium text-slate-800">{formatDate(detailsTask.updatedAt)}</dd></div>
              </dl>
              <div className="mt-6 flex flex-wrap justify-end gap-2">
                <button type="button" onClick={() => handleDelete(detailsTask)} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-red-200 px-3.5 text-sm font-semibold text-red-700 hover:bg-red-50"><Trash2 className="h-4 w-4" /> Delete</button>
                <button type="button" onClick={() => { beginEdit(detailsTask); setDetailsTask(null); }} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 px-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"><SquarePen className="h-4 w-4" /> Edit</button>
                {detailsTask.status !== "Completed" && <button type="button" onClick={() => handleStatus(detailsTask, "Completed")} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-brand-600 px-3.5 text-sm font-semibold text-white hover:bg-brand-700"><CheckCircle2 className="h-4 w-4" /> Mark completed</button>}
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
};

export default TaskManager;