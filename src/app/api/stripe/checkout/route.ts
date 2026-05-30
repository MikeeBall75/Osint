import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stripe, CREDIT_PACKS } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe is not configured. Contact the administrator." },
      { status: 503 }
    );
  }

  try {
    const { packId } = await req.json();
    const pack = CREDIT_PACKS.find((p) => p.id === packId);

    if (!pack) {
      return NextResponse.json(
        { error: "Invalid credit pack" },
        { status: 400 }
      );
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: pack.name,
              description: `${pack.credits} OSINT search credits`,
            },
            unit_amount: pack.price,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXTAUTH_URL}/dashboard/credits?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/dashboard/credits?canceled=true`,
      metadata: {
        userId: session.user.id,
        credits: pack.credits.toString(),
        packId: pack.id,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
