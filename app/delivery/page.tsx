"use client";

import { useAuth } from "@/features/auth/hooks";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DeliveryPage() {
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!user) return;

        switch (user.role) {
            case "MANDOR":
                router.replace("/delivery/mandor");
                break;
            case "SUPIR":
                router.replace("/delivery/driver");
                break;
            case "ADMIN":
                router.replace("/delivery/admin");
                break;
            default:
                router.replace("/dashboard");
        }
    }, [user, router]);

    return <div>Redirecting...</div>;
}