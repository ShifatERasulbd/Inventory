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

export async function lookupBarcode(barcode, warehouseId) {
    return requestJson(`/api/retail/barcode-lookup?barcode=${encodeURIComponent(barcode)}&warehouse_id=${warehouseId}`);
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
