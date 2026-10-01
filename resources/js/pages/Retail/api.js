let csrfCookiePromise = null;

// Fetch the CSRF cookie at most once per session; never let a transient
// network hiccup here block the actual request that follows it.
async function ensureCsrfCookie() {
    if (!csrfCookiePromise) {
        csrfCookiePromise = fetch('/sanctum/csrf-cookie', {
            credentials: 'include',
            headers: {
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
        }).catch(() => {
            csrfCookiePromise = null;
        });
    }

    await csrfCookiePromise;
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

export async function fetchPendingRemoteOrders() {
    const payload = await requestJson('/api/remote-orders/pending');
    return Array.isArray(payload) ? payload : [];
}

export async function updateRemoteOrderStatus(orderId, status, extraPayload = {}) {
    await ensureCsrfCookie();

    return requestJson(`/api/remote-orders/${orderId}`, {
        method: 'PUT',
        body: JSON.stringify({ status, ...extraPayload }),
    });
}

export async function bookRemoteOrderVeeqoShipment(orderId) {
    await ensureCsrfCookie();

    return requestJson(`/api/remote-orders/${orderId}/veeqo-booking`, {
        method: 'POST',
    });
}

export async function fetchRemoteOrderById(orderId) {
    return requestJson(`/api/remote-orders/${orderId}`);
}


export async function lookupBarcode(barcode, warehouseId, brandId = null) {
    const brandPart = Number.isInteger(Number(brandId)) && Number(brandId) > 0
        ? `&brand_id=${Number(brandId)}`
        : '';

    return requestJson(`/api/retail/barcode-lookup?barcode=${encodeURIComponent(barcode)}&warehouse_id=${warehouseId}${brandPart}`);
}

export async function createRetailSale(data) {
    await ensureCsrfCookie();
    return requestJson('/api/retail/sales', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function fetchRetailSales() {
    const payload = await requestJson('/api/retail/sales');
    return Array.isArray(payload) ? payload : [];
}

export async function updateRetailSaleStatus(saleId, status) {
    await ensureCsrfCookie();
    return requestJson(`/api/retail/sales/${saleId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
    });
}

export async function fetchWarehouses() {
    const payload = await requestJson('/api/warehouses');
    return Array.isArray(payload) ? payload : [];
}

export async function fetchAvailableCartoonsByWarehouse(warehouseId) {
    const payload = await requestJson('/api/cartoons');

    if (!Array.isArray(payload)) {
        return [];
    }

    return payload.filter((cartoon) => {
        return Number(cartoon.warehouse_id) === Number(warehouseId) && Number(cartoon.quantity || 0) > 0;
    });
}
