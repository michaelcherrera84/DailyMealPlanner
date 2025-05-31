import {NextRequest, NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
       const {searchParams} = new URL(req.nextUrl);
       const userId = searchParams.get("userId");

       if (!userId)
           return NextResponse.json(
               {error: "User ID not provided."},
               {status: 400}
           );

       const profile = await prisma.profile.findUnique({
           where: {userId: userId},
           select: {subscriptionActive: true}
       });

       return NextResponse.json(
            {subscriptionActive: profile?.subscriptionActive}
        );
    } catch (error: any) {
        return NextResponse.json(
            {error: error.message,},
            {status: 500}
        )
    }
}