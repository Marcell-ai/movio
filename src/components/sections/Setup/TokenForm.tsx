"use client";

import BrandLogo from "@/components/ui/other/BrandLogo";
import IconButton from "@/components/ui/button/IconButton";
import { Eye, EyeOff } from "@/utils/icons";
import { Button, Card, CardBody, CardHeader, Input, Link } from "@heroui/react";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface TokenFormProps {
  /** a token is already saved: the form replaces it and offers to remove it */
  hasToken: boolean;
  /** where to go after saving (already sanitized on the server) */
  next: string;
  /** the saved token was rejected by TMDB */
  rejected?: boolean;
}

const TokenForm: React.FC<TokenFormProps> = ({ hasToken, next, rejected }) => {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [show, { toggle }] = useDisclosure(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const request = async (method: "POST" | "DELETE") => {
    const response = await fetch("/api/token", {
      method,
      headers: { "Content-Type": "application/json" },
      body: method === "POST" ? JSON.stringify({ token }) : undefined,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error ?? "Something went wrong. Please try again.");
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await request("POST");
      // full navigation so the server sees the new cookie and cached data is dropped
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  };

  const onRemove = async () => {
    setError(null);
    setLoading(true);
    try {
      await request("DELETE");
      router.push("/setup");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col items-center justify-center gap-6 px-4 py-10">
      <BrandLogo animate />
      <Card
        shadow="lg"
        className="liquid-glass w-full rounded-[2rem] border-white/10 bg-secondary-background/65"
      >
        <CardHeader className="flex flex-col items-start gap-1 px-6 pt-6">
          <h1 className="text-xl font-bold">
            {hasToken ? "Change your TMDB token" : "Connect your TMDB account"}
          </h1>
          <p className="text-foreground-500 text-sm">
            Movio gets all its movie and TV data from TMDB, using your own free API token.
          </p>
        </CardHeader>
        <CardBody className="gap-5 px-6 pb-6">
          {rejected && (
            <p role="alert" className="rounded-medium bg-danger-50 text-danger p-3 text-sm">
              {hasToken
                ? "TMDB didn’t accept your saved token just now. Enter a new one, or keep your saved token and try again."
                : "Your saved token is no longer in this browser (cookies may have been cleared), so please enter it again."}
            </p>
          )}

          <ol className="list-decimal space-y-1 pl-5 text-sm">
            <li>
              Sign in at{" "}
              <Link href="https://www.themoviedb.org/settings/api" target="_blank" size="sm">
                themoviedb.org → Settings → API
              </Link>{" "}
              (free account; you may need to request API access first).
            </li>
            <li>
              Copy the <strong>API Read Access Token</strong>, the long one, not the short API Key.
            </li>
            <li>Paste it below.</li>
          </ol>

          <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
            <Input
              label="API Read Access Token"
              placeholder="eyJhbGciOi…"
              type={show ? "text" : "password"}
              value={token}
              onValueChange={(value) => {
                setToken(value);
                setError(null);
              }}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck="false"
              autoFocus
              classNames={{ input: "select-text" }}
              isInvalid={!!error}
              errorMessage={error}
              endContent={
                <IconButton
                  size="sm"
                  variant="light"
                  aria-label={show ? "Hide token" : "Show token"}
                  onPress={toggle}
                  icon={show ? <EyeOff className="text-xl" /> : <Eye className="text-xl" />}
                />
              }
            />
            <Button
              type="submit"
              color="primary"
              variant="shadow"
              isLoading={loading}
              isDisabled={!token.trim()}
            >
              {loading ? "Checking with TMDB…" : hasToken ? "Save new token" : "Continue"}
            </Button>
          </form>

          <p className="text-foreground-500 text-xs">
            Your token is checked with TMDB, then stored in this browser as a secure cookie that
            page scripts can&apos;t read. This app&apos;s server uses it to request data from TMDB
            for you. It isn&apos;t shared with anyone else.
          </p>

          {hasToken && (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Button as="a" href={next} size="sm" variant="flat">
                Keep saved token
              </Button>
              <Button
                size="sm"
                variant="light"
                color="danger"
                onPress={onRemove}
                isDisabled={loading}
              >
                Remove saved token
              </Button>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default TokenForm;
