"use client";

import type { ReactNode } from "react";
import type { SVGProps } from "react";
import { useRouter } from "next/navigation";
import { ChevronRightIcon } from "@/components/layout/AdminIcons";

type IconComponent = (props: SVGProps<SVGSVGElement>) => ReactNode;

const badgeStyles: Record<string, string> = {
  PENDING: "bg-[rgba(138,75,47,0.1)] text-[#8A4B2F]",
  APPROVED: "bg-[#FFA088] text-[#793423]",
  ACTIVE: "bg-[#A26647] text-white",
  COMPLETED: "bg-[#EDE8E4] text-[#5B2012]",
  REJECTED: "bg-[#FFF1EC] text-[#7C2516]",
  PROCESSING: "bg-[#F9EBE6] text-[#53433D]",
  ASSIGNED: "bg-[#FFF7EE] text-[#8A4B2F]",
  "IN TRANSIT": "bg-[#EDE8E4] text-[#5B2012]",
};

export function DashboardHeader({ greeting }: { greeting: string }) {
  return (
    <header>
      <p className="text-[18px] font-normal text-[var(--color-text-body)]">{greeting}</p>
      <h1 className="admin-heading mt-2 text-[50px] font-bold tracking-[-1.25px] text-[var(--color-text-heading)]">
        Dashboard
      </h1>
    </header>
  );
}

export function StatusBadge({ label }: { label: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-[12px] font-bold uppercase ${
        badgeStyles[label] ?? "bg-[#F9EBE6] text-[var(--color-text-body)]"
      }`}
    >
      {label}
    </span>
  );
}

export function DashboardStatCard({
  title,
  subtitle,
  value,
  badge,
  Icon,
  tone = "beige",
}: {
  title: string;
  subtitle?: string;
  value: number | string;
  badge?: string;
  Icon: IconComponent;
  tone?: "beige" | "green" | "pink";
}) {
  const toneClass = {
    beige: "bg-[#FBF4EA] text-[#DB8D45]",
    green: "bg-[#FFF1EC] text-[#8A4B2F]",
    pink: "bg-[#F6E9E6] text-[#7C2516]",
  }[tone];

  return (
    <article className={`rounded-[12px] border border-[var(--color-border)] p-7 ${toneClass}`}>
      <div className="flex items-start justify-between gap-4">
        <Icon width={30} height={30} />
        {badge && <StatusBadge label={badge} />}
      </div>
      <p className="admin-heading mt-7 text-[48px] font-bold leading-none">{value}</p>
      <p className="mt-2 text-[18px] font-semibold text-[var(--color-text-body)]">
        {title}
      </p>
      {subtitle && (
        <p className="mt-1 text-[16px] font-normal text-[var(--color-text-body)]">
          {subtitle}
        </p>
      )}
    </article>
  );
}

export function DashboardFeatureCard({
  title,
  subtitle,
  badge,
  href,
  Icon,
  iconTone = "neutral",
  children,
}: {
  title: string;
  subtitle: string;
  badge?: string;
  href: string;
  Icon: IconComponent;
  iconTone?: "neutral" | "green";
  children?: ReactNode;
}) {
  const router = useRouter();
  const iconBg = iconTone === "green" ? "bg-[#FFF1EC] text-[#8A4B2F]" : "bg-[#F3E8E5] text-[#9A5134]";

  return (
    <button
      type="button"
      onClick={() => router.push(href)}
      className="flex min-h-[150px] items-center gap-7 rounded-[12px] border border-[var(--color-border)] bg-white px-8 py-7 text-left transition hover:shadow-sm"
    >
      <div className={`flex h-[76px] w-[76px] shrink-0 items-center justify-center rounded-full ${iconBg}`}>
        <Icon width={31} height={31} />
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="admin-heading text-[24px] font-semibold text-[var(--color-text-dark)]">
          {title}
        </h2>
        <p className="mt-1 text-[18px] text-[var(--color-text-body)]">{subtitle}</p>
        {children}
      </div>
      <div className="flex items-center gap-5">
        {badge && <span className="rounded-full bg-[#A35A3A] px-4 py-2 text-[13px] font-bold text-white">{badge}</span>}
        <ChevronRightIcon width={34} height={34} className="text-[var(--color-border)]" />
      </div>
    </button>
  );
}

export function DashboardTable({
  title,
  actionLabel,
  actionHref,
  columns,
  rows,
  emptyLabel = "No data found.",
}: {
  title: string;
  actionLabel?: string;
  actionHref?: string;
  columns: string[];
  rows: Array<Array<ReactNode>>;
  emptyLabel?: string;
}) {
  const router = useRouter();

  return (
    <section className="overflow-hidden rounded-[12px] border border-[var(--color-border)] bg-white">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-8 py-7">
        <h2 className="admin-heading text-[24px] font-semibold text-[#6D2615]">{title}</h2>
        {actionLabel && (
          <button
            type="button"
            onClick={() => actionHref && router.push(actionHref)}
            className="text-[16px] font-bold text-[#8A4B2F]"
          >
            {actionLabel}
          </button>
        )}
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column}
                className="px-8 py-5 text-left text-[12px] font-bold uppercase tracking-[1.6px] text-[#A78074]"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr className="border-t border-[#F0E4E0]">
              <td
                colSpan={columns.length}
                className="px-8 py-10 text-center text-[16px] font-semibold text-[var(--color-text-body)]"
              >
                {emptyLabel}
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr key={index} className="border-t border-[#F0E4E0]">
                {row.map((cell, cellIndex) => (
                  <td
                    key={`${index}-${cellIndex}`}
                    className="px-8 py-5 text-[16px] font-semibold text-[var(--color-text-body)]"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </section>
  );
}
