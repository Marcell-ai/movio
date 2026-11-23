import SectionTitle from "@/components/ui/other/SectionTitle";
import { Button } from "@heroui/react";
import Link from "next/link";

const TokenSettings: React.FC = () => (
  <section className="flex flex-col gap-3">
    <SectionTitle>TMDB token</SectionTitle>
    <p className="text-foreground-500 text-sm">
      Movio uses your own TMDB API token, saved in this browser. You can replace or remove it at any
      time.
    </p>
    <Button as={Link} href="/setup" variant="flat" className="w-fit">
      Change or remove token
    </Button>
  </section>
);

export default TokenSettings;
