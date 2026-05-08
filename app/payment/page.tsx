"use client";
import React, { useEffect, useState } from "react";
import { getPayrolls } from "../../features/payment/api"; // Shortened import
import PayrollTable from "../../features/payment/components/PayrollTable";

export default function PaymentPage() {
    const [payrolls, setPayrolls] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await getPayrolls();
                if (data) {
                    setPayrolls(data);
                }
            } catch (err) {
                console.error("Gagal load data:", err);
            }
        };

        loadData();
    }, []); // Empty dependency array aman untuk fetch data sekali

    return (
        <main className="p-10">
            <h1 className="text-2xl font-bold mb-5 text-black">Payment Management</h1>
            <PayrollTable data={payrolls} onRefresh={() => {
                getPayrolls().then(setPayrolls).catch(console.error);
            }} />
        </main>
    );
}