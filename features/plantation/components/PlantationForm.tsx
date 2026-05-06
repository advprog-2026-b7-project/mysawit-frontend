"use client";

import { useState } from "react";
import { plantationClient } from "@/features/plantation/api";
import type {
  Coordinate,
  DriverAssignmentResponse,
  MandorAssignmentResponse,
  PlantationResponse,
  PlantationUpdateRequest,
  PlantationUpdateResponse,
} from "@/features/plantation/types";

type CoordinateDraft = {
  x: string;
  y: string;
};

type Feedback = {
  type: "success" | "error";
  message: string;
};

type LatestResult = {
  title: string;
  payload: unknown;
};

type PlantationAction =
  | "create"
  | "update"
  | "delete"
  | "assign-mandor"
  | "assign-driver";

type CreateFormState = {
  name: string;
  code: string;
  area: string;
};

type UpdateFormState = {
  plantationId: string;
  name: string;
  area: string;
  includeCoordinates: boolean;
};

const emptyCreateForm: CreateFormState = {
  name: "",
  code: "",
  area: "",
};

const emptyUpdateForm: UpdateFormState = {
  plantationId: "",
  name: "",
  area: "",
  includeCoordinates: false,
};

const defaultRectangle = (): CoordinateDraft[] => [
  { x: "0", y: "0" },
  { x: "10", y: "0" },
  { x: "10", y: "10" },
  { x: "0", y: "10" },
];

const coordinateLabels = ["Bottom-left", "Bottom-right", "Top-right", "Top-left"];

const inputClass =
  "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500";

const labelClass = "text-sm font-semibold text-gray-800";

const secondaryButtonClass =
  "rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50";

const primaryButtonClass =
  "rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50";

const dangerButtonClass =
  "rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50";

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

function formatDateTime(value?: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function SummaryItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </dt>
      <dd className="mt-1 break-words text-sm font-medium text-gray-900">
        {value}
      </dd>
    </div>
  );
}

function isPlantationSnapshot(
  value: unknown
): value is PlantationResponse | PlantationUpdateResponse {
  return typeof value === "object" && value !== null && "id" in value;
}

