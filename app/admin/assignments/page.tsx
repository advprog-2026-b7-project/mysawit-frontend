"use client";

import React, { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { AssignmentList } from "@/features/profile";
import AssignmentModal from "@/features/profile/components/AssignmentModal";
import { getUsersByRoleApi } from "@/features/profile/api";
import Button from "@/components/ui/Button";
import type { UserProfile } from "@/features/profile/types";
import { useRoleDashboard } from "@/features/admin/useRoleDashboard";

export default function AdminAssignmentsPage() {
  const { user, loading: authLoading } = useRoleDashboard("ADMIN");
  const [buruhList, setBuruhList] = useState<UserProfile[]>([]);
  const [mandorList, setMandorList] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedBuruh, setSelectedBuruh] = useState<UserProfile | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (authLoading || !user) return;

    async function loadUsers() {
      setLoading(true);
      setError(null);
      try {
        const [buruh, mandor] = await Promise.all([
          getUsersByRoleApi("BURUH"),
          getUsersByRoleApi("MANDOR"),
        ]);
        setBuruhList(Array.isArray(buruh) ? buruh : []);
        setMandorList(Array.isArray(mandor) ? mandor : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memuat data pengguna");
      } finally {
        setLoading(false);
      }
    }

    void loadUsers();
  }, [authLoading, user]);

  const handleOpenAssignmentModal = (buruh: UserProfile) => {
    setSelectedBuruh(buruh);
    setShowAssignmentModal(true);
  };

  const handleAssignmentSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <AdminLayout activePage="Assignments" currentUser={user}>
      <div className="mx-auto flex max-w-[1280px] flex-col gap-8">
        <header>
          <h1
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 700,
              fontSize: 50,
              color: "#5B2012",
              lineHeight: 1.05,
            }}
          >
            Assignments
          </h1>
          <p
            style={{
              marginTop: 12,
              fontFamily: "'Lato', sans-serif",
              fontWeight: 400,
              fontSize: 16,
              color: "#52443D",
            }}
          >
            Assign buruh to mandor and maintain active field supervision.
          </p>
        </header>

        {error && (
          <div
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

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
          <section
            style={{
              background: "#FFFFFF",
              border: "1px solid #DBC1B9",
              borderRadius: 12,
              boxShadow: "0px 4px 20px rgba(91,32,18,0.06)",
              padding: 28,
            }}
          >
            <h2
              style={{
                fontFamily: "'Lato', sans-serif",
                fontWeight: 700,
                fontSize: 16,
                color: "#5B2012",
              }}
            >
              Pilih Buruh
            </h2>
            <p
              style={{
                marginTop: 8,
                fontFamily: "'Lato', sans-serif",
                fontSize: 14,
                color: "#52443D",
              }}
            >
              Klik buruh untuk memilih mandor yang akan menjadi supervisornya.
            </p>

            <div className="mt-6 max-h-[520px] space-y-3 overflow-y-auto pr-1">
              {loading || authLoading ? (
                <div className="py-8 text-center" style={{ color: "#53433D" }}>
                  Memuat buruh...
                </div>
              ) : buruhList.length === 0 ? (
                <div className="py-8 text-center" style={{ color: "#53433D" }}>
                  Tidak ada Buruh ditemukan.
                </div>
              ) : (
                buruhList.map((buruh) => (
                  <button
                    key={buruh.id}
                    type="button"
                    onClick={() => handleOpenAssignmentModal(buruh)}
                    className="w-full text-left transition"
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid #DBC1B9",
                      borderRadius: 12,
                      padding: "14px 16px",
                    }}
                  >
                    <p
                      style={{
                        fontFamily: "'Lato', sans-serif",
                        fontWeight: 700,
                        fontSize: 16,
                        color: "#1B1C1B",
                      }}
                    >
                      {buruh.nama || buruh.username}
                    </p>
                    <p
                      style={{
                        marginTop: 4,
                        fontFamily: "'Lato', sans-serif",
                        fontSize: 13,
                        color: "#52443D",
                      }}
                    >
                      {buruh.email}
                    </p>
                  </button>
                ))
              )}
            </div>

            <div className="mt-6">
              <Button type="button" variant="secondary" onClick={() => setRefreshKey((prev) => prev + 1)}>
                Refresh Assignments
              </Button>
            </div>
          </section>

          <AssignmentList
            key={refreshKey}
            onRefresh={handleAssignmentSuccess}
            isLoading={loading}
          />
        </div>
      </div>

      <AssignmentModal
        isOpen={showAssignmentModal}
        onClose={() => {
          setShowAssignmentModal(false);
          setSelectedBuruh(null);
        }}
        buruh={selectedBuruh}
        mandors={mandorList}
        isLoading={loading}
        onSuccess={handleAssignmentSuccess}
      />
    </AdminLayout>
  );
}
