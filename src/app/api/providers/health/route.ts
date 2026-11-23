import { playerProviders } from "@/config/players";
import { NextRequest } from "next/server";

type HealthResult = {
  origin: string;
  online: boolean;
};

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin") {
    return Response.json({ success: false, status_message: "Forbidden" }, { status: 403 });
  }

  const origins = new Set<string>();

  for (const provider of playerProviders.filter(({ enabled }) => enabled)) {
    const sample = provider.movie("1");
    origins.add(new URL(sample).origin);
  }

  const results = await Promise.all(
    [...origins].map(async (origin): Promise<HealthResult> => {
      try {
        const response = await fetch(origin, {
          method: "HEAD",
          redirect: "follow",
          signal: AbortSignal.timeout(5_000),
          cache: "no-store",
        });
        return { origin, online: response.status < 500 };
      } catch {
        return { origin, online: false };
      }
    }),
  );

  return Response.json(
    { success: true, providers: results },
    {
      headers: {
        "Cache-Control": "private, max-age=300",
      },
    },
  );
}
