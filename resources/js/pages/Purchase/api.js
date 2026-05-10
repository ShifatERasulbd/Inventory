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

export async function fetchPurchases() {
    const payload = await requestJson('/api/purchases');
    return Array.isArray(payload) ? payload : [];
}

export async function fetchPurchase(id) {
    return requestJson(`/api/purchases/${id}`);
}

export async function createPurchase(data) {
    await ensureCsrfCookie();
    return requestJson('/api/purchases', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function updatePurchase(id, data) {
    await ensureCsrfCookie();
    return requestJson(`/api/purchases/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

export async function updatePurchaseStatus(id, data) {
    await ensureCsrfCookie();
    return requestJson(`/api/purchases/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
}

export async function deletePurchase(id) {
    await ensureCsrfCookie();
    return requestJson(`/api/purchases/${id}`, {
        method: 'DELETE',
    });
}

export async function fetchWarehouses() {
    const payload = await requestJson('/api/warehouses');
    return Array.isArray(payload) ? payload : [];
}

export async function fetchProducts() {
    const payload = await requestJson('/api/products');
    return Array.isArray(payload) ? payload : [];
}

export async function fetchCartoons() {
    const payload = await requestJson('/api/cartoons');
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

export async function assignCartoonRack(cartoonId, data) {
    await ensureCsrfCookie();
    return requestJson(`/api/cartoons/${cartoonId}/assign-rack`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
}
