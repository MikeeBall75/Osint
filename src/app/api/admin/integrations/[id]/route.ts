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

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const integration = await prisma.apiIntegration.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(type !== undefined && { type }),
        ...(baseUrl !== undefined && { baseUrl }),
        ...(headers !== undefined && { headers: JSON.stringify(headers) }),
        ...(endpointTemplate !== undefined && { endpointTemplate }),
        ...(responseMapping !== undefined && {
          responseMapping: JSON.stringify(responseMapping),
        }),
        ...(enabled !== undefined && { enabled }),
      },
    });

    return NextResponse.json(integration);
  } catch (error) {
    console.error("Update integration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    await prisma.apiIntegration.delete({ where: { id: params.id } });
    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    console.error("Delete integration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
