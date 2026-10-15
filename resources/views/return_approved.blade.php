<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Return Approved</title>
</head>
<body style="font-family: 'Montserrat', sans-serif; background-color: #f4f4f5; color: #18181b; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 24px; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
           <img src="https://1971co.com/mail_logo.png" alt="1971Co" height="28" style="display: block; max-height: 28px; object-fit: contain;">
        </div>

        <h2 style="font-size: 18px; font-weight: 600;">Hi {{ $name }},</h2>

        <p style="font-size: 14px; color: #3f3f46;">
            Your return request for order <strong>#{{ $returnRequest->order_number }}</strong> has been reviewed and <strong>approved</strong>.
        </p>

        <div style="background: #fafafa; padding: 16px; border-radius: 6px; margin: 16px 0; font-size: 13px;">
            @if($refundAmount !== null)
                <p style="margin: 4px 0;"><strong>Refund Amount:</strong> ${{ number_format((float) $refundAmount, 2) }}</p>
            @endif
            @if($refundMethod)
                <p style="margin: 4px 0;"><strong>Refund Method:</strong> {{ $refundMethod }}</p>
            @endif
            @if($returnRequest->request_reason)
                <p style="margin: 4px 0;"><strong>Reason:</strong> {{ $returnRequest->request_reason }}</p>
            @endif
        </div>

        <p style="font-size: 14px; color: #3f3f46;">
            @if(!$returnLabelAttached)
                Your return has been approved, but a return shipping label could not be attached to this email. Please visit
                <a href="https://1971co.com/user/orders" style="color: #0f172a; text-decoration: underline;">Your Orders</a>
                to check for a label. If no label is available there, please contact 1971Co support before shipping the item.
            @elseif($refundAmount !== null)
                Your refund will be processed within 5–7 business days.
            @else
                Please visit to <a href="https://1971co.com/user/orders" style="color: #0f172a; text-decoration: underline;">Your Orders</a>. to have the return label and drop the parcel at nearest UPS store. Please Keep in mind it will take 9-14 business days for the refund after we recive the product.
            @endif
        </p>

        <p style="font-size: 14px; color: #71717a; margin-top: 24px;">
            Best regards,<br><strong>1971Co. Team</strong>
        </p>
    </div>
</body>
</html>