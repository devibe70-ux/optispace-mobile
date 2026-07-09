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
export const initiateRazorpayCheckout = (amountInINR: number, description: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        // Options required by Razorpay
        var options = {
            description: description,
            image: 'https://i.imgur.com/3g7nmJC.png',
            currency: 'INR',
            key: process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || '', // Loaded securely from .env
            amount: amountInINR * 100, // Amount in paise
            name: 'De Vibe',
            theme: {color: '#2a5b8f'} // Use primary color
        };

        RazorpayCheckout.open(options).then((data: any) => {
            // handle success
            resolve(data);
        }).catch((error: any) => {
            // handle failure
            reject(error);
        });
    });
}
