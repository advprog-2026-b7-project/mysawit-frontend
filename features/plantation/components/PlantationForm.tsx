"use client";

import { useEffect, useMemo, useState } from "react";
import { plantationClient } from "@/features/plantation/api";
import type {
  Coordinate,
  DriverSummary,
  PageResponse,
  PlantationDetailResponse,
  PlantationListItemResponse,
} from "@/features/plantation/types";

type CoordinateDraft = {
  x: string;
  y: string;
};

type Feedback = {
  type: "success" | "error";
  message: string;
};

type ListFilters = {
  name: string;
  code: string;
  sort: string;
  page: number;
  size: number;
};

type PlantationFormState = {
  name: string;
  code: string;
  area: string;
};

type AssignmentState = {
  mandorId: string;
  driverId: string;
  reassignMandorTo: string;
  reassignDriverTo: string;
};

type BusyAction =
  | "list"
  | "detail"
  | "create"
  | "update"
  | "delete"
  | "assign-mandor"
  | "unassign-mandor"
  | "assign-driver"
  | "unassign-driver";

const initialListFilters: ListFilters = {
  name: "",
  code: "",
  sort: "createdAt,desc",
  page: 0,
  size: 10,
};

const emptyCreateForm: PlantationFormState = {
  name: "",
  code: "",
  area: "",
};

const emptyAssignmentState: AssignmentState = {
  mandorId: "",
  driverId: "",
  reassignMandorTo: "",
  reassignDriverTo: "",
};

const defaultRectangle = (): CoordinateDraft[] => [
  { x: "0", y: "0" },
  { x: "12", y: "0" },
  { x: "12", y: "8" },
  { x: "0", y: "8" },
];

const coordinateLabels = ["Point A", "Point B", "Point C", "Point D"];

const inputClass =
  "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-600";

const labelClass = "text-sm font-semibold text-gray-800";

const primaryButtonClass =
  "inline-flex min-h-10 items-center justify-center rounded-md bg-green-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50";

const secondaryButtonClass =
  "inline-flex min-h-10 items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50";

const dangerButtonClass =
  "inline-flex min-h-10 items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50";

