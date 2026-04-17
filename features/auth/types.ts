export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: "BURUH" | "MANDOR" | "ADMIN" | "SUPIR";
}

export interface AuthResponse {
  token: string;
  email: string;
  name: string;
  message: string;
}

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  role: string;
  mandorCertificationNumber: string;
  mandorId: string;
}
