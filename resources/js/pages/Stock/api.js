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

export async function fetchStocks() {
    const payload = await requestJson('/api/stocks');
    return Array.isArray(payload) ? payload : [];
}

export async function fetchStock(id) {
    return requestJson(`/api/stocks/${id}`);
}

export async function createStock(data) {
    await ensureCsrfCookie();
    return requestJson('/api/stocks', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function updateStock(id, data) {
    await ensureCsrfCookie();
    return requestJson(`/api/stocks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

export async function deleteStock(id) {
    await ensureCsrfCookie();
    return requestJson(`/api/stocks/${id}`, {
        method: 'DELETE',
    });
}