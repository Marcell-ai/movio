import SectionTitle from "@/components/ui/other/SectionTitle";
import { Button } from "@heroui/react";
import Link from "next/link";

const TokenSettings: React.FC = () => (
  <section className="liquid-glass flex flex-col gap-3 rounded-2xl p-5">
    <SectionTitle>TMDB token</SectionTitle>
    <p className="text-foreground-500 text-sm">
      Movio uses your own TMDB API token, saved in this browser. You can replace or remove it at any
      time.
    </p>
    <Link href="/setup" className="w-fit">
      <Button variant="flat">Change or remove token</Button>
    </Link>
  </section>
);

export default TokenSettings;
