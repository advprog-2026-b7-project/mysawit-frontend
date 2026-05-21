'use client';

import React, { useState, useEffect } from 'react';
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
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6 border border-gray-100">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <span>⚙️</span> Pengaturan Variabel Upah
        </h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition shadow-md"
          >
            ✏️ Edit
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg font-semibold">
          ❌ {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-lg font-semibold">
          ✅ {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Upah Buruh per KG */}
        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-5 hover:shadow-md transition">
          <label className="block text-sm font-bold text-gray-800 mb-2">
            👷 Upah Buruh per Kg
          </label>
          <p className="text-xs text-gray-700 mb-4 bg-white p-3 rounded border border-blue-200 font-mono">
            Rumus: Upah Buruh = Upah/Kg × Kilogram Panen × 90%
          </p>
          {!isEditing ? (
            <div className="text-3xl font-bold text-blue-700">{formatRupiah(formData.upahBuruhPerKg)}</div>
          ) : (
            <input
              type="number"
              value={formData.upahBuruhPerKg}
              onChange={(e) => handleChange('upahBuruhPerKg', parseFloat(e.target.value))}
              className="w-full px-4 py-2 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-semibold text-lg"
              min="0"
              step="1000"
            />
          )}
        </div>

        {/* Upah Supir Truk per KG */}
        <div className="bg-purple-50 border-l-4 border-purple-500 rounded-lg p-5 hover:shadow-md transition">
          <label className="block text-sm font-bold text-gray-800 mb-2">
            🚚 Upah Supir Truk per Kg
          </label>
          <p className="text-xs text-gray-700 mb-4 bg-white p-3 rounded border border-purple-200 font-mono">
            Rumus: Upah Supir = Upah/Kg × Kilogram Kirim × 90%
          </p>
          {!isEditing ? (
            <div className="text-3xl font-bold text-purple-700">{formatRupiah(formData.upahSupirPerKg)}</div>
          ) : (
            <input
              type="number"
              value={formData.upahSupirPerKg}
              onChange={(e) => handleChange('upahSupirPerKg', parseFloat(e.target.value))}
              className="w-full px-4 py-2 border-2 border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-semibold text-lg"
              min="0"
              step="1000"
            />
          )}
        </div>

        {/* Upah Mandor per KG */}
        <div className="bg-orange-50 border-l-4 border-orange-500 rounded-lg p-5 hover:shadow-md transition">
          <label className="block text-sm font-bold text-gray-800 mb-2">
            👔 Upah Mandor per Kg
          </label>
          <p className="text-xs text-gray-700 mb-4 bg-white p-3 rounded border border-orange-200 font-mono">
            Rumus: Upah Mandor = Upah/Kg × Kilogram Akui Pabrik × 90%
          </p>
          {!isEditing ? (
            <div className="text-3xl font-bold text-orange-700">{formatRupiah(formData.upahMandorPerKg)}</div>
          ) : (
            <input
              type="number"
              value={formData.upahMandorPerKg}
              onChange={(e) => handleChange('upahMandorPerKg', parseFloat(e.target.value))}
              className="w-full px-4 py-2 border-2 border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent font-semibold text-lg"
              min="0"
              step="1000"
            />
          )}
        </div>

        {/* Info Box */}
        <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-5">
          <h4 className="font-bold text-yellow-900 mb-3 flex items-center gap-2">
            <span>ℹ️</span> Informasi Penting
          </h4>
          <ul className="text-sm text-yellow-800 space-y-2 font-semibold">
            <li>✓ Ketiga variabel digunakan untuk menghitung gaji otomatis</li>
            <li>✓ Setiap gaji dikurangi 10% (maksimum pembayaran 90%)</li>
            <li>✓ Perubahan berlaku untuk penggajian baru saja</li>
            <li>✓ Verifikasi nilai sebelum menyimpan</li>
          </ul>
        </div>

        {/* Buttons */}
        {isEditing && (
          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-4 py-3 bg-gray-500 text-white font-bold rounded-lg hover:bg-gray-600 transition shadow-md disabled:bg-gray-300"
              disabled={isSaving}
            >
              ❌ Batal
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition shadow-md disabled:bg-gray-400"
              disabled={isSaving}
            >
              {isSaving ? '⏳ Menyimpan...' : '✅ Simpan'}
            </button>
          </div>
        )}
      </form>

      {/* Last Updated */}
      {variables?.updatedAt && (
        <div className="text-xs text-gray-500 text-center pt-4 border-t border-gray-200 font-semibold">
          📅 Terakhir diperbarui: {new Date(variables.updatedAt).toLocaleString('id-ID')}
        </div>
      )}
    </div>
  );
};

export default WageVariablesForm;
