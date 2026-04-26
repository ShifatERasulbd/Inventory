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

export async function fetchRackRows(rackId) {
    return requestJson(`/api/racks/${rackId}/rows`);
}

export async function fetchRackRow(rackId, rowId) {
    return requestJson(`/api/racks/${rackId}/rows/${rowId}`);
}

export async function createRackRow(rackId, data) {
    await ensureCsrfCookie();
    return requestJson(`/api/racks/${rackId}/rows`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function updateRackRow(rackId, rowId, data) {
    await ensureCsrfCookie();
    return requestJson(`/api/racks/${rackId}/rows/${rowId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

export async function deleteRackRow(rackId, rowId) {
    await ensureCsrfCookie();
    return requestJson(`/api/racks/${rackId}/rows/${rowId}`, {
        method: 'DELETE',
    });
}
