"use client";

import { useState } from "react";
import { plantationClient } from "@/features/plantation/api";

type CoordPair = [number, number];

interface PlantationFormProps {
  onSuccess?: (plantationId: string) => void;
}

const CORNER_LABELS = [
  "Top-Left (NW)",
  "Top-Right (NE)",
  "Bottom-Right (SE)",
  "Bottom-Left (SW)",
];

const emptyCoordinates = (): CoordPair[] => [
  [0, 0], [0, 0], [0, 0], [0, 0],
];

export default function PlantationForm({ onSuccess }: PlantationFormProps) {
  const [plantationCode, setPlantationCode] = useState("");
  const [plantationName, setPlantationName] = useState("");
  const [areaSize, setAreaSize] = useState("");
  const [coordinates, setCoordinates] = useState<CoordPair[]>(
    emptyCoordinates()
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const updateCoordinate = (index: number, axisIndex: number, value: string) => {
    setCoordinates((prev) =>
      prev.map((pair, i) => {
        if (i !== index) return pair;
        const next: CoordPair = [pair[0], pair[1]];
        next[axisIndex] = value ? parseFloat(value) : 0;
        return next;
      })
    );
  };

  const resetForm = () => {
    setPlantationCode("");
    setPlantationName("");
    setAreaSize("");
    setCoordinates(emptyCoordinates());
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!plantationCode.trim()) {
      setError("Plantation code is required");
      return;
    }
    if (!plantationName.trim()) {
      setError("Plantation name is required");
      return;
    }
    if (!areaSize || parseFloat(areaSize) <= 0) {
      setError("Area size must be a positive number");
      return;
    }

    setLoading(true);

    try {
      const response = await plantationClient.createPlantation({
        name: plantationName.trim(),
        code: plantationCode.trim(),
        area: parseFloat(areaSize),
        coordinates,
      });
      const createdId = response.id || "(ID unavailable)";
      setSuccess(`Plantation created successfully! ID: ${createdId}`);
      resetForm();

      if (onSuccess && response.id) {
        onSuccess(response.id);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      console.error("Error creating plantation:", err);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full border border-gray-300 rounded-md px-3 py-2 mt-1 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:outline-none";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-10">
      <div className="max-w-xl w-full bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Register Plantation
        </h1>

        <p className="text-gray-700 text-center mb-6">
          Fill in the details below to register a new plantation
        </p>

        {error && (
          <div className="bg-red-50 border border-red-300 text-red-800 text-sm p-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-300 text-green-800 text-sm p-3 rounded mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-900">
              Plantation Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={plantationCode}
              onChange={(e) => setPlantationCode(e.target.value)}
              placeholder="e.g. PLANT-001"
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-900">
              Plantation Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={plantationName}
              onChange={(e) => setPlantationName(e.target.value)}
              placeholder="e.g. Palm Field A"
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-900">
              Area Size (hectares) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={areaSize}
              onChange={(e) => setAreaSize(e.target.value)}
              placeholder="e.g. 120.5"
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-900 block mb-2">
              Square Coordinates (4 corners) <span className="text-red-500">*</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {coordinates.map((pair, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-md p-3 bg-gray-50"
                >
                  <p className="text-xs font-semibold text-green-700 mb-2">
                    Point {index + 1} — {CORNER_LABELS[index]}
                  </p>
                  <input
                    type="number"
                    step="any"
                    value={pair[0] || ""}
                    onChange={(e) => updateCoordinate(index, 0, e.target.value)}
                    placeholder="Latitude"
                    className={inputClass + " text-sm mb-2"}
                    required
                  />
                  <input
                    type="number"
                    step="any"
                    value={pair[1] || ""}
                    onChange={(e) => updateCoordinate(index, 1, e.target.value)}
                    placeholder="Longitude"
                    className={inputClass + " text-sm"}
                    required
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium py-2 rounded-md transition"
            >
              {loading ? "Submitting..." : "Register Plantation"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              disabled={loading}
              className="flex-1 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 rounded-md transition"
            >
              Clear Form
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
