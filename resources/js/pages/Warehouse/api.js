async function ensureCsrfCookie(){
    await fetch('/sanctum/csrf-cookie',{
        credentials:'include',
        headers:{
            Accept:'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        },
    })
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

export async function fetchWarehouses() {
    const payload = await requestJson('/api/warehouses');
    return Array.isArray(payload) ? payload : [];
}

export async function fetchWarehouse(id) {
    return requestJson(`/api/warehouses/${id}`);
}

export async function createWarehouse(data) {
    await ensureCsrfCookie();
    return requestJson('/api/warehouses', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function updateWarehouse(id, data) {
    await ensureCsrfCookie();
    return requestJson(`/api/warehouses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

export async function deleteWarehouse(id) {
    await ensureCsrfCookie();
    return requestJson(`/api/warehouses/${id}`, {
        method: 'DELETE',
    });
}