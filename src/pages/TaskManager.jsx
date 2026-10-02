import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  CircleAlert,
  ClipboardList,
  Clock3,
  ListTodo,
  Plus,
  Search,
  SquarePen,
  Trash2,
  X,
} from "lucide-react";
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

const fetchTasks = async () => {
  const { data } = await api.get("/tasks");
  return data.tasks;
};

const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [priorityFilter, setPriorityFilter] = useState("All priorities");
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  const loadTasks = async () => {
    try {
      const loadedTasks = await fetchTasks();
      setError("");
      setTasks(loadedTasks);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load your tasks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isActive = true;
    fetchTasks()
      .then((loadedTasks) => {
        if (isActive) setTasks(loadedTasks);
      })
      .catch((requestError) => {
        if (isActive) setError(requestError.response?.data?.message || "Unable to load your tasks.");
      })
      .finally(() => {
        if (isActive) setLoading(false);
      });
    return () => {
      isActive = false;
    };
  }, []);

  const counts = useMemo(
    () => ({
      total: tasks.length,
      pending: tasks.filter((task) => task.status === "Pending").length,
      inProgress: tasks.filter((task) => task.status === "In Progress").length,
      completed: tasks.filter((task) => task.status === "Completed").length,
    }),
    [tasks]
  );

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();
    return tasks.filter((task) => {
      const matchesSearch =
        !query ||
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query);
      const matchesStatus = statusFilter === "All statuses" || task.status === statusFilter;
      const matchesPriority = priorityFilter === "All priorities" || task.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, search, statusFilter, priorityFilter]);

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
      if (activeTaskId) {
        await api.put(`/tasks/${activeTaskId}`, payload);
        setFeedback("Task updated.");
      } else {
        await api.post("/tasks", payload);
        setFeedback("Task created.");
      }
      setFormOpen(false);
      setActiveTaskId(null);
      setForm(EMPTY_FORM);
      await loadTasks();
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
      await api.patch(`/tasks/${task._id}/status`, { status });
      setTasks((current) =>
        current.map((item) => (item._id === task._id ? { ...item, status } : item))
      );
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
      setTasks((current) => current.filter((item) => item._id !== task._id));
      setFeedback("Task deleted.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to delete this task.");
    }
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
    <main className="min-h-[calc(100vh-4rem)] bg-slate-50 text-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-8 animate-slideUp">
          <div>
            <div className="flex items-center gap-2 text-brand-700 text-sm font-semibold mb-3">
              <ListTodo className="w-4 h-4" />
              Personal workspace
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Task Manager</h1>
            <p className="text-slate-600 mt-2">Manage your tasks and stay organized.</p>
          </div>
          <Button onClick={beginCreate} className="w-full sm:w-auto px-5 py-3">
            <Plus className="w-4 h-4" /> Add task
          </Button>
        </div>

        <section aria-label="Task statistics" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-7 stagger">
          {[
            { label: "Total tasks", value: counts.total, icon: <ClipboardList className="w-5 h-5" />, color: "text-brand-700 bg-indigo-50" },
            { label: "Pending", value: counts.pending, icon: <Clock3 className="w-5 h-5" />, color: "text-amber-700 bg-amber-50" },
            { label: "In progress", value: counts.inProgress, icon: <CircleAlert className="w-5 h-5" />, color: "text-sky-700 bg-sky-50" },
            { label: "Completed", value: counts.completed, icon: <Check className="w-5 h-5" />, color: "text-emerald-700 bg-emerald-50" },
          ].map((stat) => (
            <div key={stat.label} className="glass glow-border rounded-xl p-4 sm:p-5">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${stat.color}`}>
                {stat.icon}
              </div>
              <p className="text-sm text-slate-600 mt-3">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
            </div>
          ))}
        </section>

        {feedback && (
          <div role="status" className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {feedback}
          </div>
        )}
        {error && !formOpen && (
          <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {formOpen && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/35 p-3 backdrop-blur-sm sm:p-6"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setFormOpen(false);
            }}
          >
            <form
              onSubmit={handleSubmit}
              role="dialog"
              aria-modal="true"
              aria-labelledby="task-form-title"
              className="w-full max-w-2xl max-h-[calc(100vh-1.5rem)] overflow-y-auto rounded-xl border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-900/15 animate-slideUp sm:p-7"
            >
              <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                  <h2 id="task-form-title" className="text-xl font-semibold text-slate-900">{activeTaskId ? "Edit task" : "Create a task"}</h2>
                  <p className="mt-1 text-sm text-slate-500">Add the details and keep your work on track.</p>
                </div>
                <button type="button" onClick={() => setFormOpen(false)} aria-label="Close task form" className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100">
                  <X className="w-5 h-5" />
                </button>
              </div>
              {error && <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}
              <div className="grid sm:grid-cols-2 gap-4">
                <label className="sm:col-span-2 text-sm font-medium text-slate-700">
                  Title <span className="text-red-600">*</span>
                  <input autoFocus maxLength={120} required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="What needs to get done?" className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-indigo-100" />
                </label>
                <label className="sm:col-span-2 text-sm font-medium text-slate-700">
                  Description
                  <textarea maxLength={2000} rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Add useful details" className="mt-2 w-full resize-y rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-indigo-100" />
                </label>
                <label className="text-sm font-medium text-slate-700">
                  Status
                  <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-indigo-100">
                    {["Pending", "In Progress", "Completed"].map((value) => <option key={value}>{value}</option>)}
                  </select>
                </label>
                <label className="text-sm font-medium text-slate-700">
                  Priority
                  <select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })} className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-indigo-100">
                    {["Low", "Medium", "High"].map((value) => <option key={value}>{value}</option>)}
                  </select>
                </label>
                <label className="text-sm font-medium text-slate-700">
                  Due date
                  <input type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-indigo-100" />
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
          <div className="grid md:grid-cols-[minmax(220px,1fr)_180px_180px] gap-3 mb-5">
            <label className="relative block">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search tasks" aria-label="Search tasks" className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-indigo-100" />
            </label>
            <select aria-label="Filter by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-700 outline-none focus:border-brand-500 focus:ring-4 focus:ring-indigo-100">
              {["All statuses", "Pending", "In Progress", "Completed"].map((value) => <option key={value}>{value}</option>)}
            </select>
            <select aria-label="Filter by priority" value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-700 outline-none focus:border-brand-500 focus:ring-4 focus:ring-indigo-100">
              {["All priorities", "Low", "Medium", "High"].map((value) => <option key={value}>{value}</option>)}
            </select>
          </div>

          {loading ? (
            <div className="glass rounded-xl px-6 py-16 text-center text-slate-500" role="status">Loading your tasks...</div>
          ) : error && tasks.length === 0 ? (
            <div className="glass rounded-xl px-6 py-14 text-center">
              <p className="text-sm text-slate-700">Your tasks could not be loaded.</p>
              <button onClick={() => { setLoading(true); setError(""); loadTasks(); }} className="mt-4 rounded-lg px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-indigo-50">Try again</button>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="glass rounded-xl px-6 py-14 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-brand-700"><ClipboardList className="w-6 h-6" /></div>
              <h2 className="text-lg font-semibold text-slate-900">{tasks.length ? "No matching tasks" : "No tasks yet"}</h2>
              <p className="mt-2 text-sm text-slate-600">{tasks.length ? "Try changing your search or filters." : "Create your first task to get started."}</p>
              {!tasks.length && <button onClick={beginCreate} className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"><Plus className="w-4 h-4" />Create task</button>}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTasks.map((task) => (
                <article key={task._id} className="glass glow-border rounded-xl p-4 sm:p-5 transition-transform duration-200 hover:-translate-y-0.5">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h2 className="text-base sm:text-lg font-semibold text-slate-900 break-words">{task.title}</h2>
                        <span className={`rounded-md border px-2 py-1 text-xs font-medium ${statusStyle[task.status]}`}>{task.status}</span>
                        <span className={`rounded-md px-2 py-1 text-xs font-medium ${priorityStyle[task.priority]}`}>{task.priority} priority</span>
                      </div>
                      {task.description && <p className="text-sm text-slate-600 whitespace-pre-wrap break-words">{task.description}</p>}
                      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5" />Due {formatDate(task.dueDate)}</span>
                        <span>Created {formatDate(task.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
                      <label className="sr-only" htmlFor={`status-${task._id}`}>Change status for {task.title}</label>
                      <select id={`status-${task._id}`} value={task.status} onChange={(event) => handleStatus(task, event.target.value)} className="min-h-9 max-w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-700 outline-none hover:bg-slate-50 focus:border-brand-500 focus:ring-4 focus:ring-indigo-100">
                        {["Pending", "In Progress", "Completed"].map((status) => <option key={status}>{status}</option>)}
                      </select>
                      <button onClick={() => beginEdit(task)} title="Edit task" aria-label={`Edit ${task.title}`} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                        <SquarePen className="w-4 h-4" /><span className="sm:hidden lg:inline">Edit</span>
                      </button>
                      <button onClick={() => handleDelete(task)} title="Delete task" aria-label={`Delete ${task.title}`} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 transition-colors">
                        <Trash2 className="w-4 h-4" /><span className="sm:hidden lg:inline">Delete</span>
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default TaskManager;