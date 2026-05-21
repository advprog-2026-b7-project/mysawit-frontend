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
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #DBC1B9",
        borderRadius: 12,
        boxShadow: "0px 4px 20px rgba(91,32,18,0.06)",
        padding: 28,
      }}
    >
      <div className="flex justify-between items-center mb-6">
        <h2
          style={{
            fontFamily: "'Lato', sans-serif",
            fontWeight: 700,
            fontSize: 16,
            color: "#5B2012",
          }}
        >
          Daftar Assignment
        </h2>
        <Button
          variant="secondary"
          onClick={loadAssignments}
          disabled={isLoading}
        >
          {isLoading ? "Memuat..." : "Refresh"}
        </Button>
      </div>

      {error && (
        <div
          className="mb-4"
          style={{
            background: "rgba(186,26,26,0.08)",
            border: "1px solid rgba(186,26,26,0.2)",
            borderRadius: 8,
            padding: "12px 16px",
            fontFamily: "'Lato', sans-serif",
            fontSize: 14,
            color: "#BA1A1A",
          }}
        >
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div style={{ fontFamily: "'Lato', sans-serif", fontSize: 16, color: "#53433D" }}>
              Memuat assignment...
            </div>
          </div>
        ) : assignments.length === 0 ? (
          <div className="text-center py-12" style={{ color: "#53433D" }}>
            <p>Tidak ada assignment ditemukan</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ background: "#F6F3F1", borderBottom: "1px solid #DBC1B9" }}>
                <th className="text-left px-4 py-3" style={{ color: "#52443D", fontWeight: 700, fontSize: 14, letterSpacing: 0.7 }}>
                  Buruh
                </th>
                <th className="text-left px-4 py-3" style={{ color: "#52443D", fontWeight: 700, fontSize: 14, letterSpacing: 0.7 }}>
                  Mandor
                </th>
                <th className="text-center px-4 py-3" style={{ color: "#52443D", fontWeight: 700, fontSize: 14, letterSpacing: 0.7 }}>
                  Tanggal Dibuat
                </th>
                <th className="text-center px-4 py-3" style={{ color: "#52443D", fontWeight: 700, fontSize: 14, letterSpacing: 0.7 }}>
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((assignment) => (
                <tr
                  key={assignment.id}
                  style={{ borderBottom: "1px solid #DBC1B9" }}
                >
                  <td className="px-4 py-3" style={{ color: "#1B1C1B", fontWeight: 600 }}>
                    {assignment.buruhName || assignment.buruhNama || assignment.buruhId}
                  </td>
                  <td className="px-4 py-3" style={{ color: "#1B1C1B", fontWeight: 600 }}>
                    {assignment.mandorName || assignment.mandorNama || assignment.mandorId}
                  </td>
                  <td className="px-4 py-3 text-center" style={{ color: "#53433D" }}>
                    {assignment.createdAt || assignment.assignedAt
                      ? new Date(assignment.createdAt || assignment.assignedAt || "").toLocaleDateString("id-ID")
                      : "-"}
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
