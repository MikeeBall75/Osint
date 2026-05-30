import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Seed NumVerify phone validation integration
  const existing = await prisma.apiIntegration.findFirst({
    where: { name: "NumVerify" },
  });

  if (existing) {
    console.log("NumVerify integration already exists — skipping.");
    return;
  }

  await prisma.apiIntegration.create({
    data: {
      name: "NumVerify",
      description: "Phone number validation and carrier information",
      type: "phone",
      baseUrl: "https://numverify.com",
      endpointTemplate:
        "/api?access_key={{env.NUMVERIFY_API_KEY}}&number={{query}}",
      headers: JSON.stringify({}),
      responseMapping: JSON.stringify({
        valid: "$.valid",
        number: "$.number",
        local_format: "$.local_format",
        international_format: "$.international_format",
        country_code: "$.country_code",
        country_name: "$.country_name",
        location: "$.location",
        carrier: "$.carrier",
        line_type: "$.line_type",
      }),
      enabled: true,
    },
  });

  console.log("NumVerify integration seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
