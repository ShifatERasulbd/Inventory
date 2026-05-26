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

export async function fetchStyles() {
    const payload = await requestJson('/api/styles');
    return Array.isArray(payload) ? payload : [];
}

export async function fetchStyle(id) {
    return requestJson(`/api/styles/${id}`);
}

export async function createStyles(data) {
    await ensureCsrfCookie();
    return requestJson('/api/styles', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function updateStyles(id, data) {
    await ensureCsrfCookie();
    return requestJson(`/api/styles/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

export async function deleteStyles(id) {
    await ensureCsrfCookie();
    return requestJson(`/api/styles/${id}`, {
        method: 'DELETE',
    });
}