export default function PlantationForm() {
  const [createForm, setCreateForm] = useState<CreateFormState>(emptyCreateForm);
  const [createCoordinates, setCreateCoordinates] = useState<CoordinateDraft[]>(
    defaultRectangle()
  );
  const [updateForm, setUpdateForm] = useState<UpdateFormState>(emptyUpdateForm);
  const [updateCoordinates, setUpdateCoordinates] = useState<CoordinateDraft[]>(
    defaultRectangle()
  );
  const [deletePlantationId, setDeletePlantationId] = useState("");
  const [mandorPlantationId, setMandorPlantationId] = useState("");
  const [mandorId, setMandorId] = useState("");
  const [driverPlantationId, setDriverPlantationId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [busyAction, setBusyAction] = useState<PlantationAction | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [latestResult, setLatestResult] = useState<LatestResult | null>(null);
  const plantationSnapshot =
    latestResult && isPlantationSnapshot(latestResult.payload)
      ? latestResult.payload
      : null;

  const updateCoordinateDraft = (
    setter: React.Dispatch<React.SetStateAction<CoordinateDraft[]>>,
    index: number,
    field: keyof CoordinateDraft,
    value: string
  ) => {
    setter((previous) =>
      previous.map((coordinate, coordinateIndex) =>
        coordinateIndex === index
          ? { ...coordinate, [field]: value }
          : coordinate
      )
    );
  };

  const prefillPlantationId = (plantationId: string) => {
    setUpdateForm((previous) => ({ ...previous, plantationId }));
    setDeletePlantationId(plantationId);
    setMandorPlantationId(plantationId);
    setDriverPlantationId(plantationId);
  };

  const runAction = async (
    action: PlantationAction,
    task: () => Promise<Feedback>
  ) => {
    setBusyAction(action);
    setFeedback(null);

    try {
      const result = await task();
      setFeedback(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Request failed";
      setFeedback({ type: "error", message });
    } finally {
      setBusyAction(null);
    }
  };

  const handleCreate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    void runAction("create", async () => {
      if (!createForm.name.trim()) {
        throw new Error("Plantation name is required");
      }
      if (!createForm.code.trim()) {
        throw new Error("Plantation code is required");
      }

      const response: PlantationResponse = await plantationClient.createPlantation({
        name: createForm.name.trim(),
        code: createForm.code.trim(),
        area: parsePositiveNumber(createForm.area, "Area"),
        coordinates: parseCoordinates(createCoordinates),
      });

      prefillPlantationId(response.id);
      setCreateForm(emptyCreateForm);
      setCreateCoordinates(defaultRectangle());
      setLatestResult({ title: "Created Plantation", payload: response });

      return {
        type: "success",
        message: `Plantation ${response.code} created successfully`,
      };
    });
  };

  const handleUpdate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    void runAction("update", async () => {
      if (!updateForm.plantationId.trim()) {
        throw new Error("Plantation ID is required");
      }

      const payload: PlantationUpdateRequest = {};

      if (updateForm.name.trim()) {
        payload.name = updateForm.name.trim();
      }

      if (updateForm.area.trim()) {
        payload.area = parsePositiveNumber(updateForm.area, "Area");
      }

      if (updateForm.includeCoordinates) {
        payload.coordinates = parseCoordinates(updateCoordinates);
      }

      if (Object.keys(payload).length === 0) {
        throw new Error("Fill at least one field to update");
      }

      const response: PlantationUpdateResponse =
        await plantationClient.updatePlantation(
          updateForm.plantationId.trim(),
          payload
        );

      setLatestResult({ title: "Updated Plantation", payload: response });
      setUpdateForm((previous) => ({
        ...previous,
        name: "",
        area: "",
        includeCoordinates: false,
      }));

      return {
        type: "success",
        message: `Plantation ${response.code} updated successfully`,
      };
    });
  };

  const handleDelete = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    void runAction("delete", async () => {
      const plantationId = deletePlantationId.trim();
      if (!plantationId) {
        throw new Error("Plantation ID is required");
      }

      if (!window.confirm("Delete this plantation?")) {
        return { type: "success", message: "Delete cancelled" };
      }

      const message = await plantationClient.deletePlantation(plantationId);
      setLatestResult({ title: "Deleted Plantation", payload: { message } });
      setDeletePlantationId("");

      return {
        type: "success",
        message,
      };
    });
  };

  const handleAssignMandor = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    void runAction("assign-mandor", async () => {
      if (!mandorPlantationId.trim()) {
        throw new Error("Plantation ID is required");
      }
      if (!mandorId.trim()) {
        throw new Error("Mandor ID is required");
      }

      const response: MandorAssignmentResponse =
        await plantationClient.assignMandor(
          mandorPlantationId.trim(),
          mandorId.trim()
        );

      setLatestResult({ title: "Assigned Mandor", payload: response });

      return {
        type: "success",
        message: `${response.mandor.name} assigned as mandor`,
      };
    });
  };

  const handleAssignDriver = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    void runAction("assign-driver", async () => {
      if (!driverPlantationId.trim()) {
        throw new Error("Plantation ID is required");
      }
      if (!driverId.trim()) {
        throw new Error("Driver ID is required");
      }

      const response: DriverAssignmentResponse =
        await plantationClient.assignDriver(
          driverPlantationId.trim(),
          driverId.trim()
        );

      setLatestResult({ title: "Assigned Driver", payload: response });

      return {
        type: "success",
        message: `${response.driver.name} assigned as driver`,
      };
    });
  };

  const renderCoordinateInputs = (
    draft: CoordinateDraft[],
    setter: React.Dispatch<React.SetStateAction<CoordinateDraft[]>>
  ) => (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {draft.map((coordinate, index) => (
        <div key={coordinateLabels[index]} className="rounded-md border border-gray-200 p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-green-700">
            {coordinateLabels[index]}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              step="1"
              value={coordinate.x}
              onChange={(event) =>
                updateCoordinateDraft(setter, index, "x", event.target.value)
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
                updateCoordinateDraft(setter, index, "y", event.target.value)
              }
              className={inputClass}
              placeholder="Y"
              required
            />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 text-gray-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 border-b border-green-200 pb-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
            MySawit
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-green-900">
            Plantation
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-600">
            Admin workspace for plantation records and workforce assignment.
          </p>
        </header>

        {feedback && (
          <div
            className={`mb-6 rounded-md border px-4 py-3 text-sm ${
              feedback.type === "success"
                ? "border-green-200 bg-green-50 text-green-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            {feedback.message}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Register Plantation
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Rectangle coordinates use integer X and Y points.
              </p>
            </div>

            <form onSubmit={handleCreate} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="create-name">
                    Plantation Name
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
                    placeholder="North Palm Block"
                    required
                  />
                </div>

                <div>
                  <label className={labelClass} htmlFor="create-code">
                    Plantation Code
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

              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label className={labelClass}>Coordinates</label>
                  <button
                    type="button"
                    className="text-sm font-semibold text-green-700 hover:text-green-800"
                    onClick={() => setCreateCoordinates(defaultRectangle())}
                  >
                    Reset
                  </button>
                </div>
                {renderCoordinateInputs(createCoordinates, setCreateCoordinates)}
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  className={secondaryButtonClass}
                  disabled={busyAction === "create"}
                  onClick={() => {
                    setCreateForm(emptyCreateForm);
                    setCreateCoordinates(defaultRectangle());
                  }}
                >
                  Clear
                </button>
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

          <aside className="space-y-6">
            <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900">Latest Response</h2>

              {latestResult ? (
                <div className="mt-5 space-y-4">
                  <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm font-semibold text-green-800">
                    {latestResult.title}
                  </div>
                  <pre className="max-h-80 overflow-auto rounded-md bg-gray-900 p-4 text-xs leading-5 text-gray-100">
                    {JSON.stringify(latestResult.payload, null, 2)}
                  </pre>
                </div>
              ) : (
                <p className="mt-4 text-sm text-gray-500">
                  No plantation request has completed yet.
                </p>
              )}
            </section>

            {plantationSnapshot && (
                <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900">Snapshot</h2>
                  <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                    <SummaryItem label="ID" value={plantationSnapshot.id} />
                    <SummaryItem label="Code" value={plantationSnapshot.code} />
                    <SummaryItem
                      label="Area"
                      value={`${String(plantationSnapshot.area)} ha`}
                    />
                    <SummaryItem
                      label={"updatedAt" in plantationSnapshot ? "Updated" : "Created"}
                      value={formatDateTime(
                        "updatedAt" in plantationSnapshot
                          ? plantationSnapshot.updatedAt
                          : (plantationSnapshot as PlantationResponse).createdAt
                      )}
                    />
                  </dl>
                </section>
              )}
          </aside>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">Update Plantation</h2>

            <form onSubmit={handleUpdate} className="mt-5 space-y-5">
              <div>
                <label className={labelClass} htmlFor="update-id">
                  Plantation ID
                </label>
                <input
                  id="update-id"
                  value={updateForm.plantationId}
                  onChange={(event) =>
                    setUpdateForm((previous) => ({
                      ...previous,
                      plantationId: event.target.value,
                    }))
                  }
                  className={`${inputClass} mt-1`}
                  placeholder="UUID"
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="update-name">
                    New Name
                  </label>
                  <input
                    id="update-name"
                    value={updateForm.name}
                    onChange={(event) =>
                      setUpdateForm((previous) => ({
                        ...previous,
                        name: event.target.value,
                      }))
                    }
                    className={`${inputClass} mt-1`}
                    placeholder="Optional"
                  />
                </div>

                <div>
                  <label className={labelClass} htmlFor="update-area">
                    New Area (ha)
                  </label>
                  <input
                    id="update-area"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={updateForm.area}
                    onChange={(event) =>
                      setUpdateForm((previous) => ({
                        ...previous,
                        area: event.target.value,
                      }))
                    }
                    className={`${inputClass} mt-1`}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 text-sm font-semibold text-gray-800">
                <input
                  type="checkbox"
                  checked={updateForm.includeCoordinates}
                  onChange={(event) =>
                    setUpdateForm((previous) => ({
                      ...previous,
                      includeCoordinates: event.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                Replace coordinates
              </label>

              {updateForm.includeCoordinates &&
                renderCoordinateInputs(updateCoordinates, setUpdateCoordinates)}

              <div className="flex justify-end border-t border-gray-100 pt-5">
                <button
                  type="submit"
                  className={primaryButtonClass}
                  disabled={busyAction === "update"}
                >
                  {busyAction === "update" ? "Updating..." : "Update Plantation"}
                </button>
              </div>
            </form>
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">Assignments</h2>

            <div className="mt-5 grid gap-6">
              <form onSubmit={handleAssignMandor} className="space-y-4">
                <h3 className="text-base font-bold text-gray-800">Assign Mandor</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className={labelClass} htmlFor="mandor-plantation-id">
                      Plantation ID
                    </label>
                    <input
                      id="mandor-plantation-id"
                      value={mandorPlantationId}
                      onChange={(event) => setMandorPlantationId(event.target.value)}
                      className={`${inputClass} mt-1`}
                      placeholder="UUID"
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="mandor-id">
                      Mandor ID
                    </label>
                    <input
                      id="mandor-id"
                      value={mandorId}
                      onChange={(event) => setMandorId(event.target.value)}
                      className={`${inputClass} mt-1`}
                      placeholder="UUID"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className={primaryButtonClass}
                    disabled={busyAction === "assign-mandor"}
                  >
                    {busyAction === "assign-mandor"
                      ? "Assigning..."
                      : "Assign Mandor"}
                  </button>
                </div>
              </form>

              <div className="border-t border-gray-100" />

              <form onSubmit={handleAssignDriver} className="space-y-4">
                <h3 className="text-base font-bold text-gray-800">Assign Driver</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className={labelClass} htmlFor="driver-plantation-id">
                      Plantation ID
                    </label>
                    <input
                      id="driver-plantation-id"
                      value={driverPlantationId}
                      onChange={(event) => setDriverPlantationId(event.target.value)}
                      className={`${inputClass} mt-1`}
                      placeholder="UUID"
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="driver-id">
                      Driver ID
                    </label>
                    <input
                      id="driver-id"
                      value={driverId}
                      onChange={(event) => setDriverId(event.target.value)}
                      className={`${inputClass} mt-1`}
                      placeholder="UUID"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className={primaryButtonClass}
                    disabled={busyAction === "assign-driver"}
                  >
                    {busyAction === "assign-driver"
                      ? "Assigning..."
                      : "Assign Driver"}
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-lg border border-red-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">Delete Plantation</h2>

          <form onSubmit={handleDelete} className="mt-5 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <label className={labelClass} htmlFor="delete-id">
                Plantation ID
              </label>
              <input
                id="delete-id"
                value={deletePlantationId}
                onChange={(event) => setDeletePlantationId(event.target.value)}
                className={`${inputClass} mt-1`}
                placeholder="UUID"
                required
              />
            </div>
            <button
              type="submit"
              className={dangerButtonClass}
              disabled={busyAction === "delete"}
            >
              {busyAction === "delete" ? "Deleting..." : "Delete Plantation"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
