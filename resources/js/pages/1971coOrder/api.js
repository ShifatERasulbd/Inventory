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

/**
 * Fetches an order belonging to the main store via the backend proxy
 */
export async function fetchRemoteOrder(id) {
    return requestJson(`/api/remote-orders/${id}`);
}

export async function updateRemoteOrder(id, payload) {
    await ensureCsrfCookie();

    return requestJson(`/api/remote-orders/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    });
}

export async function fetchRemoteOrders(params = {}) {
    const query = new URLSearchParams();

    if (params.search) {
        query.set('search', params.search);
    }

    if (params.status) {
        query.set('status', params.status);
    }

    if (params.date_from) {
        query.set('date_from', params.date_from);
    }

    if (params.date_to) {
        query.set('date_to', params.date_to);
    }

    if (params.per_page) {
        query.set('per_page', String(params.per_page));
    }

    if (params.page) {
        query.set('page', String(params.page));
    }

    const suffix = query.toString() ? `?${query.toString()}` : '';
    return requestJson(`/api/remote-orders${suffix}`);
}

export async function syncRemoteOrders(payload = {}) {
    await ensureCsrfCookie();

    return requestJson('/api/remote-orders/sync', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

export async function bulkUpdateStatus(payload) {
    await ensureCsrfCookie();

    return requestJson('/api/remote-orders/bulk-status', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

export async function bulkDelete(payload) {
    await ensureCsrfCookie();

    return requestJson('/api/remote-orders/bulk-delete', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

export async function fetchStockLocationsForOrder(items, warehouseId = null) {
    await ensureCsrfCookie();

    return requestJson('/api/stocks/locations', {
        method: 'POST',
        body: JSON.stringify({
            items,
            ...(warehouseId ? { warehouse_id: warehouseId } : {}),
        }),
    });
}