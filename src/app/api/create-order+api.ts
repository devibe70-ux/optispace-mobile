import Razorpay from 'razorpay';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { amount, currency = 'INR', receipt = 'receipt#1' } = body;

        // Minimum amount validation (100 paise = 1 INR)
        if (!amount || amount < 100) {
            return Response.json(
                { error: 'Amount must be at least 100 paise (1 INR)' },
                { status: 400 }
            );
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID || process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || '',
            key_secret: process.env.RAZORPAY_KEY_SECRET || '',
        });

        const options = {
            amount: amount, // amount in the smallest currency unit (paise)
            currency,
            receipt,
        };

        const order = await razorpay.orders.create(options);

        return Response.json({
            order_id: order.id,
            amount: order.amount,
            currency: order.currency,
        });
    } catch (error: any) {
        console.error('Error creating Razorpay order:', error);
        return Response.json(
            { error: 'Failed to create order', details: error.message },
            { status: 500 }
        );
    }
}
