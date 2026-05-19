"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/layout/AdminLayout";
import {
  HardHatIcon,
  SearchIcon,
  TruckIcon,
  UserCheckIcon,
  UsersIcon,
  ChevronDownIcon,
} from "@/components/layout/AdminIcons";
import {
  deleteUser,
  getMe,
  getUsers,
  type AdminUser,
  type PageResponse,
  type Role,
  type UserFilters,
} from "@/features/admin/api";

const emptyPage: PageResponse<AdminUser> = {
  content: [],
  page: 0,
  size: 20,
  totalElements: 0,
  totalPages: 0,
};

const roleStyles: Record<Role, string> = {
  BURUH: "bg-[#857069] text-[#FFFBFF]",
  MANDOR: "bg-[#FFA088] text-[#793423]",
  SUPIR: "border border-[#85736C] bg-[#D7C2B9] text-[#1B1C1B]",
  ADMIN: "bg-[#A26647] text-[#FFFBFF]",
};

function RoleBadge({ role }: { role: Role }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-[13px] font-semibold uppercase tracking-[0.65px] ${roleStyles[role]}`}
    >
      {role}
    </span>
  );
}

function StatCard({
  label,
  value,
  Icon,
}: {
  label: string;
  value: number;
  Icon: typeof UsersIcon;
}) {
  return (
    <div className="flex items-center gap-6 rounded-[12px] border border-[var(--color-border-table)] bg-white p-6 shadow-sm">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-icon-bg)] text-[var(--color-icon-brown)]">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-[14px] font-bold text-[var(--color-text-muted)]">{label}</p>
        <p className="mt-1 text-[48px] font-black leading-none tracking-[-0.96px] text-[var(--color-text-heading)]">
          {value}
        </p>
      </div>
    </div>
  );
}

function SearchField({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative h-9 w-[300px]">
      <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-brand)] opacity-50" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-9 w-full rounded-[10px] border border-[var(--color-search-border)] bg-[var(--color-search-bg)] py-2 pl-9 pr-3 text-[17px] text-[var(--color-text-dark)] outline-none placeholder:text-[var(--color-search-placeholder)]"
      />
    </div>
  );
}

function RoleSelect({ value, onChange }: { value: "" | Role; onChange: (value: "" | Role) => void }) {
  return (
    <div className="relative h-9 w-[133px]">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as "" | Role)}
        className="h-9 w-full appearance-none rounded-[10px] border border-[var(--color-search-border)] bg-[var(--color-search-bg)] px-3 pr-8 text-[15px] font-semibold text-[var(--color-brand)] outline-none"
      >
        <option value="">All</option>
        <option value="BURUH">BURUH</option>
        <option value="MANDOR">MANDOR</option>
        <option value="SUPIR">SUPIR</option>
        <option value="ADMIN">ADMIN</option>
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-brand)]" />
    </div>
  );
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [usersPage, setUsersPage] = useState<PageResponse<AdminUser>>(emptyPage);
  const [stats, setStats] = useState({ total: 0, mandor: 0, buruh: 0, supir: 0 });
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"" | Role>("");
  const [debouncedFilters, setDebouncedFilters] = useState<UserFilters>({ page: 0, size: 20 });
  const [page, setPage] = useState(0);
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    async function checkAccess() {
      try {
        const me = await getMe();
        if (me.role !== "ADMIN") {
          router.push("/dashboard");
          return;
        }
        setAuthorized(true);
      } catch {
        localStorage.removeItem("token");
        router.push("/login");
      }
    }

    void checkAccess();
  }, [router]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setPage(0);
      setDebouncedFilters({
        name: name.trim() || undefined,
        email: email.trim() || undefined,
        role: role || undefined,
        page: 0,
        size: 20,
      });
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [name, email, role]);

  useEffect(() => {
    if (!authorized) return;

    async function loadUsers() {
      setLoading(true);
      setError(null);
      try {
        const data = await getUsers({ ...debouncedFilters, page, size: 20 });
        setUsersPage(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load users";
        setError(message);
        setUsersPage(emptyPage);
      } finally {
        setLoading(false);
      }
    }

    void loadUsers();
  }, [authorized, debouncedFilters, page]);

  useEffect(() => {
    if (!authorized) return;

    async function loadStats() {
      try {
        const [total, mandor, buruh, supir] = await Promise.all([
          getUsers({ page: 0, size: 1 }),
          getUsers({ role: "MANDOR", page: 0, size: 1 }),
          getUsers({ role: "BURUH", page: 0, size: 1 }),
          getUsers({ role: "SUPIR", page: 0, size: 1 }),
        ]);
        setStats({
          total: total.totalElements,
          mandor: mandor.totalElements,
          buruh: buruh.totalElements,
          supir: supir.totalElements,
        });
      } catch {
        setStats({ total: 0, mandor: 0, buruh: 0, supir: 0 });
      }
    }

    void loadStats();
  }, [authorized]);

  const hasFilters = useMemo(() => Boolean(name || email || role), [name, email, role]);

  const refreshUsers = async () => {
    const [data, total, mandor, buruh, supir] = await Promise.all([
      getUsers({ ...debouncedFilters, page, size: 20 }),
      getUsers({ page: 0, size: 1 }),
      getUsers({ role: "MANDOR", page: 0, size: 1 }),
      getUsers({ role: "BURUH", page: 0, size: 1 }),
      getUsers({ role: "SUPIR", page: 0, size: 1 }),
    ]);
    setUsersPage(data);
    setStats({
      total: total.totalElements,
      mandor: mandor.totalElements,
      buruh: buruh.totalElements,
      supir: supir.totalElements,
    });
  };

  const handleDelete = async (user: AdminUser) => {
    const displayName = user.nama || user.username;
    const confirmed = window.confirm(
      `Are you sure you want to delete ${displayName}? This action cannot be undone.`,
    );
    if (!confirmed) return;

    try {
      setError(null);
      await deleteUser(user.id);
      await refreshUsers();
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 409) {
        setError("Cannot delete this user because they have active assignments.");
        return;
      }
      setError(err instanceof Error ? err.message : "Failed to delete user");
    }
  };

  if (!authorized) {
    return (
      <AdminLayout activePage="Users">
        <div className="text-[16px] text-[var(--color-text-body)]">Checking access...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activePage="Users">
      <div className="flex flex-col gap-8">
        <h1 className="admin-heading text-[50px] font-bold tracking-[-1.25px] text-[var(--color-text-heading)]">
          Manage Users
        </h1>

        <section className="grid grid-cols-4 gap-6">
          <StatCard label="Total Users" value={stats.total} Icon={UsersIcon} />
          <StatCard label="Mandor" value={stats.mandor} Icon={UserCheckIcon} />
          <StatCard label="Buruh" value={stats.buruh} Icon={HardHatIcon} />
          <StatCard label="Supir" value={stats.supir} Icon={TruckIcon} />
        </section>

        <section className="flex flex-wrap items-center gap-4">
          <SearchField placeholder="Search by Name" value={name} onChange={setName} />
          <SearchField placeholder="Search by Email" value={email} onChange={setEmail} />
          <RoleSelect value={role} onChange={setRole} />
          <button
            type="button"
            disabled={!hasFilters}
            onClick={() => {
              setName("");
              setEmail("");
              setRole("");
            }}
            className="h-9 w-[133px] rounded-[8px] border border-[#D9C1BC] bg-white text-[15px] font-semibold text-[rgba(91,32,18,0.5)] disabled:opacity-60"
          >
            Reset Filters
          </button>
        </section>

        {error && (
          <div className="rounded-[10px] border border-[#E7B8B8] bg-[#FFF4F4] px-4 py-3 text-[14px] font-semibold text-[#BA1A1A]">
            {error}
          </div>
        )}

        <section className="overflow-hidden rounded-[12px] border border-[var(--color-border-table)] bg-white shadow-sm">
          <table className="w-full border-collapse">
            <thead className="bg-[var(--color-header-bg)]">
              <tr className="border-b border-[var(--color-border-table)]">
                <th className="px-6 py-4 text-left text-[14px] font-bold text-[var(--color-text-muted)]">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-[14px] font-bold text-[var(--color-text-muted)]">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-[14px] font-bold text-[var(--color-text-muted)]">
                  Role
                </th>
                <th className="px-6 py-4 text-right text-[14px] font-bold text-[var(--color-text-muted)]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-[16px] text-[var(--color-text-muted)]">
                    Loading users...
                  </td>
                </tr>
              )}

              {!loading && usersPage.content.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-[16px] text-[var(--color-text-muted)]">
                    No users found
                  </td>
                </tr>
              )}

              {!loading &&
                usersPage.content.map((user) => (
                  <tr key={user.id} className="border-t border-[var(--color-border-table)]">
                    <td className="px-6 py-[19px] text-[16px] font-bold text-[var(--color-text-table)]">
                      {user.nama || user.username}
                    </td>
                    <td className="px-6 py-[19px] text-[16px] font-normal text-[var(--color-text-muted)]">
                      {user.email}
                    </td>
                    <td className="px-6 py-[19px]">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-6 py-[19px]">
                      <div className="flex justify-end gap-[19px]">
                        <button
                          type="button"
                          onClick={() => router.push(`/admin/users/${user.id}`)}
                          className="text-[14px] font-bold text-[var(--color-icon-brown)]"
                        >
                          View Detail
                        </button>
                        {user.role !== "ADMIN" && (
                          <button
                            type="button"
                            onClick={() => void handleDelete(user)}
                            className="text-[14px] font-bold text-[#BA1A1A]"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </section>

        {usersPage.totalPages > 1 && (
          <div className="flex items-center justify-end gap-3 text-[14px] font-semibold text-[var(--color-text-muted)]">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage((current) => Math.max(0, current - 1))}
              className="rounded-[8px] border border-[var(--color-border)] bg-white px-4 py-2 disabled:opacity-50"
            >
              Prev
            </button>
            <span>
              Page {page + 1} of {usersPage.totalPages}
            </span>
            <button
              type="button"
              disabled={page + 1 >= usersPage.totalPages}
              onClick={() => setPage((current) => current + 1)}
              className="rounded-[8px] border border-[var(--color-border)] bg-white px-4 py-2 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
