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

export async function fetchSuppliers() {
    const payload = await requestJson('/api/suppliers');

    // Keep UI stable even if the backend/auth layer returns an unexpected payload.
    return Array.isArray(payload) ? payload : [];
}

// Backward-compatible export while older imports are being migrated.
export const fetchsuppliers = fetchSuppliers;

export async function fetchSupplier(id) {
    return requestJson(`/api/suppliers/${id}`);
}

export async function createSupplier(data) {
    await ensureCsrfCookie();
    return requestJson('/api/suppliers', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function updateSupplier(id, data) {
    await ensureCsrfCookie();
    return requestJson(`/api/suppliers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

export async function deleteSupplier(id) {
    await ensureCsrfCookie();
    return requestJson(`/api/suppliers/${id}`, {
        method: 'DELETE',
    });
}