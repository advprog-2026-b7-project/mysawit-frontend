'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, HardHatIcon, HistoryIcon, ShieldCheckIcon, TruckIcon, WalletIcon, XCircleIcon } from '@/components/layout/AdminIcons';
import { WageVariables } from '../types';
import { useWageVariables } from '../hooks';

interface WageVariablesFormProps {
  onSave?: (variables: WageVariables) => void;
}

const WageVariablesForm: React.FC<WageVariablesFormProps> = ({ onSave }) => {
  const { variables, loading, error, fetch, update } = useWageVariables();
  const [formData, setFormData] = useState<WageVariables>({
    upahBuruhPerKg: 0,
    upahSupirPerKg: 0,
    upahMandorPerKg: 0,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Load existing variables on mount
  useEffect(() => {
    const loadVariables = async () => {
      try {
        await fetch();
      } catch (err) {
        console.error('Failed to load wage variables:', err);
      }
    };
    loadVariables();
  }, [fetch]);

  // Update form when variables change
  useEffect(() => {
    if (variables) {
      setFormData(variables);
    }
  }, [variables]);

  const handleChange = (field: keyof WageVariables, value: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage('');

    try {
      const updated = await update(formData);
      setSuccessMessage('Variabel upah berhasil diperbarui!');
      setIsEditing(false);
      onSave?.(updated);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Failed to save wage variables:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (variables) {
      setFormData(variables);
    }
    setIsEditing(false);
  };

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-[#5B2012]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-3xl border border-[#DBC1B9] bg-white p-6 shadow-[0_12px_40px_rgba(91,32,18,0.06)] text-[#211A18]">
      <div className="flex items-center justify-between gap-4">
        <h2 className="flex items-center gap-2 text-3xl font-bold text-[#5B2012]">
          <span className="inline-flex text-current">
            <ShieldCheckIcon width={24} height={24} />
          </span>
          Pengaturan Variabel Upah
        </h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="rounded-2xl bg-[#5B2012] px-4 py-2 font-bold text-white shadow-md transition hover:bg-[#472011]"
          >
            Edit
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-2xl border border-[#E4C9C1] bg-[#FFF4F0] px-4 py-3 font-semibold text-[#BA1A1A]">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="rounded-2xl border border-[#CFE0C2] bg-[#F0F7EA] px-4 py-3 font-semibold text-[#4C6430]">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-3xl border border-[#DCCBC3] bg-[#FFFDFC] p-5 shadow-[0_8px_24px_rgba(91,32,18,0.04)] transition hover:shadow-[0_12px_32px_rgba(91,32,18,0.08)]">
          <label className="mb-2 block text-sm font-bold text-[#5B2012]">
            <span className="mr-2 inline-flex align-middle text-[#4C6430]">
              <HardHatIcon width={16} height={16} />
            </span>
            Upah Buruh per Kg
          </label>
          <p className="mb-4 rounded-2xl border border-[#E7D7D0] bg-[#F8F2EC] p-3 font-mono text-xs text-[#52443D]">
            Rumus: Upah Buruh = Upah/Kg × Kilogram Panen × 90%
          </p>
          {!isEditing ? (
            <div className="text-3xl font-bold text-[#4C6430]">{formatRupiah(formData.upahBuruhPerKg)}</div>
          ) : (
            <input
              type="number"
              value={formData.upahBuruhPerKg}
              onChange={(e) => handleChange('upahBuruhPerKg', parseFloat(e.target.value))}
              className="w-full rounded-2xl border border-[#DCCBC3] px-4 py-2 text-lg font-semibold focus:border-[#4C6430] focus:outline-none focus:ring-2 focus:ring-[#4C6430]/20"
              min="0"
              step="1000"
            />
          )}
        </div>

        <div className="rounded-3xl border border-[#DCCBC3] bg-[#FFFDFC] p-5 shadow-[0_8px_24px_rgba(91,32,18,0.04)] transition hover:shadow-[0_12px_32px_rgba(91,32,18,0.08)]">
          <label className="mb-2 block text-sm font-bold text-[#5B2012]">
            <span className="mr-2 inline-flex align-middle text-[#2F5F8A]">
              <TruckIcon width={16} height={16} />
            </span>
            Upah Supir Truk per Kg
          </label>
          <p className="mb-4 rounded-2xl border border-[#E7D7D0] bg-[#F8F2EC] p-3 font-mono text-xs text-[#52443D]">
            Rumus: Upah Supir = Upah/Kg × Kilogram Kirim × 90%
          </p>
          {!isEditing ? (
            <div className="text-3xl font-bold text-[#2F5F8A]">{formatRupiah(formData.upahSupirPerKg)}</div>
          ) : (
            <input
              type="number"
              value={formData.upahSupirPerKg}
              onChange={(e) => handleChange('upahSupirPerKg', parseFloat(e.target.value))}
              className="w-full rounded-2xl border border-[#DCCBC3] px-4 py-2 text-lg font-semibold focus:border-[#2F5F8A] focus:outline-none focus:ring-2 focus:ring-[#2F5F8A]/20"
              min="0"
              step="1000"
            />
          )}
        </div>

        <div className="rounded-3xl border border-[#DCCBC3] bg-[#FFFDFC] p-5 shadow-[0_8px_24px_rgba(91,32,18,0.04)] transition hover:shadow-[0_12px_32px_rgba(91,32,18,0.08)]">
          <label className="mb-2 block text-sm font-bold text-[#5B2012]">
            <span className="mr-2 inline-flex align-middle text-[#A35A3A]">
              <WalletIcon width={16} height={16} />
            </span>
            Upah Mandor per Kg
          </label>
          <p className="mb-4 rounded-2xl border border-[#E7D7D0] bg-[#F8F2EC] p-3 font-mono text-xs text-[#52443D]">
            Rumus: Upah Mandor = Upah/Kg × Kilogram Akui Pabrik × 90%
          </p>
          {!isEditing ? (
            <div className="text-3xl font-bold text-[#A35A3A]">{formatRupiah(formData.upahMandorPerKg)}</div>
          ) : (
            <input
              type="number"
              value={formData.upahMandorPerKg}
              onChange={(e) => handleChange('upahMandorPerKg', parseFloat(e.target.value))}
              className="w-full rounded-2xl border border-[#DCCBC3] px-4 py-2 text-lg font-semibold focus:border-[#A35A3A] focus:outline-none focus:ring-2 focus:ring-[#A35A3A]/20"
              min="0"
              step="1000"
            />
          )}
        </div>

        <div className="rounded-3xl border border-[#E3D4CD] bg-[#FBF4EA] p-5">
          <h4 className="mb-3 flex items-center gap-2 font-bold text-[#5B2012]">
            <span className="inline-flex text-[#8A4B2F]">
              <ShieldCheckIcon width={16} height={16} />
            </span>
            Informasi Penting
          </h4>
          <ul className="space-y-2 text-sm font-semibold text-[#8A4B2F]">
            <li className="flex items-start gap-2">
              <CheckCircleIcon width={16} height={16} />
              <span>Ketiga variabel digunakan untuk menghitung gaji otomatis</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircleIcon width={16} height={16} />
              <span>Setiap gaji dikurangi 10% (maksimum pembayaran 90%)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircleIcon width={16} height={16} />
              <span>Perubahan berlaku untuk penggajian baru saja</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircleIcon width={16} height={16} />
              <span>Verifikasi nilai sebelum menyimpan</span>
            </li>
          </ul>
        </div>

        {isEditing && (
          <div className="flex gap-3 border-t border-[#E7D7D0] pt-6">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 rounded-2xl bg-[#F3ECE8] px-4 py-3 font-bold text-[#5B2012] transition hover:bg-[#E9DDD7] disabled:bg-gray-300"
              disabled={isSaving}
            >
              <span className="mr-2 inline-flex align-middle">
                <XCircleIcon width={14} height={14} />
              </span>
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 rounded-2xl bg-[#5B2012] px-4 py-3 font-bold text-white shadow-md transition hover:bg-[#472011] disabled:bg-gray-400"
              disabled={isSaving}
            >
              <span className="mr-2 inline-flex align-middle">
                <CheckCircleIcon width={14} height={14} />
              </span>
              {isSaving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        )}
      </form>

      {variables?.updatedAt && (
        <div className="border-t border-[#E7D7D0] pt-4 text-center text-xs font-semibold text-[#8A4B2F]">
          <span className="mr-2 inline-flex align-middle text-[#8A4B2F]">
            <HistoryIcon width={12} height={12} />
          </span>
          Terakhir diperbarui: {new Date(variables.updatedAt).toLocaleString('id-ID')}
        </div>
      )}
    </div>
  );
};

export default WageVariablesForm;
