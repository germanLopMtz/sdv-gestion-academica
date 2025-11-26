import axios, { AxiosInstance, AxiosResponse } from "axios";

const rawBaseURL = ((import.meta as any).env?.VITE_API_URL as string | undefined) ?? "/api";

function normalizeBaseUrl(value: string): string {
    try {
        const parsed = new URL(value);
        const isLocalhost = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
        const isDotnetHttpsPort = parsed.port === "7248";
        if (isLocalhost && isDotnetHttpsPort && parsed.protocol === "http:") {
            parsed.protocol = "https:";
        }
        return parsed.toString().replace(/\/$/, "");
    } catch {
        return value;
    }
}

const baseURL = normalizeBaseUrl(rawBaseURL);

export const apiClient: AxiosInstance = axios.create({
    baseURL: baseURL,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Centraliza manejo de errores
        return Promise.reject(error);
    }
);

// Usuarios
export const usuariosApi = {
    create: <T = unknown>(data: unknown): Promise<AxiosResponse<T>> =>
        apiClient.post<T>("/Usuarios", data),
    getAll: <T = unknown>(): Promise<AxiosResponse<T>> =>
        apiClient.get<T>("/Usuarios"),
    getById: <T = unknown>(id: number): Promise<AxiosResponse<T>> =>
        apiClient.get<T>(`/Usuarios/${id}`),
    update: <T = unknown>(id: number, data: unknown): Promise<AxiosResponse<T>> =>
        apiClient.put<T>(`/Usuarios/${id}`, data),
    remove: <T = unknown>(id: number): Promise<AxiosResponse<T>> =>
        apiClient.delete<T>(`/Usuarios/${id}`),
    login: <T = unknown>(credentials: unknown): Promise<AxiosResponse<T>> =>
        apiClient.post<T>("/Usuarios/login", credentials),
};

// Alumnos
export const alumnosApi = {
    create: <T = unknown>(data: unknown): Promise<AxiosResponse<T>> =>
        apiClient.post<T>("/Alumnos", data),
    getAll: <T = unknown>(): Promise<AxiosResponse<T>> =>
        apiClient.get<T>("/Alumnos"),
    getById: <T = unknown>(id: number): Promise<AxiosResponse<T>> =>
        apiClient.get<T>(`/Alumnos/${id}`),
    update: <T = unknown>(id: number, data: unknown): Promise<AxiosResponse<T>> =>
        apiClient.put<T>(`/Alumnos/${id}`, data),
    remove: <T = unknown>(id: number): Promise<AxiosResponse<T>> =>
        apiClient.delete<T>(`/Alumnos/${id}`),
};

// Horarios
export const horariosApi = {
    create: <T = unknown>(data: unknown): Promise<AxiosResponse<T>> =>
        apiClient.post<T>("/Schedule", data),
    getAll: <T = unknown>(): Promise<AxiosResponse<T>> =>
        apiClient.get<T>("/Schedule"),
    getById: <T = unknown>(id: number): Promise<AxiosResponse<T>> =>
        apiClient.get<T>(`/Schedule/${id}`),
    update: <T = unknown>(id: number, data: unknown): Promise<AxiosResponse<T>> =>
        apiClient.put<T>(`/Schedule/${id}`, data),
    remove: <T = unknown>(id: number): Promise<AxiosResponse<T>> =>
        apiClient.delete<T>(`/Schedule/${id}`),
    getRooms: <T = unknown>(): Promise<AxiosResponse<T>> =>
        apiClient.get<T>("/Schedule/rooms"),
    getTimeSlots: <T = unknown>(): Promise<AxiosResponse<T>> =>
        apiClient.get<T>("/Schedule/timeslots"),
    seed: <T = unknown>(): Promise<AxiosResponse<T>> =>
        apiClient.post<T>("/Schedule/seed", {}),
};

export type { AxiosResponse };

