<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Return Product Received</title>
</head>
<body style="font-family: 'Montserrat', sans-serif; background-color: #f4f4f5; color: #18181b; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 24px; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
           <img src="https://1971co.com/mail_logo.png" alt="1971Co" height="28" style="display: block; max-height: 28px; object-fit: contain;">
        </div>

        <h2 style="font-size: 18px; font-weight: 600;">Hi {{ $name }},</h2>

        <p style="font-size: 14px; color: #3f3f46;">
            We have received your returned item(s) for order <strong>#{{ $returnRequest->order_number }}</strong> at our warehouse.
        </p>

        <div style="background: #fafafa; padding: 16px; border-radius: 6px; margin: 16px 0; font-size: 13px;">
            <p style="margin: 4px 0;"><strong>Status:</strong> Product Received</p>
            @if($returnRequest->request_reason)
                <p style="margin: 4px 0;"><strong>Reason:</strong> {{ $returnRequest->request_reason }}</p>
            @endif
        </div>

        <p style="font-size: 14px; color: #3f3f46;">
            Our team is now inspecting the item(s). Once inspection is complete, your refund will be initiated. Please allow 9–14 business days from today for the refund to reflect.
        </p>

        <p style="font-size: 14px; color: #71717a; margin-top: 24px;">
            Best regards,<br><strong>1971Co. Team</strong>
        </p>
    </div>
</body>
</html>