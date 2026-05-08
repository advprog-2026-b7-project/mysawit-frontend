"use client";

import React, { useState, useEffect } from "react";
import type { AssignmentResponse, UserProfile } from "../types";
import { getAllAssignmentsApi, deleteAssignmentApi, getUsersByRoleApi } from "../api";
import Button from "@/components/ui/Button";
import ReassignmentModal from "./ReassignmentModal";

interface AssignmentListProps {
  onRefresh?: () => void;
  isLoading?: boolean;
}

export default function AssignmentList({
  onRefresh,
  isLoading: externalLoading = false,
}: AssignmentListProps) {
  const [assignments, setAssignments] = useState<AssignmentResponse[]>([]);
  const [mandors, setMandors] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentResponse | null>(null);
  const [showReassignModal, setShowReassignModal] = useState(false);

  const loadAssignments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllAssignmentsApi();
      setAssignments(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Gagal mengambil data assignment";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const loadMandors = async () => {
    try {
      const data = await getUsersByRoleApi("MANDOR");
      setMandors(data);
    } catch (err) {
      console.error("Gagal mengambil data Mandor:", err);
    }
  };

  useEffect(() => {
    loadAssignments();
    loadMandors();
  }, []);

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!confirm("Yakin ingin menghapus assignment ini?")) return;

    try {
      await deleteAssignmentApi(assignmentId);
      setAssignments((prev) =>
        prev.filter((a) => a.id !== assignmentId)
      );
      onRefresh?.();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Gagal menghapus assignment";
      alert(message);
    }
  };

  const handleOpenReassignModal = (assignment: AssignmentResponse) => {
    setSelectedAssignment(assignment);
    setShowReassignModal(true);
  };

  const handleReassignSuccess = () => {
    loadAssignments();
    onRefresh?.();
  };

  const isLoading = loading || externalLoading;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Daftar Assignment</h2>
        <Button
          variant="primary"
          onClick={loadAssignments}
          disabled={isLoading}
        >
          {isLoading ? "Memuat..." : "Refresh"}
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-300 text-red-800 text-sm p-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : assignments.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>Tidak ada assignment ditemukan</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left px-4 py-3 font-semibold text-gray-700">
                  Buruh
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">
                  Mandor
                </th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700">
                  Tanggal Dibuat
                </th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((assignment) => (
                <tr
                  key={assignment.id}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <td className="px-4 py-3 text-gray-800">
                    {assignment.buruhName}
                  </td>
                  <td className="px-4 py-3 text-gray-800">
                    {assignment.mandorName}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-center">
                    {new Date(assignment.createdAt).toLocaleDateString("id-ID")}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex gap-2 justify-center">
                      <Button
                        variant="secondary"
                        onClick={() => handleOpenReassignModal(assignment)}
                        className="px-3 py-1 text-sm"
                      >
                        Reassign
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleDeleteAssignment(assignment.id)}
                        className="px-3 py-1 text-sm"
                      >
                        Hapus
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ReassignmentModal
        isOpen={showReassignModal}
        onClose={() => {
          setShowReassignModal(false);
          setSelectedAssignment(null);
        }}
        assignment={selectedAssignment}
        mandors={mandors}
        onSuccess={handleReassignSuccess}
      />
    </div>
  );
}
