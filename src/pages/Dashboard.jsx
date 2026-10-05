import { useEffect, useState } from "react";
import {
  ListTodo,
  CheckCircle2,
  Circle,
  Clock3,
  Plus,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [taskStats, setTaskStats] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [taskError, setTaskError] = useState("");

  useEffect(() => {
    let isActive = true;

    Promise.all([
      api.get("/tasks/stats"),
      api.get("/tasks", { params: { limit: 4, sort: "newest" } }),
    ])
      .then(([{ data: statsData }, { data: tasksData }]) => {
        if (!isActive) return;

        const tasks = Array.isArray(tasksData.tasks) ? tasksData.tasks : [];
        setTasks(tasks);
        setTaskStats(statsData.stats);
      })
      .catch(() => {
        if (isActive) {
          setTaskError("Unable to load task statistics.");
        }
      })
      .finally(() => {
        if (isActive) {
          setTasksLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  const taskCards = [
    {
      label: "Total Tasks",
      value: taskStats?.totalTasks,
      icon: <ListTodo className="h-5 w-5" />,
      iconStyle: "bg-brand-50 text-brand-600",
    },
    {
      label: "Pending",
      value: taskStats?.pendingTasks,
      icon: <Circle className="h-5 w-5" />,
      iconStyle: "bg-amber-50 text-amber-600",
    },
    {
      label: "In Progress",
      value: taskStats?.inProgressTasks,
      icon: <Clock3 className="h-5 w-5" />,
      iconStyle: "bg-sky-50 text-sky-600",
    },
    {
      label: "Completed",
      value: taskStats?.completedTasks,
      icon: <CheckCircle2 className="h-5 w-5" />,
      iconStyle: "bg-emerald-50 text-emerald-600",
    },
  ];

  const completionPercentage = taskStats?.completionPercentage || 0;
  const greeting = "Welcome back";
  const recentTasks = tasks.slice(0, 4);

  const formatDate = (value) =>
    value
      ? new Date(value).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "No due date";

  return (
    <main className="min-h-[calc(100vh-4.5rem)] bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">

        {/* Header */}
        <section className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              {greeting}, {user?.name || "there"} 👋
            </h1>

            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              Here's what's happening with your tasks.
            </p>
          </div>

          <button
            onClick={() => navigate("/tasks", { state: { openCreate: true } })}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-brand-700 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            <Plus className="h-4 w-4" />
            Create Task
          </button>
        </section>

        {/* Statistics */}
        <section
          aria-label="Task statistics"
          className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4"
        >
          {taskCards.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.iconStyle}`}
                >
                  {stat.icon}
                </div>
              </div>

              <p className="mt-5 text-sm font-medium text-slate-500">
                {stat.label}
              </p>

              <p
                className="mt-1 text-3xl font-bold tracking-tight text-slate-950"
                aria-live="polite"
              >
                {tasksLoading
                  ? "..."
                  : taskStats
                  ? stat.value
                  : "—"}
              </p>
            </div>
          ))}
        </section>

        {/* Error */}
        {taskError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {taskError}
          </div>
        )}

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">

          {/* Task Overview */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  Task Overview
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Track your overall task progress.
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>

            {/* Progress */}
            <div className="mb-7">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">
                  Completion
                </span>

                <span className="text-sm font-bold text-slate-900">
                  {completionPercentage}%
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-brand-600 transition-all duration-500"
                  style={{
                    width: `${completionPercentage}%`,
                  }}
                />
              </div>
            </div>

            {/* Status Rows */}
            <div className="space-y-4">

              {/* Pending */}
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                    <Circle className="h-4 w-4" />
                  </div>

                  <span className="text-sm font-semibold text-slate-700">
                    Pending
                  </span>
                </div>

                <span className="text-sm font-bold text-slate-900">
                  {tasksLoading
                    ? "..."
                    : taskStats?.pendingTasks ?? 0}
                </span>
              </div>

              {/* In Progress */}
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
                    <Clock3 className="h-4 w-4" />
                  </div>

                  <span className="text-sm font-semibold text-slate-700">
                    In Progress
                  </span>
                </div>

                <span className="text-sm font-bold text-slate-900">
                  {tasksLoading
                    ? "..."
                    : taskStats?.inProgressTasks ?? 0}
                </span>
              </div>

              {/* Completed */}
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>

                  <span className="text-sm font-semibold text-slate-700">
                    Completed
                  </span>
                </div>

                <span className="text-sm font-bold text-slate-900">
                  {tasksLoading
                    ? "..."
                    : taskStats?.completedTasks ?? 0}
                </span>
              </div>

            </div>
          </section>

          {/* Task Manager Card */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <ListTodo className="h-6 w-6" />
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-950">
              Manage Your Tasks
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Create new tasks, update their status, and keep track of
              your daily work from one place.
            </p>

            <button
              onClick={() => navigate("/tasks")}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-all hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
            >
              Open Task Manager
              <ArrowRight className="h-4 w-4" />
            </button>
          </section>
        </div>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-950">Recent Tasks</h2>
              <p className="mt-1 text-sm text-slate-500">Your latest work, from your task list.</p>
            </div>
            <button onClick={() => navigate("/tasks")} className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800">
              View All Tasks <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          {tasksLoading ? (
            <div role="status" className="space-y-3" aria-label="Loading recent tasks">
              {[0, 1, 2].map((item) => <div key={item} className="h-16 animate-pulse rounded-xl bg-slate-100" />)}
            </div>
          ) : taskError ? (
            <p role="alert" className="rounded-xl bg-red-50 px-4 py-6 text-center text-sm text-red-700">{taskError}</p>
          ) : recentTasks.length ? (
            <div className="divide-y divide-slate-100">
              {recentTasks.map((task) => (
                <div key={task._id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{task.title}</p>
                    <p className="mt-1 text-xs text-slate-500">Due {formatDate(task.dueDate)} · {task.priority} priority</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    task.status === "Completed"
                      ? "bg-emerald-50 text-emerald-700"
                      : task.status === "In Progress"
                        ? "bg-sky-50 text-sky-700"
                        : "bg-amber-50 text-amber-700"
                  }`}>{task.status}</span>
                  <button
                    onClick={() => navigate("/tasks", { state: { selectedTaskId: task._id } })}
                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-brand-700"
                    aria-label={`View ${task.title}`}
                    title="View task"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl bg-slate-50 px-4 py-8 text-center">
              <p className="font-semibold text-slate-800">No tasks yet</p>
              <p className="mt-1 text-sm text-slate-500">Create your first task to get started.</p>
              <button onClick={() => navigate("/tasks", { state: { openCreate: true } })} className="mt-4 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
                Create Task
              </button>
            </div>
          )}
        </section>

      </div>
    </main>
  );
};

export default Dashboard;