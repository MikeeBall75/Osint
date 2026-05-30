import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user || user.role !== "ADMIN") return null;
  return user;
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const integrations = await prisma.apiIntegration.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(integrations);
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      name,
      description,
      type,
      baseUrl,
      headers,
      endpointTemplate,
      responseMapping,
      enabled,
    } = body;

    if (!name || !type || !baseUrl || !endpointTemplate) {
      return NextResponse.json(
        {
          error:
            "name, type, baseUrl, and endpointTemplate are required",
        },
        { status: 400 }
      );
    }

    const integration = await prisma.apiIntegration.create({
      data: {
        name,
        description: description || null,
        type,
        baseUrl,
        headers: JSON.stringify(headers || {}),
        endpointTemplate,
        responseMapping: JSON.stringify(responseMapping || {}),
        enabled: enabled !== false,
      },
    });

    return NextResponse.json(integration, { status: 201 });
  } catch (error) {
    console.error("Create integration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
