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

const Dashboard = () => {
  const navigate = useNavigate();

  const [taskStats, setTaskStats] = useState(null);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [taskError, setTaskError] = useState("");

  useEffect(() => {
    let isActive = true;

    api
      .get("/tasks")
      .then(({ data }) => {
        if (!isActive) return;

        const tasks = Array.isArray(data.tasks) ? data.tasks : [];

        setTaskStats({
          total: tasks.length,
          pending: tasks.filter(
            (task) => task.status === "Pending"
          ).length,
          inProgress: tasks.filter(
            (task) => task.status === "In Progress"
          ).length,
          completed: tasks.filter(
            (task) => task.status === "Completed"
          ).length,
        });
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
      value: taskStats?.total,
      icon: <ListTodo className="h-5 w-5" />,
      iconStyle: "bg-brand-50 text-brand-600",
    },
    {
      label: "Pending",
      value: taskStats?.pending,
      icon: <Circle className="h-5 w-5" />,
      iconStyle: "bg-amber-50 text-amber-600",
    },
    {
      label: "In Progress",
      value: taskStats?.inProgress,
      icon: <Clock3 className="h-5 w-5" />,
      iconStyle: "bg-sky-50 text-sky-600",
    },
    {
      label: "Completed",
      value: taskStats?.completed,
      icon: <CheckCircle2 className="h-5 w-5" />,
      iconStyle: "bg-emerald-50 text-emerald-600",
    },
  ];

  const total = taskStats?.total || 0;
  const completed = taskStats?.completed || 0;

  const completionPercentage =
    total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <main className="min-h-[calc(100vh-4.5rem)] bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">

        {/* Header */}
        <section className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-1 text-sm font-semibold text-brand-600">
              Task Manager
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Dashboard
            </h1>

            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              Manage your tasks, track your progress, and stay productive.
            </p>
          </div>

          <button
            onClick={() => navigate("/tasks")}
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
                    : taskStats?.pending ?? 0}
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
                    : taskStats?.inProgress ?? 0}
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
                    : taskStats?.completed ?? 0}
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

        {/* Bottom CTA */}
        <section className="mt-6 overflow-hidden rounded-2xl bg-slate-900 p-6 shadow-sm sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-brand-300">
                Stay Productive
              </p>

              <h2 className="mt-1 text-xl font-bold text-white">
                Keep your tasks organized and get things done.
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Your task progress is just one click away.
              </p>
            </div>

            <button
              onClick={() => navigate("/tasks")}
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition-all hover:bg-slate-100"
            >
              View Tasks
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>

      </div>
    </main>
  );
};

export default Dashboard;