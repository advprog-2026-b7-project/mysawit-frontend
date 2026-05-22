import { createServiceClient } from "./createServiceClient";

const paymentClient = createServiceClient(
    process.env.NEXT_PUBLIC_PAYMENT_API_URL || "http://localhost:8084"
);

// Tambahkan interceptor untuk menyuntikkan Token JWT secara otomatis
paymentClient.interceptors.request.use(
    (config) => {
        // Ambil token dari localStorage (sesuaikan key-nya dengan yang dipakai tim kalian, biasanya 'token' atau 'jwt')
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

        if (token) {
            // Pasang ke header Authorization sesuai format yang diminta Spring Boot
            config.headers["Authorization"] = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default paymentClient;