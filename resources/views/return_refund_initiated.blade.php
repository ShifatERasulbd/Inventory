<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Refund Initiated</title>
</head>
<body style="font-family: 'Montserrat', sans-serif; background-color: #f4f4f5; color: #18181b; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 24px; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
           <img src="https://1971co.com/mail_logo.png" alt="1971Co" height="28" style="display: block; max-height: 28px; object-fit: contain;">
        </div>

        <h2 style="font-size: 18px; font-weight: 600;">Hi {{ $name }},</h2>

        <p style="font-size: 14px; color: #3f3f46;">
            Your refund for order <strong>#{{ $returnRequest->order_number }}</strong> has been <strong>initiated</strong>.
        </p>

        <div style="background: #fafafa; padding: 16px; border-radius: 6px; margin: 16px 0; font-size: 13px;">
            @if($refundAmount !== null)
                <p style="margin: 4px 0;"><strong>Refund Amount:</strong> ${{ number_format((float) $refundAmount, 2) }}</p>
            @endif
            <p style="margin: 4px 0;"><strong>Status:</strong> Refund Initiated</p>
        </div>

        <p style="font-size: 14px; color: #3f3f46;">
            The refund has been sent to your original payment method. Please allow 5–10 business days for it to reflect on your statement, depending on your bank.
        </p>

        <p style="font-size: 14px; color: #71717a; margin-top: 24px;">
            Best regards,<br><strong>1971Co. Team</strong>
        </p>
    </div>
</body>
</html>