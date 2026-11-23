import TokenForm from "@/components/sections/Setup/TokenForm";
import { siteConfig } from "@/config/site";
import { TOKEN_COOKIE, safeNextPath } from "@/utils/token";
import { Metadata } from "next";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: `Set up | ${siteConfig.name}`,
};

interface SetupPageProps {
  searchParams: Promise<{ next?: string; reason?: string }>;
}

const SetupPage = async ({ searchParams }: SetupPageProps) => {
  const [{ next, reason }, jar] = await Promise.all([searchParams, cookies()]);

  return (
    <TokenForm
      hasToken={jar.has(TOKEN_COOKIE)}
      next={safeNextPath(next)}
      rejected={reason === "invalid"}
    />
  );
};

export default SetupPage;
