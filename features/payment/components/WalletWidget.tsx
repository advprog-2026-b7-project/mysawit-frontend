'use client';

import React, { useState, useEffect } from 'react';
import { useWallet, usePaymentGateway } from '../hooks';

interface WalletWidgetProps {
  onTopUpSuccess?: () => void;
}

const WalletWidget: React.FC<WalletWidgetProps> = ({ onTopUpSuccess }) => {
  const { wallet, loading, fetch } = useWallet();
  const { initiateTopUp, loading: paymentLoading } = usePaymentGateway();
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<'MOCK' | 'XENDIT'>('MOCK');
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch wallet on mount
  useEffect(() => {
    const loadWallet = async () => {
      try {
        await fetch();
      } catch (err) {
        console.error('Failed to load wallet:', err);
      }
    };
    loadWallet();
  }, [fetch]);

  const handleTopUp = async () => {
    if (topUpAmount <= 0) {
      setMessage('Jumlah top-up harus lebih dari 0');
      return;
    }

    setIsProcessing(true);
    setMessage('');

    try {
      const response = await initiateTopUp(topUpAmount, paymentMethod);

      if (response.success) {
        setMessage(`Top-up sebesar ${topUpAmount} SawitDollar berhasil! 🎉`);
        setTopUpAmount(1);
        
        // Refresh wallet balance
        setTimeout(async () => {
          await fetch();
          onTopUpSuccess?.();
          setShowTopUpModal(false);
        }, 1500);

        // If there's a redirect URL (for Xendit), open it
        if (response.redirectUrl) {
          window.open(response.redirectUrl, '_blank');
        }
      } else {
        setMessage(`Gagal: ${response.message || 'Terjadi kesalahan'}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan saat top-up';
      setMessage(`Error: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const balance = wallet?.balance || 0;
  const balanceInRupiah = balance * 10000;

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <>
      {/* Wallet Card */}
      <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg shadow-xl p-6 text-white hover:shadow-2xl transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm font-medium opacity-90">💳 Saldo Dompet Anda</p>
            <h3 className="text-4xl font-bold mt-2">
              {balance} <span className="text-lg font-semibold">SawitDollar ($)</span>
            </h3>
            <p className="text-sm font-semibold opacity-85 mt-2">{formatRupiah(balanceInRupiah)}</p>
          </div>
          <div className="bg-green-500 bg-opacity-30 rounded-full p-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        {/* Info */}
        <div className="mb-5 text-sm opacity-90 border-t border-white border-opacity-20 pt-4">
          <p className="font-semibold">📌 Kurs Konversi: 1 SawitDollar ($) = Rp 10.000,00</p>
        </div>

        {/* Top-up Button */}
        <button
          onClick={() => setShowTopUpModal(true)}
          className="w-full bg-white text-green-700 font-bold py-3 rounded-lg hover:bg-gray-100 transition-colors shadow-md hover:shadow-lg"
        >
          ➕ Top-up Saldo
        </button>
      </div>

      {/* Top-up Modal */}
      {showTopUpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-800">💰 Top-up Saldo</h3>
              <button
                onClick={() => setShowTopUpModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Amount Input */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <label className="block text-sm font-bold text-gray-700">
                Jumlah (SawitDollar)
              </label>
              <div className="flex gap-2 items-center">
                <button
                  onClick={() => setTopUpAmount(Math.max(1, topUpAmount - 1))}
                  className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold transition"
                >
                  −
                </button>
                <input
                  type="number"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="flex-1 px-4 py-2 border-2 border-green-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-center text-2xl font-bold"
                  min="1"
                />
                <button
                  onClick={() => setTopUpAmount(topUpAmount + 1)}
                  className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition"
                >
                  +
                </button>
              </div>
              <p className="text-sm text-gray-600 font-semibold text-center">= <span className="text-green-700 font-bold">{formatRupiah(topUpAmount * 10000)}</span></p>
            </div>

            {/* Payment Method */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-700">
                📱 Metode Pembayaran
              </label>
              <div className="space-y-2">
                <label className="flex items-center p-4 border-2 border-green-500 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="MOCK"
                    checked={paymentMethod === 'MOCK'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'MOCK' | 'XENDIT')}
                    className="mr-3 w-4 h-4"
                  />
                  <div>
                    <p className="font-bold text-gray-800">✅ Mock Gateway (Testing)</p>
                    <p className="text-xs text-gray-600">Simulasi pembayaran tanpa biaya nyata</p>
                  </div>
                </label>
                <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition opacity-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="XENDIT"
                    checked={paymentMethod === 'XENDIT'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'MOCK' | 'XENDIT')}
                    className="mr-3 w-4 h-4"
                    disabled
                  />
                  <div>
                    <p className="font-bold text-gray-800">🔒 Xendit (Produksi)</p>
                    <p className="text-xs text-gray-600">Pembayaran real melalui Xendit (Segera hadir)</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Messages */}
            {message && (
              <div
                className={`p-3 rounded-lg text-sm ${
                  message.includes('Gagal') || message.includes('Error')
                    ? 'bg-red-100 text-red-700'
                    : 'bg-green-100 text-green-700'
                }`}
              >
                {message}
              </div>
            )}

            {/* Info Box */}
            <div className="bg-blue-50 border-l-4 border-blue-600 p-3">
              <p className="text-xs text-blue-800">
                ℹ️ Saat ini hanya tersedia Mock Gateway untuk testing. Xendit akan tersedia di production.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setShowTopUpModal(false)}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition disabled:bg-gray-200"
              >
                Batal
              </button>
              <button
                onClick={handleTopUp}
                disabled={isProcessing || paymentLoading}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-400"
              >
                {isProcessing ? 'Memproses...' : 'Lanjutkan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WalletWidget;
