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

export async function fetchReturnRequests(params = {}) {
    const query = new URLSearchParams(params).toString();
    const payload = await requestJson(`/api/return-requests${query ? `?${query}` : ''}`);
    return payload?.data ?? [];
}

export async function fetchReturnRequest(id) {
    return requestJson(`/api/return-requests/${id}`);
}

export async function fetchReturnShippingLabelBlob(id) {
    const response = await fetch(`/api/return-requests/${id}/shipping-label`, {
        credentials: 'include',
        headers: {
            Accept: 'application/pdf',
            'X-Requested-With': 'XMLHttpRequest',
        },
    });

    if (!response.ok) {
        const contentType = response.headers.get('content-type') || '';
        const payload = contentType.includes('application/json') ? await response.json() : null;
        const error = new Error(payload?.message || 'No return shipping label is available for this order.');
        error.status = response.status;
        throw error;
    }

    return response.blob();
}

export async function updateReturnRequestStatus(id, status) {
    await ensureCsrfCookie();
    return requestJson(`/api/return-requests/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
    });
}

export async function syncReturnRequests() {
    await ensureCsrfCookie();
    return requestJson('/api/return-requests/sync', {
        method: 'POST',
        body: JSON.stringify({}),
    });
}

export async function fetchCartonsForProduct(returnRequestId, { name, color, size } = {}) {
    const query = new URLSearchParams(
        Object.fromEntries(Object.entries({ name, color, size }).filter(([, value]) => value))
    ).toString();
    const payload = await requestJson(`/api/return-requests/${returnRequestId}/cartons${query ? `?${query}` : ''}`);
    return {
        productId: payload?.product_id ?? null,
        cartons: Array.isArray(payload?.cartons) ? payload.cartons : [],
    };
}

export async function restockReturnItem(returnRequestId, { name, color, size, cartoonId, quantity }) {
    await ensureCsrfCookie();
    return requestJson(`/api/return-requests/${returnRequestId}/restock`, {
        method: 'POST',
        body: JSON.stringify({ name, color, size, cartoon_id: cartoonId, quantity }),
    });
}
