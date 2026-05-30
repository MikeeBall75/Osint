import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { executeSearch } from "@/lib/search-engine";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { query, queryType } = await req.json();

    if (!query || !queryType) {
      return NextResponse.json(
        { error: "Query and queryType are required" },
        { status: 400 }
      );
    }

    if (!["email", "phone"].includes(queryType)) {
      return NextResponse.json(
        { error: "queryType must be 'email' or 'phone'" },
        { status: 400 }
      );
    }

    // Atomically deduct credit — prevents race conditions / negative balances
    const deducted = await prisma.user.updateMany({
      where: { id: session.user.id, credits: { gte: 1 } },
      data: { credits: { decrement: 1 } },
    });

    if (deducted.count === 0) {
      return NextResponse.json(
        { error: "Insufficient credits. Please purchase more credits." },
        { status: 402 }
      );
    }

    await prisma.creditTransaction.create({
      data: {
        userId: session.user.id,
        amount: -1,
        type: "USAGE",
        description: `Search: ${queryType} - ${query}`,
      },
    });

    const results = await executeSearch(query, queryType);

    const searchRecord = await prisma.searchQuery.create({
      data: {
        userId: session.user.id,
        query,
        queryType,
        results: JSON.stringify(results),
        sources: results.filter((r) => !r.error).length,
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { credits: true },
    });

    return NextResponse.json({
      id: searchRecord.id,
      results,
      creditsRemaining: user?.credits ?? 0,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
