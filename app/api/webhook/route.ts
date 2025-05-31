import {NextRequest, NextResponse} from "next/server";
import Stripe from "stripe";
import {prisma} from "@/lib/prisma";
import {subscription} from "swr/subscription";


export async function POST(request: NextRequest) {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    let event: Stripe.Event;

    try {
        event = Stripe.webhooks.constructEvent(body, signature || "", webhookSecret);
    } catch (error: any) {
        return NextResponse.json(
            {error: error.message},
            {status: 400}
        );
    }

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object as Stripe.Checkout.Session;
                await handleCheckoutSessionCompleted(session);
                break;
            }

            case "invoice.payment_failed": {
                const invoice = event.data.object as Stripe.Invoice;
                await handleInvoicePaymentFailed(invoice);
                break;
            }

            case "customer.subscription.deleted": {
                const subscription = event.data.object as Stripe.Subscription;
                await handleCustomerSubscriptionDeleted(subscription);
                break;
            }

            default: {
                console.log(`Unhandled event type ${event.type}`);
            }
        }
    } catch (error: any) {
        return NextResponse.json(
            {error: error.message},
            {status: 500}
        );
    }

    return NextResponse.json({});
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    const userId = session.metadata?.clerkUserId;
    if (!userId) {
        console.log("No user ID found in session metadata.");
        return;
    }

    const subscriptionId = session.subscription as string;
    if (!subscriptionId) {
        console.log("No subscription ID found in session.");
        return;
    }

    try {
        await prisma.profile.update({
            where: {userId},
            data: {
                subscriptionActive: true,
                subscriptionTier: session.metadata?.planType || null,
                stripeSubscriptionId: subscriptionId,
            },
        })
    } catch (error: any) {
        console.error(error.message);
    }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
    const subId = invoice.parent?.subscription_details?.subscription as string;
    if (!subId) {
        console.log("No subscription ID found in invoice.");
        return;
    }

    let userId: string | undefined;
    try {
        const profile = await prisma.profile.findUnique({
            where: {stripeSubscriptionId: subId},
            select: {userId: true},
        })

        if (!profile?.userId) {
            console.log("No user ID found in profile.");
            return;
        }

        userId = profile.userId;
    } catch (error: any) {
        console.error(error.message);
        return;
    }

    try {
        await prisma.profile.update({
            where: {userId: userId},
            data: {
                subscriptionActive: false,
            },
        })
    } catch (error: any) {
        console.error(error.message);
    }
}

async function handleCustomerSubscriptionDeleted(subscription: Stripe.Subscription) {
    const subId = subscription.id;

    let userId: string | undefined;
    try {
        const profile = await prisma.profile.findUnique({
            where: {stripeSubscriptionId: subId},
            select: {userId: true},
        })

        if (!profile?.userId) {
            console.log("No user ID found in profile.");
            return;
        }

        userId = profile.userId;
    } catch (error: any) {
        console.error(error.message);
        return;
    }

    try {
        await prisma.profile.update({
            where: {userId: userId},
            data: {
                subscriptionActive: false,
                subscriptionTier: null,
                stripeSubscriptionId: null,
            },
        })
    } catch (error: any) {
        console.error(error.message);
    }
}