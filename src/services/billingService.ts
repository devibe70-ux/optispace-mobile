import RazorpayCheckout from 'react-native-razorpay';

/**
 * Automated Tax Allocation Logic for De Vibe Subscriptions
 * Mapped to SAC Code: 998314
 */
export function calculateSubscriptionTax(customerProfile: { countryCode: string; stateCode: string }, basePlanPrice: number) {
    const COMPANY_STATE_CODE = "24"; // Gujarat
    const HSN_SAC_CODE = "998314";
    
    let taxBreakdown = {
        cgst: 0.00,
        sgst: 0.00,
        igst: 0.00,
        totalTax: 0.00,
        finalAmount: basePlanPrice,
        sacCode: HSN_SAC_CODE,
        invoiceNote: ""
    };

    if (customerProfile.countryCode !== "IN") {
        // Zero-Rated Export Rules (International Sellers / Influencers)
        taxBreakdown.cgst = 0.00;
        taxBreakdown.sgst = 0.00;
        taxBreakdown.igst = 0.00;
        taxBreakdown.totalTax = 0.00;
        taxBreakdown.finalAmount = basePlanPrice;
        taxBreakdown.invoiceNote = "Supply meant for export under Letter of Undertaking (LUT) without payment of integrated tax (IGST).";
    } else {
        // Indian Domestic Tax Rules
        const taxRate = 0.18; // 18% Total GST
        taxBreakdown.totalTax = basePlanPrice * taxRate;
        taxBreakdown.finalAmount = basePlanPrice + taxBreakdown.totalTax;

        if (customerProfile.stateCode === COMPANY_STATE_CODE) {
            // Intra-State Billing (Within Gujarat)
            taxBreakdown.cgst = (basePlanPrice * 0.09); // 9% CGST
            taxBreakdown.sgst = (basePlanPrice * 0.09); // 9% SGST
            taxBreakdown.igst = 0.00;
        } else {
            // Inter-State Billing (Rest of India)
            taxBreakdown.cgst = 0.00;
            taxBreakdown.sgst = 0.00;
            taxBreakdown.igst = (basePlanPrice * 0.18); // 18% IGST
        }
    }

    return taxBreakdown;
}

/**
 * Trigger the Razorpay Native Checkout UI
 */
export const initiateRazorpayCheckout = async (amountInINR: number, description: string): Promise<any> => {
    try {
        // 1. Fetch Order ID from Secure Backend API
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8081';
        const orderResponse = await fetch(`${apiUrl}/api/create-order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: amountInINR * 100, // convert to paise
                currency: 'INR',
                receipt: 'receipt_devibe_' + Date.now()
            })
        });

        if (!orderResponse.ok) {
            throw new Error(`Failed to create order: ${await orderResponse.text()}`);
        }

        const orderData = await orderResponse.json();
        
        if (!orderData.order_id) {
            throw new Error('Order ID was not returned from the server.');
        }

        // 2. Open Razorpay Checkout Modal
        return new Promise((resolve, reject) => {
            const options = {
                description: description,
                image: 'https://i.imgur.com/3g7nmJC.png',
                currency: orderData.currency,
                key: process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || '', // Loaded securely from .env
                amount: orderData.amount, // Already in paise from backend
                order_id: orderData.order_id, // SECURE ORDER ID GENERATED ON BACKEND!
                name: 'De Vibe',
                theme: { color: '#2a5b8f' } // Use primary color
            };

            RazorpayCheckout.open(options).then(async (data: any) => {
                // 3. Verify Signature on Secure Backend API
                try {
                    const verifyResponse = await fetch(`${apiUrl}/api/verify-payment`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            razorpay_order_id: data.razorpay_order_id,
                            razorpay_payment_id: data.razorpay_payment_id,
                            razorpay_signature: data.razorpay_signature
                        })
                    });

                    if (!verifyResponse.ok) {
                        reject(new Error(`Payment Verification Failed: ${await verifyResponse.text()}`));
                        return;
                    }

                    const verifyData = await verifyResponse.json();
                    resolve({ ...data, verification: verifyData });
                } catch (verifyError) {
                    reject(verifyError);
                }
            }).catch((error: any) => {
                // handle checkout failure/cancellation
                reject(error);
            });
        });
    } catch (error) {
        console.error("Initiate Checkout Error:", error);
        throw error;
    }
}
