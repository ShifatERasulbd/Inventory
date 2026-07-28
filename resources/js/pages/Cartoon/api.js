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

export async function fetchCartoons({ page = 1, per_page = 20 } = {}) {
    const params = new URLSearchParams({ page, per_page: String(per_page) });
    const payload = await requestJson(`/api/cartoons?${params}`);

    // Return the full paginated payload; fall back to a safe shape if unexpected.
    if (payload && typeof payload === 'object' && 'data' in payload) {
        return payload;
    }

    // Backward-compatible: if the backend still returns a plain array, wrap it.
    return {
        data: Array.isArray(payload) ? payload : [],
        current_page: 1,
        last_page: 1,
        per_page,
        total: Array.isArray(payload) ? payload.length : 0,
    };
}

// Backward-compatible export while older imports are being migrated.
export const fetchcartoons = fetchCartoons;

export async function fetchCartoon(id) {
    return requestJson(`/api/cartoons/${id}`);
}

export async function createCartoon(data) {
    await ensureCsrfCookie();
    return requestJson('/api/cartoons', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function updateCartoon(id, data) {
    await ensureCsrfCookie();
    return requestJson(`/api/cartoons/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

export async function deleteCartoon(id) {
    await ensureCsrfCookie();
    return requestJson(`/api/cartoons/${id}`, {
        method: 'DELETE',
    });
}

export async function adjustCartoonQuantity(id, data) {
    await ensureCsrfCookie();
    return requestJson(`/api/cartoons/${id}/adjust-quantity`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
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