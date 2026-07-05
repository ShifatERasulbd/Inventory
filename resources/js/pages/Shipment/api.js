async function ensureCsrfCookie(){
    await fetch('/sanctum/csrf-cookie',{
        credentials:'include',
        headers:{
            Accept:'application/json',
            'X-Requested-With':'XMLHttpRequest',
        }
    })
}


async function requestJson(url,options={}){
    const response =await fetch(url,{
        credentials:'include',
        headers:{
            Accept:'application/json',
            'content-Type' :  'application/json',
            'X-Rquested-With': 'XMLHttpRequest',
            ...(options.headers || {}),
        },
        ...options,
    });

    const contentType =response.headers.get('content-type')|| '';
    const payload =contentType.includes('application/json')?await response.json():null;

    if(!response.ok){
        const message =payload?.message || 'Request failed';
        const error =new Error(message);
        error.status=response.status;
        error.payload=payload;
        throw error;
    }
    return payload;
}

function normalizeShipment(shipment){
    if(!shipment || typeof shipment !== 'object'){
        return shipment;
    }

    return {
        ...shipment,
        shipmentTime: shipment.shipmentTime ?? shipment.shipping_time ?? '',
        productionTime: shipment.productionTime ?? shipment.production_time ?? '',
    };
}

export async function fecthShipments(){
    const payload =await requestJson('/api/shipments');

    return Array.isArray(payload)?payload.map(normalizeShipment):[];

}

export const fetchShipments = fecthShipments;

export async function fetchShipment(id){
    const payload = await requestJson(`/api/shipments/${id}`);
    return normalizeShipment(payload);
}

export async function createShipment(data){
    await ensureCsrfCookie();
    return requestJson('/api/shipments',{
        method:'POST',
        body:JSON.stringify(data),
    });
}

export async function updateShipment(id,data){
    await ensureCsrfCookie();
    return requestJson(`/api/shipments/${id}`,{
        method:'PUT',
        body:JSON.stringify(data),
    });
}

export async function deleteShipment(id){
    await ensureCsrfCookie();
    return requestJson(`/api/shipments/${id}`,{
        method:'DELETE',
    });
}

