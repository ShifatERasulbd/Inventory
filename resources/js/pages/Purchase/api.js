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
        const message = payload?.message || payload?.error || 'Request failed';
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

export async function fetchPurchaseFormOptions() {
    return requestJson('/api/purchases/options');
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

export async function createRecurringPayment(data) {
    await ensureCsrfCookie();
    return requestJson('/api/recurring-payments', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function fetchWarehouses() {
    const payload = await requestJson('/api/warehouses');
    return Array.isArray(payload) ? payload : [];
}

export async function fetchShipmentTimes() {
    const payload = await requestJson('/api/shipments');
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



export async function uploadPurchasePackingList(purchaseId, file, onProgress) {
    if (!file) {
        throw new Error('No file selected.');
    }

    await ensureCsrfCookie();

    const formData = new FormData();
    formData.append('file', file);

    return new Promise((resolve, reject) => {
        const request = new XMLHttpRequest();

        request.open('POST', `/api/purchases/${purchaseId}/packing-list/upload`);
        request.withCredentials = true;
        request.responseType = 'json';
        request.setRequestHeader('Accept', 'application/json');
        request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

        request.upload.onprogress = (event) => {
            if (!event.lengthComputable || typeof onProgress !== 'function') {
                return;
            }

            const percent = Math.round((event.loaded / event.total) * 100);
            onProgress(percent);
        };

        request.onload = () => {
            const payload = request.response;

            if (request.status < 200 || request.status >= 300) {
                const message =
                    payload?.message ||
                    payload?.error ||
                    (typeof payload === 'string' ? payload : null) ||
                    `Upload failed with status ${request.status}`;

                const error = new Error(message);
                error.status = request.status;
                error.payload = payload;
                reject(error);
                return;
            }

            if (typeof onProgress === 'function') {
                onProgress(100);
            }

            resolve(payload);
        };

        request.onerror = () => {
            reject(new Error('Network error while uploading packing list.'));
        };

        request.send(formData);
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

export async function assignCartoonRack(cartoonId, data) {
    await ensureCsrfCookie();
    return requestJson(`/api/cartoons/${cartoonId}/assign-rack`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

