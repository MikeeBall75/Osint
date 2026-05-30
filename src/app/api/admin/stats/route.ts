import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [totalUsers, totalSearches, totalIntegrations, activeIntegrations] =
    await Promise.all([
      prisma.user.count(),
      prisma.searchQuery.count(),
      prisma.apiIntegration.count(),
      prisma.apiIntegration.count({ where: { enabled: true } }),
    ]);

  const recentSearches = await prisma.searchQuery.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { email: true, name: true } },
    },
  });

  return NextResponse.json({
    totalUsers,
    totalSearches,
    totalIntegrations,
    activeIntegrations,
    recentSearches,
  });
}
