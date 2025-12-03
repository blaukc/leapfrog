const API_URL = "http://127.0.0.1:8000";

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
