'use client';
import { useEffect, useState } from 'react';
import { getPayrolls } from '../api';
import { Payroll } from '../types';

export default function PayrollTable() {
    const [payrolls, setPayrolls] = useState<Payroll[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const data = await getPayrolls();
            setPayrolls(data);
            setLoading(false);
        };
        fetchData();
    }, []);

    if (loading) return <div className="py-20 text-center text-xl text-gray-500 animate-pulse">Loading payroll records...</div>;

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                    <th className="px-8 py-4 text-left text-sm font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">Worker ID</th>
                    <th className="px-8 py-4 text-left text-sm font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">Amount</th>
                    <th className="px-8 py-4 text-left text-sm font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">Status</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
                {payrolls.length > 0 ? (
                    payrolls.map((p) => (
                        <tr key={p.id} className="hover:bg-green-50/50 dark:hover:bg-gray-700/50 transition-all">
                            <td className="px-8 py-5 whitespace-nowrap text-lg font-semibold text-gray-900 dark:text-gray-100">{p.workerId}</td>
                            <td className="px-8 py-5 whitespace-nowrap text-lg text-gray-700 dark:text-gray-300 font-mono">Rp {p.amount.toLocaleString('id-ID')}</td>
                            <td className="px-8 py-5 whitespace-nowrap">
                  <span className={`px-4 py-1.5 rounded-lg text-sm font-bold shadow-sm ${p.status === 'SUCCESS' ? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400 border border-green-200 dark:border-green-500/30' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-500/30'}`}>
                    {p.status}
                  </span>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={3} className="px-8 py-20 text-center text-gray-400 dark:text-gray-500 text-lg italic">No payroll data found.</td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    );
}