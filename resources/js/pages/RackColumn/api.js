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
  const payload = contentType.includes('application/json')
    ? await response.json()
    : null;

  if (!response.ok) {
    const message = payload?.message || 'Request failed';
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

export async function fetchRackColumns(rackId) {
  return requestJson(`/api/racks/${rackId}/columns`);
}

export async function fetchRackColumn(rackId, columnId) {
  return requestJson(`/api/racks/${rackId}/columns/${columnId}`);
}

export async function createRackColumn(rackId, data) {
  await ensureCsrfCookie();
  return requestJson(`/api/racks/${rackId}/columns`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateRackColumn(rackId, columnId, data) {
  await ensureCsrfCookie();
  return requestJson(`/api/racks/${rackId}/columns/${columnId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteRackColumn(rackId, columnId) {
  await ensureCsrfCookie();
  return requestJson(`/api/racks/${rackId}/columns/${columnId}`, {
    method: 'DELETE',
  });
}