function parsePositiveNumber(value: string, fieldName: string) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${fieldName} must be greater than 0`);
  }

  return parsed;
}

function parseCoordinates(draft: CoordinateDraft[]): Coordinate[] {
  const coordinates = draft.map((coordinate, index) => {
    const x = Number(coordinate.x);
    const y = Number(coordinate.y);

    if (!Number.isInteger(x) || !Number.isInteger(y)) {
      throw new Error(`Coordinate ${index + 1} must use integer X and Y values`);
    }

    return [x, y] as Coordinate;
  });

  const uniqueX = new Set(coordinates.map(([x]) => x));
  const uniqueY = new Set(coordinates.map(([, y]) => y));

  if (uniqueX.size !== 2 || uniqueY.size !== 2) {
    throw new Error("Coordinates must form an axis-aligned rectangle");
  }

  return coordinates;
}

function coordinatesToDraft(coordinates?: Coordinate[] | null) {
  if (!coordinates || coordinates.length !== 4) {
    return defaultRectangle();
  }

  return coordinates.map(([x, y]) => ({
    x: String(x),
    y: String(y),
  }));
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

function formatNumber(value?: number | null) {
  return Number(value ?? 0).toLocaleString("id-ID", {
    maximumFractionDigits: 2,
  });
}

function getCoordinateBounds(coordinates: CoordinateDraft[]) {
  const numeric = coordinates.map((coordinate) => ({
    x: Number(coordinate.x),
    y: Number(coordinate.y),
  }));
  const valid = numeric.every(
    (coordinate) => Number.isFinite(coordinate.x) && Number.isFinite(coordinate.y)
  );

  if (!valid) {
    return null;
  }

  const xs = numeric.map((coordinate) => coordinate.x);
  const ys = numeric.map((coordinate) => coordinate.y);
  const width = Math.abs(Math.max(...xs) - Math.min(...xs));
  const height = Math.abs(Math.max(...ys) - Math.min(...ys));

  return { width, height };
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
  tone?: "neutral" | "green" | "amber";
}) {
  const toneClass = {
    neutral: "border-gray-200 bg-white text-gray-900",
    green: "border-green-200 bg-green-50 text-green-950",
    amber: "border-amber-200 bg-amber-50 text-amber-950",
  }[tone];

  return (
    <div className={`rounded-lg border px-4 py-3 ${toneClass}`}>
      <p className="text-xs font-semibold uppercase text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

function CoordinateEditor({
  coordinates,
  onChange,
}: {
  coordinates: CoordinateDraft[];
  onChange: (nextCoordinates: CoordinateDraft[]) => void;
}) {
  const bounds = getCoordinateBounds(coordinates);

  const updateCoordinate = (
    index: number,
    field: keyof CoordinateDraft,
    value: string
  ) => {
    onChange(
      coordinates.map((coordinate, coordinateIndex) =>
        coordinateIndex === index ? { ...coordinate, [field]: value } : coordinate
      )
    );
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {coordinates.map((coordinate, index) => (
          <div
            key={coordinateLabels[index]}
            className="rounded-md border border-gray-200 bg-gray-50 p-3"
          >
            <p className="mb-2 text-xs font-semibold uppercase text-green-800">
              {coordinateLabels[index]}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                step="1"
                value={coordinate.x}
                onChange={(event) =>
                  updateCoordinate(index, "x", event.target.value)
                }
                className={inputClass}
                placeholder="X"
                required
              />
              <input
                type="number"
                step="1"
                value={coordinate.y}
                onChange={(event) =>
                  updateCoordinate(index, "y", event.target.value)
                }
                className={inputClass}
                placeholder="Y"
                required
              />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 rounded-md border border-gray-200 bg-white p-3 text-sm">
        <div>
          <span className="text-gray-500">Width</span>
          <strong className="ml-2 text-gray-900">
            {bounds ? formatNumber(bounds.width) : "-"}
          </strong>
        </div>
        <div>
          <span className="text-gray-500">Height</span>
          <strong className="ml-2 text-gray-900">
            {bounds ? formatNumber(bounds.height) : "-"}
          </strong>
        </div>
      </div>
    </div>
  );
}

function EmptyDrivers() {
  return (
    <div className="rounded-md border border-dashed border-gray-300 px-4 py-8 text-center text-sm text-gray-500">
      No drivers assigned.
    </div>
  );
}

export default function PlantationForm() {
  const [filters, setFilters] = useState<ListFilters>(initialListFilters);
  const [plantations, setPlantations] =
    useState<PageResponse<PlantationListItemResponse> | null>(null);
  const [selectedPlantationId, setSelectedPlantationId] = useState<string>("");
  const [selectedDetail, setSelectedDetail] =
    useState<PlantationDetailResponse | null>(null);
  const [driverNameFilter, setDriverNameFilter] = useState("");
  const [busyAction, setBusyAction] = useState<BusyAction | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [detailFeedback, setDetailFeedback] = useState<Feedback | null>(null);

  const [createForm, setCreateForm] =
    useState<PlantationFormState>(emptyCreateForm);
  const [createCoordinates, setCreateCoordinates] = useState<CoordinateDraft[]>(
    defaultRectangle()
  );
  const [editForm, setEditForm] =
    useState<PlantationFormState>(emptyCreateForm);
  const [editCoordinates, setEditCoordinates] = useState<CoordinateDraft[]>(
    defaultRectangle()
  );
  const [assignmentForm, setAssignmentForm] =
    useState<AssignmentState>(emptyAssignmentState);

  const selectedListItem = plantations?.content.find(
    (plantation) => plantation.id === selectedPlantationId
  );

  const summary = useMemo(() => {
    const rows = plantations?.content ?? [];
    const totalArea = rows.reduce((total, row) => total + Number(row.area ?? 0), 0);
    const assignedMandor = rows.filter((row) => row.mandorName).length;
    const totalDrivers = rows.reduce(
      (total, row) => total + Number(row.driverCount ?? 0),
      0
    );

    return {
      rows: rows.length,
      totalArea,
      assignedMandor,
      totalDrivers,
    };
  }, [plantations]);

  const loadDetail = async (
    plantationId: string,
    page = 0,
    driverName = driverNameFilter
  ) => {
    setBusyAction("detail");
    setDetailFeedback(null);

    try {
      const response = await plantationClient.getPlantationById(plantationId, {
        driverName: driverName.trim(),
        page,
        size: 5,
      });

      setSelectedPlantationId(plantationId);
      setSelectedDetail(response);
      setEditForm({
        name: response.name,
        code: response.code,
        area: String(response.area),
      });
      setEditCoordinates(coordinatesToDraft(response.coordinates));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Request failed";
      setDetailFeedback({ type: "error", message });
    } finally {
      setBusyAction(null);
    }
  };

  const loadPlantations = async (page = filters.page) => {
    setBusyAction("list");
    setFeedback(null);

    try {
      const response = await plantationClient.getPlantations({
        name: filters.name.trim(),
        code: filters.code.trim(),
        sort: filters.sort,
        page,
        size: filters.size,
      });

      setPlantations(response);
      setFilters((previous) => ({ ...previous, page: response.page }));

      const fallbackId = response.content[0]?.id;
      if (!selectedPlantationId && fallbackId) {
        await loadDetail(fallbackId, 0, "");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Request failed";
      setFeedback({ type: "error", message });
    } finally {
      setBusyAction((current) => (current === "list" ? null : current));
    }
  };

  useEffect(() => {
    let isActive = true;

    const loadInitialPlantations = async () => {
      setBusyAction("list");
      setFeedback(null);

      try {
        const response = await plantationClient.getPlantations({
          page: 0,
          size: initialListFilters.size,
          sort: initialListFilters.sort,
        });

        if (!isActive) {
          return;
        }

        setPlantations(response);
        setFilters((previous) => ({ ...previous, page: response.page }));

        const firstPlantationId = response.content[0]?.id;
        if (!firstPlantationId) {
          return;
        }

        setBusyAction("detail");
        const detail = await plantationClient.getPlantationById(firstPlantationId, {
          page: 0,
          size: 5,
        });

        if (!isActive) {
          return;
        }

        setSelectedPlantationId(firstPlantationId);
        setSelectedDetail(detail);
        setEditForm({
          name: detail.name,
          code: detail.code,
          area: String(detail.area),
        });
        setEditCoordinates(coordinatesToDraft(detail.coordinates));
      } catch (error) {
        if (!isActive) {
          return;
        }

        const message = error instanceof Error ? error.message : "Request failed";
        setFeedback({ type: "error", message });
      } finally {
        if (isActive) {
          setBusyAction(null);
        }
      }
    };

    void loadInitialPlantations();

    return () => {
      isActive = false;
    };
  }, []);

  const handleListSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void loadPlantations(0);
  };

  const handleCreate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    void (async () => {
      setBusyAction("create");
      setFeedback(null);

      try {
        if (!createForm.name.trim()) {
          throw new Error("Plantation name is required");
        }
        if (!createForm.code.trim()) {
          throw new Error("Plantation code is required");
        }

        const response = await plantationClient.createPlantation({
          name: createForm.name.trim(),
          code: createForm.code.trim(),
          area: parsePositiveNumber(createForm.area, "Area"),
          coordinates: parseCoordinates(createCoordinates),
        });

        setCreateForm(emptyCreateForm);
        setCreateCoordinates(defaultRectangle());
        setFeedback({
          type: "success",
          message: `Plantation ${response.code} created successfully`,
        });
        await loadPlantations(0);
        await loadDetail(response.id, 0, "");
      } catch (error) {
        const message = error instanceof Error ? error.message : "Request failed";
        setFeedback({ type: "error", message });
      } finally {
        setBusyAction(null);
      }
    })();
  };

  const handleUpdate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedPlantationId) {
      setFeedback({ type: "error", message: "Select a plantation first" });
      return;
    }

    void (async () => {
      setBusyAction("update");
      setFeedback(null);

      try {
        const response = await plantationClient.updatePlantation(
          selectedPlantationId,
          {
            name: editForm.name.trim(),
            area: parsePositiveNumber(editForm.area, "Area"),
            coordinates: parseCoordinates(editCoordinates),
          }
        );

        setFeedback({
          type: "success",
          message: `Plantation ${response.code} updated successfully`,
        });
        await loadPlantations(filters.page);
        await loadDetail(selectedPlantationId, selectedDetail?.drivers.page ?? 0);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Request failed";
        setFeedback({ type: "error", message });
      } finally {
        setBusyAction(null);
      }
    })();
  };

  const handleDelete = () => {
    if (!selectedPlantationId) {
      setFeedback({ type: "error", message: "Select a plantation first" });
      return;
    }

    if (!window.confirm("Delete this plantation?")) {
      return;
    }

    void (async () => {
      setBusyAction("delete");
      setFeedback(null);

      try {
        const message = await plantationClient.deletePlantation(selectedPlantationId);
        setFeedback({ type: "success", message });
        setSelectedPlantationId("");
        setSelectedDetail(null);
        await loadPlantations(0);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Request failed";
        setFeedback({ type: "error", message });
      } finally {
        setBusyAction(null);
      }
    })();
  };

  const handleAssignMandor = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedPlantationId) {
      setFeedback({ type: "error", message: "Select a plantation first" });
      return;
    }

    void (async () => {
      setBusyAction("assign-mandor");
      setFeedback(null);

      try {
        if (!assignmentForm.mandorId.trim()) {
          throw new Error("Mandor ID is required");
        }

        const response = await plantationClient.assignMandor(
          selectedPlantationId,
          assignmentForm.mandorId.trim()
        );

        setAssignmentForm((previous) => ({ ...previous, mandorId: "" }));
        setFeedback({
          type: "success",
          message: `${response.mandor?.name ?? "Mandor"} assigned successfully`,
        });
        await loadPlantations(filters.page);
        await loadDetail(selectedPlantationId, selectedDetail?.drivers.page ?? 0);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Request failed";
        setFeedback({ type: "error", message });
      } finally {
        setBusyAction(null);
      }
    })();
  };

  const handleUnassignMandor = () => {
    if (!selectedPlantationId || !selectedDetail?.mandor) {
      setFeedback({ type: "error", message: "No mandor assigned" });
      return;
    }

    void (async () => {
      setBusyAction("unassign-mandor");
      setFeedback(null);

      try {
        await plantationClient.unassignMandor(selectedPlantationId, {
          reassignToPlantationId:
            assignmentForm.reassignMandorTo.trim() || undefined,
        });

        setAssignmentForm((previous) => ({
          ...previous,
          reassignMandorTo: "",
        }));
        setFeedback({ type: "success", message: "Mandor unassigned" });
        await loadPlantations(filters.page);
        await loadDetail(selectedPlantationId, selectedDetail.drivers.page);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Request failed";
        setFeedback({ type: "error", message });
      } finally {
        setBusyAction(null);
      }
    })();
  };

  const handleAssignDriver = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedPlantationId) {
      setFeedback({ type: "error", message: "Select a plantation first" });
      return;
    }

    void (async () => {
      setBusyAction("assign-driver");
      setFeedback(null);

      try {
        if (!assignmentForm.driverId.trim()) {
          throw new Error("Driver ID is required");
        }

        const response = await plantationClient.assignDriver(
          selectedPlantationId,
          assignmentForm.driverId.trim()
        );

        setAssignmentForm((previous) => ({ ...previous, driverId: "" }));
        setFeedback({
          type: "success",
          message: `${response.driver?.name ?? "Driver"} assigned successfully`,
        });
        await loadPlantations(filters.page);
        await loadDetail(selectedPlantationId, selectedDetail?.drivers.page ?? 0);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Request failed";
        setFeedback({ type: "error", message });
      } finally {
        setBusyAction(null);
      }
    })();
  };

  const handleUnassignDriver = (driver: DriverSummary) => {
    if (!selectedPlantationId) {
      setFeedback({ type: "error", message: "Select a plantation first" });
      return;
    }

    void (async () => {
      setBusyAction("unassign-driver");
      setFeedback(null);

      try {
        await plantationClient.unassignDriver(selectedPlantationId, driver.id, {
          reassignToPlantationId:
            assignmentForm.reassignDriverTo.trim() || undefined,
        });

        setAssignmentForm((previous) => ({
          ...previous,
          reassignDriverTo: "",
        }));
        setFeedback({ type: "success", message: `${driver.name} unassigned` });
        await loadPlantations(filters.page);
        await loadDetail(selectedPlantationId, selectedDetail?.drivers.page ?? 0);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Request failed";
        setFeedback({ type: "error", message });
      } finally {
        setBusyAction(null);
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
              <h1 className="text-3xl font-bold text-green-950">Plantation</h1>
              <p className="mt-1 max-w-2xl text-sm text-gray-600">
                Manage plantation records, field boundaries, mandor ownership,
                and driver coverage.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={secondaryButtonClass}
                onClick={() => void loadPlantations(filters.page)}
                disabled={busyAction === "list"}
              >
                {busyAction === "list" ? "Refreshing..." : "Refresh"}
              </button>
              <button
                type="button"
                className={dangerButtonClass}
                onClick={handleDelete}
                disabled={!selectedPlantationId || busyAction === "delete"}
              >
                {busyAction === "delete" ? "Deleting..." : "Delete Selected"}
              </button>
            </div>
          </div>
        </header>

        <FeedbackBanner feedback={feedback} />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Rows Loaded"
            value={formatNumber(summary.rows)}
            tone="neutral"
          />
          <MetricCard
            label="Visible Area"
            value={`${formatNumber(summary.totalArea)} ha`}
            tone="green"
          />
          <MetricCard
            label="Assigned Mandor"
            value={formatNumber(summary.assignedMandor)}
            tone="amber"
          />
          <MetricCard
            label="Assigned Drivers"
            value={formatNumber(summary.totalDrivers)}
            tone="neutral"
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(360px,0.8fr)]">
          <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 p-5">
              <h2 className="text-xl font-bold text-gray-900">
                Plantation Registry
              </h2>
              <form onSubmit={handleListSearch} className="mt-4 grid gap-3 lg:grid-cols-[1fr_1fr_180px_120px_auto]">
                <input
                  value={filters.name}
                  onChange={(event) =>
                    setFilters((previous) => ({
                      ...previous,
                      name: event.target.value,
                    }))
                  }
                  className={inputClass}
                  placeholder="Filter by name"
                />
                <input
                  value={filters.code}
                  onChange={(event) =>
                    setFilters((previous) => ({
                      ...previous,
                      code: event.target.value,
                    }))
                  }
                  className={inputClass}
                  placeholder="Filter by code"
                />
                <select
                  value={filters.sort}
                  onChange={(event) =>
                    setFilters((previous) => ({
                      ...previous,
                      sort: event.target.value,
                    }))
                  }
                  className={inputClass}
                >
                  <option value="createdAt,desc">Newest</option>
                  <option value="createdAt,asc">Oldest</option>
                  <option value="name,asc">Name A-Z</option>
                  <option value="code,asc">Code A-Z</option>
                  <option value="area,desc">Largest Area</option>
                </select>
                <select
                  value={filters.size}
                  onChange={(event) =>
                    setFilters((previous) => ({
                      ...previous,
                      size: Number(event.target.value),
                    }))
                  }
                  className={inputClass}
                >
                  <option value={10}>10 rows</option>
                  <option value={20}>20 rows</option>
                  <option value={50}>50 rows</option>
                </select>
                <button
                  type="submit"
                  className={primaryButtonClass}
                  disabled={busyAction === "list"}
                >
                  Apply
                </button>
              </form>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-bold uppercase text-gray-600">
                      Plantation
                    </th>
                    <th className="px-4 py-3 text-left font-bold uppercase text-gray-600">
                      Area
                    </th>
                    <th className="px-4 py-3 text-left font-bold uppercase text-gray-600">
                      Mandor
                    </th>
                    <th className="px-4 py-3 text-left font-bold uppercase text-gray-600">
                      Drivers
                    </th>
                    <th className="px-4 py-3 text-left font-bold uppercase text-gray-600">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {busyAction === "list" && !plantations ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                        Loading plantations...
                      </td>
                    </tr>
                  ) : plantations && plantations.content.length > 0 ? (
                    plantations.content.map((plantation) => (
                      <tr
                        key={plantation.id}
                        className={`cursor-pointer transition ${
                          plantation.id === selectedPlantationId
                            ? "bg-green-50"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() => void loadDetail(plantation.id)}
                      >
                        <td className="px-4 py-4">
                          <div className="font-semibold text-gray-900">
                            {plantation.name}
                          </div>
                          <div className="mt-1 font-mono text-xs text-gray-500">
                            {plantation.code}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 font-mono text-gray-900">
                          {formatNumber(plantation.area)} ha
                        </td>
                        <td className="px-4 py-4 text-gray-700">
                          {plantation.mandorName || "-"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-gray-700">
                          {plantation.driverCount}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-gray-500">
                          {formatDateTime(plantation.createdAt)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                        No plantations found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-gray-500">
                {plantations
                  ? `Page ${plantations.page + 1} of ${Math.max(
                      plantations.totalPages,
                      1
                    )} - ${plantations.totalElements} records`
                  : "Page 1 of 1 - 0 records"}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  className={secondaryButtonClass}
                  disabled={!plantations || plantations.page <= 0 || busyAction === "list"}
                  onClick={() => void loadPlantations((plantations?.page ?? 0) - 1)}
                >
                  Previous
                </button>
                <button
                  type="button"
                  className={secondaryButtonClass}
                  disabled={
                    !plantations ||
                    plantations.page + 1 >= plantations.totalPages ||
                    busyAction === "list"
                  }
                  onClick={() => void loadPlantations((plantations?.page ?? 0) + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Selected Plantation
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {selectedListItem?.code || selectedDetail?.code || "No selection"}
                  </p>
                </div>
                {busyAction === "detail" && (
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                    Loading
                  </span>
                )}
              </div>

              <div className="mt-4">
                <FeedbackBanner feedback={detailFeedback} />
              </div>

              {selectedDetail ? (
                <div className="mt-5 space-y-5">
                  <div>
                    <h3 className="text-2xl font-bold text-green-950">
                      {selectedDetail.name}
                    </h3>
                    <p className="mt-1 font-mono text-xs text-gray-500">
                      {selectedDetail.id}
                    </p>
                  </div>

                  <dl className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-md bg-gray-50 p-3">
                      <dt className="font-semibold text-gray-500">Area</dt>
                      <dd className="mt-1 font-mono text-gray-900">
                        {formatNumber(selectedDetail.area)} ha
                      </dd>
                    </div>
                    <div className="rounded-md bg-gray-50 p-3">
                      <dt className="font-semibold text-gray-500">Drivers</dt>
                      <dd className="mt-1 font-mono text-gray-900">
                        {selectedDetail.drivers.totalElements}
                      </dd>
                    </div>
                    <div className="rounded-md bg-gray-50 p-3">
                      <dt className="font-semibold text-gray-500">Created</dt>
                      <dd className="mt-1 text-gray-900">
                        {formatDateTime(selectedDetail.createdAt)}
                      </dd>
                    </div>
                    <div className="rounded-md bg-gray-50 p-3">
                      <dt className="font-semibold text-gray-500">Updated</dt>
                      <dd className="mt-1 text-gray-900">
                        {formatDateTime(selectedDetail.updatedAt)}
                      </dd>
                    </div>
                  </dl>

                  <div className="rounded-md border border-green-200 bg-green-50 p-4">
                    <p className="text-sm font-bold text-green-950">
                      Mandor
                    </p>
                    {selectedDetail.mandor ? (
                      <div className="mt-2 text-sm text-green-950">
                        <p className="font-semibold">{selectedDetail.mandor.name}</p>
                        <p className="mt-1 text-green-800">
                          {selectedDetail.mandor.email || selectedDetail.mandor.id}
                        </p>
                        {selectedDetail.mandor.certificationNumber && (
                          <p className="mt-1 font-mono text-xs text-green-800">
                            {selectedDetail.mandor.certificationNumber}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-green-800">No mandor assigned.</p>
                    )}
                  </div>

                  <div>
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <h3 className="font-bold text-gray-900">Drivers</h3>
                      <form
                        className="flex gap-2"
                        onSubmit={(event) => {
                          event.preventDefault();
                          void loadDetail(selectedDetail.id, 0, driverNameFilter);
                        }}
                      >
                        <input
                          value={driverNameFilter}
                          onChange={(event) => setDriverNameFilter(event.target.value)}
                          className="w-36 rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600"
                          placeholder="Driver name"
                        />
                        <button type="submit" className={secondaryButtonClass}>
                          Filter
                        </button>
                      </form>
                    </div>

                    {selectedDetail.drivers.content.length > 0 ? (
                      <div className="space-y-2">
                        {selectedDetail.drivers.content.map((driver) => (
                          <div
                            key={driver.id}
                            className="flex items-center justify-between gap-3 rounded-md border border-gray-200 px-3 py-3"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-gray-900">
                                {driver.name}
                              </p>
                              <p className="truncate text-xs text-gray-500">
                                {driver.email || driver.id}
                              </p>
                            </div>
                            <button
                              type="button"
                              className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-50 disabled:opacity-50"
                              disabled={busyAction === "unassign-driver"}
                              onClick={() => handleUnassignDriver(driver)}
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyDrivers />
                    )}

                    <div className="mt-3 flex items-center justify-between gap-3 text-sm text-gray-500">
                      <span>
                        Driver page {selectedDetail.drivers.page + 1} of{" "}
                        {Math.max(selectedDetail.drivers.totalPages, 1)}
                      </span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className={secondaryButtonClass}
                          disabled={selectedDetail.drivers.page <= 0}
                          onClick={() =>
                            void loadDetail(
                              selectedDetail.id,
                              selectedDetail.drivers.page - 1
                            )
                          }
                        >
                          Previous
                        </button>
                        <button
                          type="button"
                          className={secondaryButtonClass}
                          disabled={
                            selectedDetail.drivers.page + 1 >=
                            selectedDetail.drivers.totalPages
                          }
                          onClick={() =>
                            void loadDetail(
                              selectedDetail.id,
                              selectedDetail.drivers.page + 1
                            )
                          }
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="mt-5 text-sm text-gray-500">
                  Select a plantation row to inspect assignments.
                </p>
              )}
            </section>
          </aside>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Create Plantation
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  New records require a stable code and four rectangle points.
                </p>
              </div>
              <button
                type="button"
                className={secondaryButtonClass}
                onClick={() => {
                  setCreateForm(emptyCreateForm);
                  setCreateCoordinates(defaultRectangle());
                }}
              >
                Clear
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className={labelClass} htmlFor="create-name">
                    Name
                  </label>
                  <input
                    id="create-name"
                    value={createForm.name}
                    onChange={(event) =>
                      setCreateForm((previous) => ({
                        ...previous,
                        name: event.target.value,
                      }))
                    }
                    className={`${inputClass} mt-1`}
                    placeholder="North Block"
                    required
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="create-code">
                    Code
                  </label>
                  <input
                    id="create-code"
                    value={createForm.code}
                    onChange={(event) =>
                      setCreateForm((previous) => ({
                        ...previous,
                        code: event.target.value,
                      }))
                    }
                    className={`${inputClass} mt-1`}
                    placeholder="PLT-001"
                    required
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="create-area">
                    Area (ha)
                  </label>
                  <input
                    id="create-area"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={createForm.area}
                    onChange={(event) =>
                      setCreateForm((previous) => ({
                        ...previous,
                        area: event.target.value,
                      }))
                    }
                    className={`${inputClass} mt-1`}
                    placeholder="120.5"
                    required
                  />
                </div>
              </div>

              <CoordinateEditor
                coordinates={createCoordinates}
                onChange={setCreateCoordinates}
              />

              <div className="flex justify-end border-t border-gray-100 pt-5">
                <button
                  type="submit"
                  className={primaryButtonClass}
                  disabled={busyAction === "create"}
                >
                  {busyAction === "create" ? "Creating..." : "Create Plantation"}
                </button>
              </div>
            </form>
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-5">
              <h2 className="text-xl font-bold text-gray-900">
                Update Selected
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Plantation code is locked by the backend.
              </p>
            </div>

            <form onSubmit={handleUpdate} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className={labelClass} htmlFor="edit-name">
                    Name
                  </label>
                  <input
                    id="edit-name"
                    value={editForm.name}
                    onChange={(event) =>
                      setEditForm((previous) => ({
                        ...previous,
                        name: event.target.value,
                      }))
                    }
                    className={`${inputClass} mt-1`}
                    disabled={!selectedDetail}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="edit-code">
                    Code
                  </label>
                  <input
                    id="edit-code"
                    value={editForm.code}
                    className={`${inputClass} mt-1 bg-gray-100 text-gray-500`}
                    disabled
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="edit-area">
                    Area (ha)
                  </label>
                  <input
                    id="edit-area"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={editForm.area}
                    onChange={(event) =>
                      setEditForm((previous) => ({
                        ...previous,
                        area: event.target.value,
                      }))
                    }
                    className={`${inputClass} mt-1`}
                    disabled={!selectedDetail}
                    required
                  />
                </div>
              </div>

              <CoordinateEditor
                coordinates={editCoordinates}
                onChange={setEditCoordinates}
              />

              <div className="flex justify-end border-t border-gray-100 pt-5">
                <button
                  type="submit"
                  className={primaryButtonClass}
                  disabled={!selectedDetail || busyAction === "update"}
                >
                  {busyAction === "update" ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </section>
        </div>

        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-gray-900">Assignments</h2>
            <p className="mt-1 text-sm text-gray-500">
              Assignment actions apply to the selected plantation.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <form onSubmit={handleAssignMandor} className="space-y-4">
              <h3 className="font-bold text-gray-900">Mandor</h3>
              <div>
                <label className={labelClass} htmlFor="mandor-id">
                  Mandor ID
                </label>
                <input
                  id="mandor-id"
                  value={assignmentForm.mandorId}
                  onChange={(event) =>
                    setAssignmentForm((previous) => ({
                      ...previous,
                      mandorId: event.target.value,
                    }))
                  }
                  className={`${inputClass} mt-1`}
                  placeholder="UUID"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <div>
                  <label className={labelClass} htmlFor="mandor-reassign">
                    Reassign To Plantation ID
                  </label>
                  <input
                    id="mandor-reassign"
                    value={assignmentForm.reassignMandorTo}
                    onChange={(event) =>
                      setAssignmentForm((previous) => ({
                        ...previous,
                        reassignMandorTo: event.target.value,
                      }))
                    }
                    className={`${inputClass} mt-1`}
                    placeholder="Optional"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <button
                    type="submit"
                    className={primaryButtonClass}
                    disabled={!selectedDetail || busyAction === "assign-mandor"}
                  >
                    Assign
                  </button>
                  <button
                    type="button"
                    className={secondaryButtonClass}
                    disabled={
                      !selectedDetail?.mandor || busyAction === "unassign-mandor"
                    }
                    onClick={handleUnassignMandor}
                  >
                    Unassign
                  </button>
                </div>
              </div>
            </form>

            <form onSubmit={handleAssignDriver} className="space-y-4">
              <h3 className="font-bold text-gray-900">Driver</h3>
              <div>
                <label className={labelClass} htmlFor="driver-id">
                  Driver ID
                </label>
                <input
                  id="driver-id"
                  value={assignmentForm.driverId}
                  onChange={(event) =>
                    setAssignmentForm((previous) => ({
                      ...previous,
                      driverId: event.target.value,
                    }))
                  }
                  className={`${inputClass} mt-1`}
                  placeholder="UUID"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <div>
                  <label className={labelClass} htmlFor="driver-reassign">
                    Reassign Removed Driver To
                  </label>
                  <input
                    id="driver-reassign"
                    value={assignmentForm.reassignDriverTo}
                    onChange={(event) =>
                      setAssignmentForm((previous) => ({
                        ...previous,
                        reassignDriverTo: event.target.value,
                      }))
                    }
                    className={`${inputClass} mt-1`}
                    placeholder="Optional plantation ID"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className={primaryButtonClass}
                    disabled={!selectedDetail || busyAction === "assign-driver"}
                  >
                    Assign Driver
                  </button>
                </div>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
