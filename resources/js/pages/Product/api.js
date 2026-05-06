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
    const isFormData = options.body instanceof FormData;
    const response = await fetch(url, {
        credentials: 'include',
        headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
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

export async function fetchProducts() {
    const payload = await requestJson('/api/products');

    // Keep UI stable even if the backend/auth layer returns an unexpected payload.
    return Array.isArray(payload) ? payload : [];
}

// Backward-compatible export while older imports are being migrated.
// export const fetchColors = fetchColors;

export async function fetchProduct(id) {
    return requestJson(`/api/products/${id}`);
}

export async function createProducts(data) {
    await ensureCsrfCookie();

    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
        if (Array.isArray(value) && key !== 'gallery_images' && key !== 'remove_gallery_images') {
            value.forEach((item) => {
                if (item !== undefined && item !== null && item !== '') {
                    formData.append(`${key}[]`, item);
                }
            });
            return;
        }

        if (key === 'barcodes' && typeof value === 'object' && value !== null && !Array.isArray(value)) {
            formData.append('barcodes', JSON.stringify(value));
            return;
        }

        if (key === 'remove_gallery_images' && Array.isArray(value)) {
            value.forEach((path) => {
                if (path) {
                    formData.append('remove_gallery_images[]', path);
                }
            });
            return;
        }

        if (key === 'remove_cover_image') {
            if (value) {
                formData.append('remove_cover_image', '1');
            }
            return;
        }

        if (key === 'gallery_images' && Array.isArray(value)) {
            value.forEach((file) => {
                if (file) {
                    formData.append('gallery_images[]', file);
                }
            });
            return;
        }

        if (value !== undefined && value !== null && value !== '') {
            formData.append(key, value);
        }
    });

    return requestJson('/api/products', {
        method: 'POST',
        body: formData,
    });
}

export async function updateProducts(id, data) {
    await ensureCsrfCookie();

    const formData = new FormData();
    formData.append('_method', 'PUT');

    Object.entries(data).forEach(([key, value]) => {
        if (Array.isArray(value) && key !== 'gallery_images') {
            value.forEach((item) => {
                if (item !== undefined && item !== null && item !== '') {
                    formData.append(`${key}[]`, item);
                }
            });
            return;
        }

        if (key === 'gallery_images' && Array.isArray(value)) {
            value.forEach((file) => {
                if (file) {
                    formData.append('gallery_images[]', file);
                }
            });
            return;
        }

        if (value !== undefined && value !== null && value !== '') {
            formData.append(key, value);
        }
    });

    return requestJson(`/api/products/${id}`, {
        method: 'POST',
        body: formData,
    });
}

export async function deleteProducts(id) {
    await ensureCsrfCookie();
    return requestJson(`/api/products/${id}`, {
        method: 'DELETE',
    });
}

export async function bulkDeleteProducts(ids) {
    await ensureCsrfCookie();
    return requestJson('/api/products/bulk-delete', {
        method: 'POST',
        body: JSON.stringify({ ids }),
    });
}