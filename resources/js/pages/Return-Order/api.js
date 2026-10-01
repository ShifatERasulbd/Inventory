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

export async function fetchReturnOrders(){
   const payload = await requestJson('/api/return-orders');
   return Array.isArray(payload) ? payload : [];
}

export async function fetchReturnOrder($id){
    return requestJson(`/api/return-orders/${id}`);
}

export async function createReturnOrder(data){
    await ensureCsrfCookie();
    return requestJson('/api/return-orders',{
        method:'POST',
        body: JSON.stringify(data),
    });
}

export async function updateReturnOrder(id,data){
    await ensureCsrfCookie();
    return requestJson(`/api/return-orders/${id}`,{
        method: 'PUT',
        body:  JSON.stringify(data),
    });
}

export async function deleteReturnOrder(id){
    await ensureCsrfCookie();
    return requestJson(`/api/return-orders/${id}`,{
        method: 'DELETE',
    });
}

export async function fetchRemoteOrders(){
    const payload = await requestJson('/api/remote-orders/orderList');
    return Array.isArray(payload) ? payload :[];
}