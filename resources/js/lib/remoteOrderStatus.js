export function normalizeRemoteOrderStatus(status) {
    const normalized = String(status ?? '').trim().toLowerCase();

    if (['approved', 'waiting for shipment', 'waiting-for-shipment'].includes(normalized)) {
        return 'waiting for shipment';
    }

    if (['processing', 'ready for shipment', 'ready-for-shipment'].includes(normalized)) {
        return 'ready for shipment';
    }

    if (normalized === 'pending') {
        return 'pending';
    }

    if (normalized === 'shipped') {
        return 'shipped';
    }

    if (normalized === 'delivered') {
        return 'delivered';
    }

    if (['cancelled', 'canceled'].includes(normalized)) {
        return 'cancelled';
    }

    if (normalized === 'refunded') {
        return 'refunded';
    }

    return normalized || 'pending';
}

export function formatRemoteOrderStatus(status) {
    const normalized = normalizeRemoteOrderStatus(status);
    const labels = {
        pending: 'Pending',
        'waiting for shipment': 'Waiting for Shipment',
        'ready for shipment': 'Ready for Shipment',
        shipped: 'Shipped',
        delivered: 'Delivered',
        cancelled: 'Cancelled',
        refunded: 'Refunded',
    };

    return labels[normalized] || normalized.charAt(0).toUpperCase() + normalized.slice(1);
}
