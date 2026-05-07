"use client";

import { useState } from "react";
import { harvestClient } from "@/features/harvest/api";
import type {
  HarvestHistoryFilters,
  HarvestPageResponse,
  HarvestResponse,
  HarvestStatus,
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
  "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500";

const labelClass = "text-sm font-semibold text-gray-800";

const primaryButtonClass =
  "rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50";

const secondaryButtonClass =
  "rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50";

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

function statusClass(status: HarvestStatus) {
  if (status === "APPROVED") {
    return "border-green-200 bg-green-100 text-green-800";
  }

  if (status === "REJECTED") {
    return "border-red-200 bg-red-100 text-red-800";
  }

  return "border-yellow-200 bg-yellow-100 text-yellow-800";
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

  const clearSubmitForm = () => {
    setSubmitForm(initialSubmitForm);
    setPhotos([]);
    setFileInputKey((previous) => previous + 1);
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedPhotos = Array.from(event.target.files ?? []);
    setPhotos(selectedPhotos);
  };

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
        setSubmitFeedback({
          type: "success",
          message: `Harvest ${response.id} submitted successfully`,
        });
        clearSubmitForm();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Request failed";
        setSubmitFeedback({ type: "error", message });
      } finally {
        setSubmitLoading(false);
      }
    })();
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
    } catch (error) {
      const message = error instanceof Error ? error.message : "Request failed";
      setHistoryFeedback({ type: "error", message });
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleLoadHistory = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (historyMode === "buruh" && !filters.buruhId.trim()) {
      setHistoryFeedback({ type: "error", message: "Buruh ID is required" });
      return;
    }

    void loadHistory(0);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 text-gray-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 border-b border-green-200 pb-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
            MySawit
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-green-900">
            Harvest
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-600">
            Buruh submission and harvest history review.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(340px,0.9fr)_minmax(0,1.35fr)]">
          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Submit Harvest
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Photos are validated before upload.
              </p>
            </div>

            {submitFeedback && (
              <div
                className={`mb-5 rounded-md border px-4 py-3 text-sm ${
                  submitFeedback.type === "success"
                    ? "border-green-200 bg-green-50 text-green-800"
                    : "border-red-200 bg-red-50 text-red-800"
                }`}
              >
                {submitFeedback.message}
              </div>
            )}

            <form onSubmit={handleSubmitHarvest} className="space-y-5">
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
                  placeholder="Fresh fruit bunches from morning harvest"
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
                  className={`${inputClass} mt-1 file:mr-4 file:rounded-md file:border-0 file:bg-green-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-green-700 hover:file:bg-green-100`}
                  required
                />

                {photos.length > 0 && (
                  <ul className="mt-3 space-y-2 text-sm text-gray-600">
                    {photos.map((photo) => (
                      <li
                        key={`${photo.name}-${photo.size}`}
                        className="flex items-center justify-between gap-3 rounded-md border border-gray-200 px-3 py-2"
                      >
                        <span className="truncate">{photo.name}</span>
                        <span className="shrink-0 text-xs text-gray-500">
                          {(photo.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

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

            {submittedHarvest && (
              <div className="mt-6 border-t border-gray-100 pt-5">
                <h3 className="text-base font-bold text-gray-900">
                  Last Submission
                </h3>
                <pre className="mt-3 max-h-72 overflow-auto rounded-md bg-gray-900 p-4 text-xs leading-5 text-gray-100">
                  {JSON.stringify(submittedHarvest, null, 2)}
                </pre>
              </div>
            )}
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 border-b border-gray-100 pb-5 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Harvest History
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Filtered results from the harvest service.
                </p>
              </div>

              <div className="inline-flex rounded-md border border-gray-300 bg-white p-1">
                <button
                  type="button"
                  onClick={() => setHistoryMode("all")}
                  className={`rounded px-3 py-1.5 text-sm font-semibold transition ${
                    historyMode === "all"
                      ? "bg-green-600 text-white"
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
                      ? "bg-green-600 text-white"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  By Buruh
                </button>
              </div>
            </div>

            <form onSubmit={handleLoadHistory} className="mt-5 space-y-4">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
              </div>

              <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
                {historyMode === "all" ? (
                  <div>
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
                  </div>
                ) : (
                  <div>
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
                  </div>
                )}

                <button
                  type="submit"
                  className={primaryButtonClass}
                  disabled={historyLoading}
                >
                  {historyLoading ? "Loading..." : "Load History"}
                </button>
              </div>
            </form>

            {historyFeedback && (
              <div
                className={`mt-5 rounded-md border px-4 py-3 text-sm ${
                  historyFeedback.type === "success"
                    ? "border-green-200 bg-green-50 text-green-800"
                    : "border-red-200 bg-red-50 text-red-800"
                }`}
              >
                {historyFeedback.message}
              </div>
            )}

            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-bold uppercase tracking-wide text-gray-600">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left font-bold uppercase tracking-wide text-gray-600">
                      Buruh
                    </th>
                    <th className="px-4 py-3 text-left font-bold uppercase tracking-wide text-gray-600">
                      Plantation
                    </th>
                    <th className="px-4 py-3 text-left font-bold uppercase tracking-wide text-gray-600">
                      Weight
                    </th>
                    <th className="px-4 py-3 text-left font-bold uppercase tracking-wide text-gray-600">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left font-bold uppercase tracking-wide text-gray-600">
                      Notes
                    </th>
                    <th className="px-4 py-3 text-left font-bold uppercase tracking-wide text-gray-600">
                      Photos
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
                      <tr key={harvest.id} className="hover:bg-green-50/60">
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
                        <td className="max-w-44 truncate px-4 py-4 text-gray-700">
                          {harvest.plantationId}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 font-mono text-gray-900">
                          {Number(harvest.weightKg).toLocaleString("id-ID")} kg
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
                            <div className="mt-1 max-w-40 truncate text-xs text-red-600">
                              {harvest.rejectionReason}
                            </div>
                          )}
                        </td>
                        <td className="max-w-56 px-4 py-4 text-gray-700">
                          <span className="line-clamp-2">{harvest.notes}</span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-gray-700">
                          {harvest.photoUrls?.length ?? 0}
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

            <div className="mt-5 flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
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

            {submittedHarvest && (
              <p className="mt-4 text-xs text-gray-500">
                Last submitted at {formatDateTime(submittedHarvest.createdAt)}
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
