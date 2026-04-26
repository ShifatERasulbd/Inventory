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

export async function fetchRacks(){
    return requestJson('/api/racks');
}

export async function fetchRack(id){
    return requestJson(`/api/racks/${id}`);
}

export async function createRack(data){
    await ensureCsrfCookie();
    return requestJson('/api/racks',{
        method:'POST',
        body: JSON.stringify(data),
    });
}

export async function updateRack(id, data){
    await ensureCsrfCookie();
    return requestJson(`/api/racks/${id}`,{
        method:'PUT',
        body: JSON.stringify(data),
    });
}

export async function deleteRack(id){
    await ensureCsrfCookie();
    return requestJson(`/api/racks/${id}`,{
        method:'DELETE',
    });
}
