import PayrollTable from '@/features/payment/components/PayrollTable';

export default function PaymentPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 md:p-12 transition-colors duration-300">
            {}
            <div className="mx-auto max-w-7xl">
                <header className="mb-10 border-b border-green-200 dark:border-green-800 pb-6">
                    <h1 className="text-4xl font-black text-green-800 dark:text-green-400 tracking-tight">
                        MySawit — Payment
                    </h1>
                    <p className="text-base text-gray-500 dark:text-gray-400 mt-2">
                        Monitoring distributed plantation payroll and transaction ledger.
                    </p>
                </header>

                <div className="rounded-2xl bg-white dark:bg-gray-800 p-8 shadow-2xl border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Payroll Ledger</h2>
                            <p className="text-sm text-gray-400">Showing latest verified transactions</p>
                        </div>
                    </div>

                    <PayrollTable />
                </div>
            </div>
        </div>
    );
}