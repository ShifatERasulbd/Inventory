import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Shared shipping-label preview used by the checkout popup and the retail sales table,
// so both can display + print the Veeqo-purchased label the same way. `labelFileUrl` is
// the actual label image downloaded from Veeqo's "Retrieve Shipping Labels" API and stored
// locally; `labelUrl` is kept only as a fallback link into the Veeqo dashboard.
export default function ShippingLabelSection({ carrier, service, trackingUrl, labelUrl, labelFileUrl }) {
    if (!service && !labelUrl && !labelFileUrl) {
        return null;
    }

    const handlePrintLabel = () => {
        if (!labelFileUrl) {
            return;
        }

        const printWindow = window.open('', '_blank', 'width=420,height=650');
        if (!printWindow) {
            return;
        }

        printWindow.document.open();
        printWindow.document.write(`
            <!doctype html>
            <html>
                <head>
                    <meta charset="utf-8" />
                    <title>Shipping Label</title>
                    <style>
                        body { margin: 0; display: flex; justify-content: center; align-items: flex-start; }
                        img { max-width: 100%; }
                    </style>
                </head>
                <body>
                    <img src="${labelFileUrl}" alt="Shipping label" />
                </body>
            </html>
        `);
        printWindow.document.close();

        const image = printWindow.document.querySelector('img');
        const triggerPrint = () => {
            printWindow.focus();
            printWindow.print();
        };
        if (image?.complete) {
            triggerPrint();
        } else {
            image?.addEventListener('load', triggerPrint);
        }
    };

    return (
        <div className="space-y-2">
            {(service || trackingUrl) && (
                <p className="text-sm">
                    <span className="font-medium">Shipping Level:</span> {carrier ? `${carrier} - ` : ''}{service || '-'}
                    {trackingUrl && (
                        <a
                            href={trackingUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="ml-2 text-primary underline"
                        >
                            Track
                        </a>
                    )}
                </p>
            )}

            {labelFileUrl ? (
                <div className="space-y-2">
                    <div className="flex justify-center overflow-hidden rounded-md border bg-muted/20 p-2">
                        <img src={labelFileUrl} alt="Shipping label" className="max-h-96 w-auto" />
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={handlePrintLabel}>
                        <Printer className="mr-1.5 h-4 w-4" />
                        Print Label
                    </Button>
                </div>
            ) : labelUrl && (
                <a href={labelUrl} target="_blank" rel="noreferrer" className="text-sm text-primary underline">
                    View label in Veeqo
                </a>
            )}
        </div>
    );
}

