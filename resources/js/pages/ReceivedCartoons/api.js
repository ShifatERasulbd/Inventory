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

export async function fetchReceivedCartoons(purchaseId) {
    const query = purchaseId ? `?purchase_id=${encodeURIComponent(purchaseId)}` : '';
    const payload = await requestJson(`/api/received-cartoons${query}`);
    return Array.isArray(payload) ? payload : [];
}

export async function receiveCartoonByScan(cartoonNumber) {
    await ensureCsrfCookie();
    return requestJson('/api/received-cartoons/scan', {
        method: 'POST',
        body: JSON.stringify({ cartoon_number: cartoonNumber }),
    });
}

export async function fetchReceivedCartoonIssues(purchaseId) {
    const query = purchaseId ? `?purchase_id=${encodeURIComponent(purchaseId)}` : '';
    const payload = await requestJson(`/api/received-cartoons/issues${query}`);
    return Array.isArray(payload) ? payload : [];
}

export async function createReceivedCartoonIssue(data) {
    await ensureCsrfCookie();
    return requestJson('/api/received-cartoons/issues', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}
