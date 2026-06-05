export interface LoginRequest {
  cedula: string;
  password: string;
  recordarme: boolean;
}

export interface LoginResponse {
  id: number;
  nombreCompleto: string;
}
