"use client";

import { useEffect, useMemo, useState } from "react";
import { harvestClient } from "@/features/harvest/api";
import type {
  ApproveHarvestResponse,
  HarvestHistoryFilters,
  HarvestPageResponse,
  HarvestResponse,
  HarvestStatus,
  RejectHarvestResponse,
} from "@/features/harvest/types";

type SubmitFormState = {
  weightKg: string;
  notes: string;
};

type HistoryMode = "all" | "buruh";

type HistoryFilterState = {
  startDate: string;
  endDate: string;
  status: "" | HarvestStatus;
  buruhName: string;
  buruhId: string;
  page: number;
  size: number;
};

type Feedback = {
  type: "success" | "error";
  message: string;
};

type ReviewResult = ApproveHarvestResponse | RejectHarvestResponse;

const initialSubmitForm: SubmitFormState = {
  weightKg: "",
  notes: "",
};

const initialFilters: HistoryFilterState = {
  startDate: "",
  endDate: "",
  status: "",
  buruhName: "",
  buruhId: "",
  page: 0,
  size: 20,
};

const maxPhotoCount = 10;
const maxPhotoSizeBytes = 5 * 1024 * 1024;
const allowedPhotoTypes = ["image/jpeg", "image/png", "image/webp"];

const inputClass =
  "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-600";

const labelClass = "text-sm font-semibold text-gray-800";

const primaryButtonClass =
  "inline-flex min-h-10 items-center justify-center rounded-md bg-green-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50";

const secondaryButtonClass =
  "inline-flex min-h-10 items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50";

const dangerButtonClass =
  "inline-flex min-h-10 items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50";

function parseWeight(value: string) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error("Harvest weight must be greater than 0");
  }

  return parsed;
}

