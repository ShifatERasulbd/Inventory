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

export async function fetchUsers() {
    const payload = await requestJson('/api/users');
    return Array.isArray(payload) ? payload : [];
}

export async function fetchUser(id) {
    return requestJson(`/api/users/${id}`);
}

export async function createUser(data) {
    await ensureCsrfCookie();
    return requestJson('/api/users', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function updateUser(id, data) {
    await ensureCsrfCookie();
    return requestJson(`/api/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

export async function deleteUser(id) {
    await ensureCsrfCookie();
    return requestJson(`/api/users/${id}`, {
        method: 'DELETE',
    });
}
