async function ensureCsrfCookie() {
    await fetch('/sanctum/csrf-cookie', {
        credentials: 'include',
        headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        },
    });
}

async function requestJson(url, options = {}) {
    const response = await fetch(url, {
        credentials: 'include',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            ...(options.headers || {}),
        },
        ...options,
    });

    const contentType = response.headers.get('content-type') || '';
    const payload = contentType.includes('application/json') ? await response.json() : null;

    if (!response.ok) {
        const message = payload?.message || 'Request failed';
        const error = new Error(message);
        error.status = response.status;
        error.payload = payload;
        throw error;
    }

    return payload;
}

export async function fetchCountries() {
    const payload = await requestJson('/api/countries');

    // Keep UI stable even if the backend/auth layer returns an unexpected payload.
    return Array.isArray(payload) ? payload : [];
}

export async function fetchCountry(id) {
    return requestJson(`/api/countries/${id}`);
}

export async function createCountry(data) {
    await ensureCsrfCookie();
    return requestJson('/api/countries', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function updateCountry(id, data) {
    await ensureCsrfCookie();
    return requestJson(`/api/countries/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

export async function deleteCountry(id) {
    await ensureCsrfCookie();
    return requestJson(`/api/countries/${id}`, {
        method: 'DELETE',
    });
}