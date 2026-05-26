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

export async function fetchActivityLogs({ page = 1, perPage = 25, search = '' } = {}) {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('per_page', String(perPage));

    if (search.trim()) {
        params.set('search', search.trim());
    }

    return requestJson(`/api/activity-logs?${params.toString()}`);
}