function formatDate(value?: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function formatDateTime(value?: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatWeight(value?: number | null) {
  return Number(value ?? 0).toLocaleString("id-ID", {
    maximumFractionDigits: 2,
  });
}

function statusClass(status: HarvestStatus) {
  if (status === "APPROVED") {
    return "border-green-200 bg-green-100 text-green-800";
  }

  if (status === "REJECTED") {
    return "border-red-200 bg-red-100 text-red-800";
  }

  return "border-amber-200 bg-amber-100 text-amber-800";
}

function validatePhotos(photos: File[]) {
  if (photos.length === 0) {
    throw new Error("At least one harvest photo is required");
  }

  if (photos.length > maxPhotoCount) {
    throw new Error("A maximum of 10 photos is allowed");
  }

  for (const photo of photos) {
    if (photo.size > maxPhotoSizeBytes) {
      throw new Error(`${photo.name} exceeds 5 MB`);
    }

    if (photo.type && !allowedPhotoTypes.includes(photo.type)) {
      throw new Error(`${photo.name} must be JPG, PNG, or WEBP`);
    }
  }
}

function buildHistoryFilters(filters: HistoryFilterState): HarvestHistoryFilters {
  return {
    startDate: filters.startDate,
    endDate: filters.endDate,
    status: filters.status,
    buruhName: filters.buruhName.trim(),
    page: filters.page,
    size: filters.size,
  };
}

function getReviewTime(review: ReviewResult) {
  return "approvedAt" in review ? review.approvedAt : review.rejectedAt;
}

function FeedbackBanner({ feedback }: { feedback: Feedback | null }) {
  if (!feedback) {
    return null;
  }

  return (
    <div
      className={`rounded-md border px-4 py-3 text-sm ${
        feedback.type === "success"
          ? "border-green-200 bg-green-50 text-green-800"
          : "border-red-200 bg-red-50 text-red-800"
      }`}
    >
      {feedback.message}
    </div>
  );
}

function MetricCard({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "green" | "amber" | "red";
}) {
  const toneClass = {
    neutral: "border-gray-200 bg-white text-gray-900",
    green: "border-green-200 bg-green-50 text-green-950",
    amber: "border-amber-200 bg-amber-50 text-amber-950",
    red: "border-red-200 bg-red-50 text-red-950",
  }[tone];

  return (
    <div className={`rounded-lg border px-4 py-3 ${toneClass}`}>
      <p className="text-xs font-semibold uppercase text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

function PhotoList({ photos }: { photos: File[] }) {
  if (photos.length === 0) {
    return null;
  }

  return (
    <ul className="space-y-2">
      {photos.map((photo) => (
        <li
          key={`${photo.name}-${photo.size}-${photo.lastModified}`}
          className="flex items-center justify-between gap-3 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
        >
          <span className="min-w-0 truncate font-medium text-gray-800">
            {photo.name}
          </span>
          <span className="shrink-0 text-xs text-gray-500">
            {(photo.size / 1024 / 1024).toFixed(2)} MB
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function HarvestForm() {
  const [submitForm, setSubmitForm] =
    useState<SubmitFormState>(initialSubmitForm);
  const [photos, setPhotos] = useState<File[]>([]);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitFeedback, setSubmitFeedback] = useState<Feedback | null>(null);
  const [submittedHarvest, setSubmittedHarvest] =
    useState<HarvestResponse | null>(null);

  const [historyMode, setHistoryMode] = useState<HistoryMode>("all");
  const [filters, setFilters] = useState<HistoryFilterState>(initialFilters);
  const [history, setHistory] = useState<HarvestPageResponse | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyFeedback, setHistoryFeedback] = useState<Feedback | null>(null);
  const [selectedHarvest, setSelectedHarvest] = useState<HarvestResponse | null>(
    null
  );
  const [reviewingHarvestId, setReviewingHarvestId] = useState<string | null>(
    null
  );
  const [rejectingHarvestId, setRejectingHarvestId] = useState<string | null>(
    null
  );
  const [rejectionReason, setRejectionReason] = useState("");

  const summary = useMemo(() => {
    const rows = history?.content ?? [];
    const pending = rows.filter((row) => row.status === "PENDING").length;
    const approved = rows.filter((row) => row.status === "APPROVED");
    const rejected = rows.filter((row) => row.status === "REJECTED").length;
    const approvedWeight = approved.reduce(
      (total, row) => total + Number(row.weightKg ?? 0),
      0
    );

    return {
      rows: rows.length,
      pending,
      rejected,
      approvedWeight,
    };
  }, [history]);

  const clearSubmitForm = () => {
    setSubmitForm(initialSubmitForm);
    setPhotos([]);
    setFileInputKey((previous) => previous + 1);
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPhotos(Array.from(event.target.files ?? []));
  };

  const loadHistory = async (page = 0) => {
    setHistoryLoading(true);
    setHistoryFeedback(null);

    try {
      const nextFilters = { ...filters, page };

      if (
        nextFilters.startDate &&
        nextFilters.endDate &&
        nextFilters.startDate > nextFilters.endDate
      ) {
        throw new Error("Start date cannot be after end date");
      }

      if (historyMode === "buruh" && !nextFilters.buruhId.trim()) {
        throw new Error("Buruh ID is required");
      }

      const response =
        historyMode === "buruh"
          ? await harvestClient.getHarvestHistoryByBuruhId(
              nextFilters.buruhId.trim(),
              {
                ...buildHistoryFilters(nextFilters),
                buruhName: undefined,
              }
            )
          : await harvestClient.getHarvestHistory(buildHistoryFilters(nextFilters));

      setFilters((previous) => ({ ...previous, page: response.page }));
      setHistory(response);
      setSelectedHarvest((previous) => {
        const current = response.content.find(
          (harvest) => harvest.id === previous?.id
        );
        return current ?? response.content[0] ?? null;
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Request failed";
      setHistoryFeedback({ type: "error", message });
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    let isActive = true;

    const loadInitialHistory = async () => {
      setHistoryLoading(true);
      setHistoryFeedback(null);

      try {
        const response = await harvestClient.getHarvestHistory(
          buildHistoryFilters(initialFilters)
        );

        if (!isActive) {
          return;
        }

        setFilters((previous) => ({ ...previous, page: response.page }));
        setHistory(response);
        setSelectedHarvest(response.content[0] ?? null);
      } catch (error) {
        if (!isActive) {
          return;
        }

        const message = error instanceof Error ? error.message : "Request failed";
        setHistoryFeedback({ type: "error", message });
      } finally {
        if (isActive) {
          setHistoryLoading(false);
        }
      }
    };

    void loadInitialHistory();

    return () => {
      isActive = false;
    };
  }, []);

  const handleSubmitHarvest = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitLoading(true);
    setSubmitFeedback(null);

    void (async () => {
      try {
        if (!submitForm.notes.trim()) {
          throw new Error("Notes are required");
        }

        validatePhotos(photos);

        const response = await harvestClient.submitHarvest(
          {
            weightKg: parseWeight(submitForm.weightKg),
            notes: submitForm.notes.trim(),
          },
          photos
        );

        setSubmittedHarvest(response);
        setSelectedHarvest(response);
        setSubmitFeedback({
          type: "success",
          message: `Harvest ${response.id} submitted successfully`,
        });
        clearSubmitForm();
        await loadHistory(0);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Request failed";
        setSubmitFeedback({ type: "error", message });
      } finally {
        setSubmitLoading(false);
      }
    })();
  };

  const handleLoadHistory = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void loadHistory(0);
  };

  const applyReviewToHistory = (review: ReviewResult) => {
    setHistory((previous) => {
      if (!previous) {
        return previous;
      }

      return {
        ...previous,
        content: previous.content.map((harvest) =>
          harvest.id === review.id
            ? {
                ...harvest,
                status: review.status,
                reviewedAt: getReviewTime(review),
                rejectionReason:
                  "rejectionReason" in review
                    ? review.rejectionReason ?? null
                    : harvest.rejectionReason,
              }
            : harvest
        ),
      };
    });

    setSelectedHarvest((previous) =>
      previous?.id === review.id
        ? {
            ...previous,
            status: review.status,
            reviewedAt: getReviewTime(review),
            rejectionReason:
              "rejectionReason" in review
                ? review.rejectionReason ?? null
                : previous.rejectionReason,
          }
        : previous
    );
  };

  const handleApproveHarvest = (harvestId: string) => {
    setReviewingHarvestId(harvestId);
    setHistoryFeedback(null);

    void (async () => {
      try {
        const response = await harvestClient.approveHarvest(harvestId);
        applyReviewToHistory(response);
        setHistoryFeedback({
          type: "success",
          message: `Harvest approved. Payroll ${response.payrollStatus.toLowerCase()}.`,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Request failed";
        setHistoryFeedback({ type: "error", message });
      } finally {
        setReviewingHarvestId(null);
      }
    })();
  };

  const handleRejectHarvest = (harvestId: string) => {
    const reason = rejectionReason.trim();
    if (!reason) {
      setHistoryFeedback({ type: "error", message: "Rejection reason is required" });
      return;
    }

    setReviewingHarvestId(harvestId);
    setHistoryFeedback(null);

    void (async () => {
      try {
        const response = await harvestClient.rejectHarvest(harvestId, reason);
        applyReviewToHistory(response);
        setRejectingHarvestId(null);
        setRejectionReason("");
        setHistoryFeedback({
          type: "success",
          message: "Harvest rejected",
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Request failed";
        setHistoryFeedback({ type: "error", message });
      } finally {
        setReviewingHarvestId(null);
      }
    })();
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 text-gray-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="border-b border-green-200 pb-5">
          <p className="text-sm font-semibold uppercase text-green-700">
            MySawit Operations
          </p>
          <div className="mt-2 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-green-950">Harvest</h1>
              <p className="mt-1 max-w-2xl text-sm text-gray-600">
                Submit harvest evidence, inspect history, and review pending
                reports from one workbench.
              </p>
            </div>
            <button
              type="button"
              className={secondaryButtonClass}
              onClick={() => void loadHistory(filters.page)}
              disabled={historyLoading}
            >
              {historyLoading ? "Refreshing..." : "Refresh History"}
            </button>
          </div>
        </header>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Rows Loaded" value={String(summary.rows)} />
          <MetricCard label="Pending" value={String(summary.pending)} tone="amber" />
          <MetricCard
            label="Approved Weight"
            value={`${formatWeight(summary.approvedWeight)} kg`}
            tone="green"
          />
          <MetricCard label="Rejected" value={String(summary.rejected)} tone="red" />
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(340px,0.75fr)_minmax(0,1.45fr)]">
          <aside className="space-y-6">
            <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-5">
                <h2 className="text-xl font-bold text-gray-900">
                  Submit Harvest
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Upload up to 10 JPG, PNG, or WEBP files.
                </p>
              </div>

              <FeedbackBanner feedback={submitFeedback} />

              <form onSubmit={handleSubmitHarvest} className="mt-5 space-y-5">
                <div>
                  <label className={labelClass} htmlFor="weightKg">
                    Harvest Weight (kg)
                  </label>
                  <input
                    id="weightKg"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={submitForm.weightKg}
                    onChange={(event) =>
                      setSubmitForm((previous) => ({
                        ...previous,
                        weightKg: event.target.value,
                      }))
                    }
                    className={`${inputClass} mt-1`}
                    placeholder="87.5"
                    required
                  />
                </div>

                <div>
                  <label className={labelClass} htmlFor="notes">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    value={submitForm.notes}
                    onChange={(event) =>
                      setSubmitForm((previous) => ({
                        ...previous,
                        notes: event.target.value,
                      }))
                    }
                    className={`${inputClass} mt-1 min-h-28 resize-y`}
                    placeholder="Morning harvest, block B"
                    required
                  />
                </div>

                <div>
                  <label className={labelClass} htmlFor="photos">
                    Harvest Photos
                  </label>
                  <input
                    key={fileInputKey}
                    id="photos"
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePhotoChange}
                    className={`${inputClass} mt-1 file:mr-4 file:rounded-md file:border-0 file:bg-green-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-green-800 hover:file:bg-green-100`}
                    required
                  />
                </div>

                <PhotoList photos={photos} />

                <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    className={secondaryButtonClass}
                    disabled={submitLoading}
                    onClick={clearSubmitForm}
                  >
                    Clear
                  </button>
                  <button
                    type="submit"
                    className={primaryButtonClass}
                    disabled={submitLoading}
                  >
                    {submitLoading ? "Submitting..." : "Submit Harvest"}
                  </button>
                </div>
              </form>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900">
                Selected Report
              </h2>

              {selectedHarvest ? (
                <div className="mt-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-xs text-gray-500">
                        {selectedHarvest.id}
                      </p>
                      <h3 className="mt-1 text-lg font-bold text-green-950">
                        {selectedHarvest.buruhName || "Unnamed Buruh"}
                      </h3>
                    </div>
                    <span
                      className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-bold ${statusClass(
                        selectedHarvest.status
                      )}`}
                    >
                      {selectedHarvest.status}
                    </span>
                  </div>

                  <dl className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-md bg-gray-50 p-3">
                      <dt className="font-semibold text-gray-500">Harvest Date</dt>
                      <dd className="mt-1 text-gray-900">
                        {formatDate(selectedHarvest.harvestDate)}
                      </dd>
                    </div>
                    <div className="rounded-md bg-gray-50 p-3">
                      <dt className="font-semibold text-gray-500">Weight</dt>
                      <dd className="mt-1 font-mono text-gray-900">
                        {formatWeight(selectedHarvest.weightKg)} kg
                      </dd>
                    </div>
                    <div className="rounded-md bg-gray-50 p-3">
                      <dt className="font-semibold text-gray-500">Submitted</dt>
                      <dd className="mt-1 text-gray-900">
                        {formatDateTime(selectedHarvest.createdAt)}
                      </dd>
                    </div>
                    <div className="rounded-md bg-gray-50 p-3">
                      <dt className="font-semibold text-gray-500">Reviewed</dt>
                      <dd className="mt-1 text-gray-900">
                        {formatDateTime(selectedHarvest.reviewedAt)}
                      </dd>
                    </div>
                  </dl>

                  <div className="rounded-md border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
                    {selectedHarvest.notes}
                  </div>

                  {selectedHarvest.rejectionReason && (
                    <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                      {selectedHarvest.rejectionReason}
                    </div>
                  )}

                  <div>
                    <p className="mb-2 text-sm font-bold text-gray-900">Photos</p>
                    {selectedHarvest.photoUrls && selectedHarvest.photoUrls.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedHarvest.photoUrls.map((photoUrl, index) => (
                          <a
                            key={`${photoUrl}-${index}`}
                            href={photoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm font-semibold text-green-800 hover:bg-green-100"
                          >
                            Photo {index + 1}
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No photos available.</p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm text-gray-500">
                  Select a row from history to view details.
                </p>
              )}
            </section>

            {submittedHarvest && (
              <section className="rounded-lg border border-green-200 bg-green-50 p-5 shadow-sm">
                <p className="text-sm font-bold text-green-950">Last Submission</p>
                <p className="mt-2 break-all font-mono text-xs text-green-800">
                  {submittedHarvest.id}
                </p>
              </section>
            )}
          </aside>

          <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Harvest History
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Review pending harvest reports and inspect approved records.
                  </p>
                </div>

                <div className="inline-flex rounded-md border border-gray-300 bg-white p-1">
                  <button
                    type="button"
                    onClick={() => setHistoryMode("all")}
                    className={`rounded px-3 py-1.5 text-sm font-semibold transition ${
                      historyMode === "all"
                        ? "bg-green-700 text-white"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setHistoryMode("buruh")}
                    className={`rounded px-3 py-1.5 text-sm font-semibold transition ${
                      historyMode === "buruh"
                        ? "bg-green-700 text-white"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    By Buruh
                  </button>
                </div>
              </div>

              <form onSubmit={handleLoadHistory} className="mt-5 space-y-4">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                  <div>
                    <label className={labelClass} htmlFor="startDate">
                      Start Date
                    </label>
                    <input
                      id="startDate"
                      type="date"
                      value={filters.startDate}
                      onChange={(event) =>
                        setFilters((previous) => ({
                          ...previous,
                          startDate: event.target.value,
                        }))
                      }
                      className={`${inputClass} mt-1`}
                    />
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="endDate">
                      End Date
                    </label>
                    <input
                      id="endDate"
                      type="date"
                      value={filters.endDate}
                      onChange={(event) =>
                        setFilters((previous) => ({
                          ...previous,
                          endDate: event.target.value,
                        }))
                      }
                      className={`${inputClass} mt-1`}
                    />
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="status">
                      Status
                    </label>
                    <select
                      id="status"
                      value={filters.status}
                      onChange={(event) =>
                        setFilters((previous) => ({
                          ...previous,
                          status: event.target.value as "" | HarvestStatus,
                        }))
                      }
                      className={`${inputClass} mt-1`}
                    >
                      <option value="">All Status</option>
                      <option value="PENDING">Pending</option>
                      <option value="APPROVED">Approved</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="size">
                      Page Size
                    </label>
                    <select
                      id="size"
                      value={filters.size}
                      onChange={(event) =>
                        setFilters((previous) => ({
                          ...previous,
                          size: Number(event.target.value),
                        }))
                      }
                      className={`${inputClass} mt-1`}
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      className={`${primaryButtonClass} w-full`}
                      disabled={historyLoading}
                    >
                      {historyLoading ? "Loading..." : "Apply"}
                    </button>
                  </div>
                </div>

                <div>
                  {historyMode === "all" ? (
                    <>
                      <label className={labelClass} htmlFor="buruhName">
                        Buruh Name
                      </label>
                      <input
                        id="buruhName"
                        value={filters.buruhName}
                        onChange={(event) =>
                          setFilters((previous) => ({
                            ...previous,
                            buruhName: event.target.value,
                          }))
                        }
                        className={`${inputClass} mt-1`}
                        placeholder="Optional"
                      />
                    </>
                  ) : (
                    <>
                      <label className={labelClass} htmlFor="buruhId">
                        Buruh ID
                      </label>
                      <input
                        id="buruhId"
                        value={filters.buruhId}
                        onChange={(event) =>
                          setFilters((previous) => ({
                            ...previous,
                            buruhId: event.target.value,
                          }))
                        }
                        className={`${inputClass} mt-1`}
                        placeholder="UUID or user id"
                        required={historyMode === "buruh"}
                      />
                    </>
                  )}
                </div>
              </form>
            </div>

            <div className="p-5">
              <FeedbackBanner feedback={historyFeedback} />
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-bold uppercase text-gray-600">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left font-bold uppercase text-gray-600">
                      Buruh
                    </th>
                    <th className="px-4 py-3 text-left font-bold uppercase text-gray-600">
                      Weight
                    </th>
                    <th className="px-4 py-3 text-left font-bold uppercase text-gray-600">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left font-bold uppercase text-gray-600">
                      Notes
                    </th>
                    <th className="px-4 py-3 text-left font-bold uppercase text-gray-600">
                      Photos
                    </th>
                    <th className="px-4 py-3 text-left font-bold uppercase text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {historyLoading ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                        Loading harvest records...
                      </td>
                    </tr>
                  ) : history && history.content.length > 0 ? (
                    history.content.map((harvest) => (
                      <tr
                        key={harvest.id}
                        className={`cursor-pointer transition ${
                          selectedHarvest?.id === harvest.id
                            ? "bg-green-50"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() => setSelectedHarvest(harvest)}
                      >
                        <td className="whitespace-nowrap px-4 py-4 text-gray-700">
                          {formatDate(harvest.harvestDate)}
                        </td>
                        <td className="px-4 py-4">
                          <div className="font-semibold text-gray-900">
                            {harvest.buruhName || "Unnamed Buruh"}
                          </div>
                          <div className="mt-1 max-w-40 truncate text-xs text-gray-500">
                            {harvest.buruhId}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 font-mono text-gray-900">
                          {formatWeight(harvest.weightKg)} kg
                        </td>
                        <td className="whitespace-nowrap px-4 py-4">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${statusClass(
                              harvest.status
                            )}`}
                          >
                            {harvest.status}
                          </span>
                          {harvest.rejectionReason && (
                            <div className="mt-1 max-w-44 truncate text-xs text-red-600">
                              {harvest.rejectionReason}
                            </div>
                          )}
                        </td>
                        <td className="max-w-64 px-4 py-4 text-gray-700">
                          <span className="block max-h-12 overflow-hidden">
                            {harvest.notes}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-gray-700">
                          {harvest.photoUrls?.length ?? 0}
                        </td>
                        <td
                          className="min-w-72 px-4 py-4"
                          onClick={(event) => event.stopPropagation()}
                        >
                          {harvest.status === "PENDING" ? (
                            rejectingHarvestId === harvest.id ? (
                              <div className="space-y-2">
                                <input
                                  value={rejectionReason}
                                  onChange={(event) =>
                                    setRejectionReason(event.target.value)
                                  }
                                  className={inputClass}
                                  placeholder="Rejection reason"
                                />
                                <div className="flex flex-wrap gap-2">
                                  <button
                                    type="button"
                                    className={dangerButtonClass}
                                    disabled={reviewingHarvestId === harvest.id}
                                    onClick={() => handleRejectHarvest(harvest.id)}
                                  >
                                    Confirm Reject
                                  </button>
                                  <button
                                    type="button"
                                    className={secondaryButtonClass}
                                    onClick={() => {
                                      setRejectingHarvestId(null);
                                      setRejectionReason("");
                                    }}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  className={primaryButtonClass}
                                  disabled={reviewingHarvestId === harvest.id}
                                  onClick={() => handleApproveHarvest(harvest.id)}
                                >
                                  {reviewingHarvestId === harvest.id
                                    ? "Reviewing..."
                                    : "Approve"}
                                </button>
                                <button
                                  type="button"
                                  className={dangerButtonClass}
                                  disabled={reviewingHarvestId === harvest.id}
                                  onClick={() => {
                                    setRejectingHarvestId(harvest.id);
                                    setRejectionReason(harvest.rejectionReason ?? "");
                                  }}
                                >
                                  Reject
                                </button>
                              </div>
                            )
                          ) : (
                            <span className="text-xs font-semibold text-gray-400">
                              Reviewed
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                        No harvest records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-gray-500">
                {history
                  ? `Page ${history.page + 1} of ${Math.max(
                      history.totalPages,
                      1
                    )} - ${history.totalElements} records`
                  : "Page 1 of 1 - 0 records"}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  className={secondaryButtonClass}
                  disabled={historyLoading || !history || history.page <= 0}
                  onClick={() => void loadHistory((history?.page ?? 0) - 1)}
                >
                  Previous
                </button>
                <button
                  type="button"
                  className={secondaryButtonClass}
                  disabled={
                    historyLoading ||
                    !history ||
                    history.page + 1 >= history.totalPages
                  }
                  onClick={() => void loadHistory((history?.page ?? 0) + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
