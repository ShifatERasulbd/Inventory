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

async function ensureCsrfCookie() {
    await fetch('/sanctum/csrf-cookie', {
        credentials: 'include',
        headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        },
    });
}

export async function fetchCartoonTracking() {
    const payload = await requestJson('/api/cartoon-tracking');
    return Array.isArray(payload) ? payload : [];
}

export async function fetchRacks() {
    const payload = await requestJson('/api/racks');
    return Array.isArray(payload) ? payload : [];
}

export async function fetchRackRows(rackId) {
    const payload = await requestJson(`/api/racks/${rackId}/rows`);
    return Array.isArray(payload) ? payload : [];
}

export async function fetchRackColumns(rackId) {
    const payload = await requestJson(`/api/racks/${rackId}/columns`);
    return Array.isArray(payload) ? payload : [];
}

export async function assignCartoonRack(id, data) {
    await ensureCsrfCookie();
    return requestJson(`/api/cartoons/${id}/assign-rack`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
}
