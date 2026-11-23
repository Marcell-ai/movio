import { isEmpty } from "@/utils/helpers";
import { getImageUrl } from "@/utils/movies";
import { Image } from "@heroui/image";
import { useWindowScroll } from "@mantine/hooks";
import { useState } from "react";

interface BackdropSectionProps {
  title: string;
  backdropPath?: string;
  logos?: { iso_639_1: string | null; file_path: string }[];
}

const BackdropSection: React.FC<BackdropSectionProps> = ({ title, backdropPath, logos }) => {
  const [{ y }] = useWindowScroll();
  const [backdropFailed, setBackdropFailed] = useState(false);
  const [titleFailed, setTitleFailed] = useState(false);
  const opacity = Math.min((y / 1000) * 2, 1);
  const backdropImage = backdropFailed
    ? "/backdrop-placeholder.svg"
    : getImageUrl(backdropPath, "backdrop", true);
  const titleImage = getImageUrl(
    logos?.find((logo) => logo.iso_639_1 === "en")?.file_path,
    "title",
  );

  return (
    <section id="backdrop" className="fixed inset-0 h-[35vh] md:h-[50vh] lg:h-[70vh]">
      <div className="bg-background absolute inset-0 z-10" style={{ opacity }} />
      <div className="from-background absolute inset-0 z-2 bg-linear-to-b from-1% via-transparent via-30%" />
      <div className="from-background absolute inset-0 z-2 translate-y-px bg-linear-to-t from-1% via-transparent via-55%" />
      {!isEmpty(titleImage) && !titleFailed && (
        <Image
          isBlurred
          radius="none"
          alt={title}
          classNames={{ wrapper: "absolute-center z-1 bg-transparent" }}
          className="w-[25vh] max-w-80 drop-shadow-xl md:w-[60vh]"
          src={titleImage}
          onError={() => setTitleFailed(true)}
        />
      )}
      <Image
        radius="none"
        alt={title}
        loading="eager"
        fetchPriority="high"
        decoding="async"
        className="z-0 h-[35vh] w-screen object-cover object-center md:h-[50vh] lg:h-[70vh]"
        src={backdropImage}
        onError={() => setBackdropFailed(true)}
      />
    </section>
  );
};

export default BackdropSection;
