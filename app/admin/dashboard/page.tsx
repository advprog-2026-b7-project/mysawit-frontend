"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/layout/AdminLayout";
import {
  ArrowUpRightIcon,
  ClipboardCheckIcon,
  ClipboardListIcon,
  LeafIcon,
  UsersIcon,
} from "@/components/layout/AdminIcons";
import {
  getAssignmentCount,
  getPlantationCount,
  getUsers,
} from "@/features/admin/api";
import { useRoleDashboard } from "@/features/admin/useRoleDashboard";

type StatCard = {
  label: string;
  value: number;
  Icon: typeof UsersIcon;
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useRoleDashboard("ADMIN");
  const [stats, setStats] = useState({ users: 0, plantations: 0, assignments: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function loadDashboard() {
      try {
        const [usersPage, plantationCount, assignmentCount] = await Promise.all([
          getUsers({ page: 0, size: 1 }).catch(() => null),
          getPlantationCount().catch(() => 0),
          getAssignmentCount().catch(() => 0),
        ]);
        setStats({
          users: usersPage?.totalElements ?? usersPage?.content.length ?? 0,
          plantations: plantationCount,
          assignments: assignmentCount,
        });
      } finally {
        setLoading(false);
      }
    }

    void loadDashboard();
  }, [user]);

  const statCards: StatCard[] = [
    { label: "TOTAL USERS", value: stats.users, Icon: UsersIcon },
    { label: "PLANTATIONS", value: stats.plantations, Icon: LeafIcon },
    { label: "ASSIGNMENTS", value: stats.assignments, Icon: ClipboardListIcon },
  ];

  const featureCards = [
    {
      title: "User Management",
      description:
        "Oversee access controls, manage administrative roles, and monitor user activity across the console.",
      href: "/admin/users",
      Icon: UsersIcon,
    },
    {
      title: "Plantations",
      description:
        "Track soil health, cultivation schedules, and yield forecasts for all active regional sites.",
      href: "/admin/plantations",
      Icon: LeafIcon,
    },
    {
      title: "Assignments",
      description:
        "Deploy resources, assign task queues, and monitor real-time completion status for logistics teams.",
      href: "/admin/assignments",
      Icon: ClipboardCheckIcon,
    },
  ];

  return (
    <AdminLayout activePage="Dashboard" currentUser={user}>
      <div className="flex flex-col gap-12">
        <header>
          <p className="text-[18px] font-normal text-[var(--color-text-body)]">
            Welcome back, {user?.nama || user?.username || "Admin"} 👋
          </p>
          <h1 className="admin-heading mt-2 text-[50px] font-bold tracking-[-1.25px] text-[var(--color-text-heading)]">
            Dashboard
          </h1>
        </header>

        <section className="grid grid-cols-3 gap-6">
          {statCards.map(({ label, value, Icon }) => (
            <article
              key={label}
              className="flex items-center justify-between rounded-[12px] border border-[var(--color-border)] bg-white p-6"
            >
              <div>
                <p className="text-[12px] font-normal uppercase tracking-[1.2px] text-[var(--color-text-body)]">
                  {label}
                </p>
                <p className="admin-heading mt-2 text-[32px] font-bold text-[var(--color-text-heading)]">
                  {loading || authLoading ? "..." : value}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-icon-bg)] text-[var(--color-icon-brown)]">
                <Icon width={24} height={24} />
              </div>
            </article>
          ))}
        </section>

        <section>
          <h2 className="admin-heading mb-5 text-[20px] font-bold text-[var(--color-text-heading)]">
            Manage
          </h2>
          <div className="grid grid-cols-3 gap-6">
            {featureCards.map(({ title, description, href, Icon }) => (
              <button
                key={title}
                type="button"
                onClick={() => router.push(href)}
                className="flex min-h-[215px] flex-col rounded-[12px] border border-[var(--color-border)] bg-white px-7 py-6 text-left transition hover:shadow-sm"
              >
                <div className="flex justify-end text-[var(--color-border)]">
                  <ArrowUpRightIcon width={13} height={13} />
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-feature-icon-bg)] text-[var(--color-text-heading)]">
                  <Icon width={26} height={26} />
                </div>
                <h3 className="admin-heading pt-[16.7px] text-[16px] font-normal text-[var(--color-text-heading)]">
                  {title}
                </h3>
                <p className="mt-2 text-[14px] leading-[23px] text-[var(--color-text-body)]">
                  {description}
                </p>
              </button>
            ))}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
