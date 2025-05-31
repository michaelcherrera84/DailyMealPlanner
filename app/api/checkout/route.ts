import {NextRequest, NextResponse} from "next/server";
import {getPriceIDFromType} from "@/lib/plans";
import {stripe} from "@/lib/stripe";


export async function POST(request: NextRequest) {

    try {
        const {planType, userId, email} = await request.json();

        if (!planType || !userId || !email)
            return NextResponse.json(
                {error: "Plan type, user id, or email not provided."},
                {status: 400}
            );

        const allowedPlanTypes = ["week", "month", "year"];

        if (!allowedPlanTypes.includes(planType))
            return NextResponse.json(
                {error: "Plan type must be one of: week, month, year."},
                {status: 400}
            )

        const priceID = getPriceIDFromType(planType);

        if (!priceID)
            return NextResponse.json(
                {error: "Plan type not found."},
                {status: 400}
            );

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price: priceID,
                    quantity: 1,
                },
            ],
            customer_email: email,
            mode: "subscription",
            metadata: {clerkUserId: userId, planType},
            success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscribe`,
        });

        return NextResponse.json({url: session.url});
    } catch (error: any) {
        return NextResponse.json(
            {error: error.message},
            {status: 500}
        );
    }
}