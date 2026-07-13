import crypto from 'crypto';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return Response.json(
                { error: 'Missing required Razorpay parameters' },
                { status: 400 }
            );
        }

        const keySecret = process.env.RAZORPAY_KEY_SECRET || '';

        // Generate HMAC-SHA256 signature
        const generatedSignature = crypto
            .createHmac('sha256', keySecret)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest('hex');

        if (generatedSignature === razorpay_signature) {
            // Payment is successful and authentic
            // TODO: Update your database to mark the order as paid here
            return Response.json({ success: true, message: 'Payment verified successfully' });
        } else {
            // Signature mismatch! Do not mark as paid.
            return Response.json(
                { error: 'Signature mismatch, payment verification failed' },
                { status: 400 }
            );
        }
    } catch (error: any) {
        console.error('Error verifying Razorpay payment:', error);
        return Response.json(
            { error: 'Internal server error during verification' },
            { status: 500 }
        );
    }
}
