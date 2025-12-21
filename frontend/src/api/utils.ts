import { enqueueSnackbar, type VariantType } from "notistack";

// Use Vite-provided env vars when available; fall back to sensible defaults for dev
const API_PREFIX = "/leapfrog";
const API_URL = `${
    (import.meta.env.VITE_API_BASE_URL as string) || "http://127.0.0.1:8000"
}${API_PREFIX}`;
const _WS_BASE = `${
    (import.meta.env.VITE_WS_BASE_URL as string) || "ws://127.0.0.1:8000"
}${API_PREFIX}`;
// Ensure `/game` path exists on the websocket base URL
export const WS_URL = _WS_BASE.endsWith("/game")
    ? _WS_BASE
    : `${_WS_BASE}/game`;

export const getWsUrl = (gameCode: string) => {
    return `${WS_URL}/${gameCode}`;
};

export const toast = (message: string, variant: VariantType) => {
    enqueueSnackbar(message, { variant });
};

// --- Generic Fetcher Helper ---
/**
 * Handles boilerplate fetch logic, error checking, and JSON parsing.
 */
async function apiFetcher<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, options);

    if (!response.ok) {
        // Attempt to read error message from body, otherwise use status text
        const errorText = await response.text();
        toast(errorText || response.statusText, "error");
        throw new Error(
            `[HTTP ${response.status}] ${errorText || response.statusText}`
        );
    }

    return response.json() as T;
}

// --- NEW GENERIC HTTP FUNCTIONS ---

/**
 * Executes a generic GET request.
 * @param endpoint The API endpoint path (e.g., '/users/1').
 * @returns A promise resolving to the expected JSON type T.
 */
export async function get<T>(endpoint: string): Promise<T> {
    return apiFetcher<T>(endpoint, {
        method: "GET",
    });
}

/**
 * Executes a generic POST request with a JSON body.
 * @param endpoint The API endpoint path (e.g., '/items').
 * @param data The JavaScript object to be sent as JSON body.
 * @returns A promise resolving to the expected JSON type T.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function post<T>(endpoint: string, data?: any): Promise<T> {
    const options: RequestInit = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        // Only include body if data is provided
        body: data ? JSON.stringify(data) : undefined,
    };
    return apiFetcher<T>(endpoint, options);
}
