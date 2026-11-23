"use client";

import SectionTitle from "@/components/ui/other/SectionTitle";
import Carousel from "@/components/ui/wrapper/Carousel";
import { ContentType } from "@/types";
import { ACCENT } from "@/utils/accent";
import { getImageUrl } from "@/utils/movies";
import { User } from "@heroui/react";
import { Cast } from "tmdb-ts";

interface CastsSectionProps {
  type: ContentType;
  casts: Cast[];
}

const CastsSection: React.FC<CastsSectionProps> = ({ type, casts }) => {
  return (
    <section id="casts" className="z-3 flex flex-col gap-2">
      <SectionTitle color={ACCENT[type].color}>Top Casts</SectionTitle>
      <Carousel classNames={{ container: "gap-5" }}>
        {casts.map((cast) => {
          const avatar = getImageUrl(cast.profile_path, "avatar");
          return (
            <div key={cast.credit_id} className="flex max-w-fit items-center px-1 py-2">
              <User
                name={cast.name}
                description={cast.character}
                avatarProps={{
                  src: avatar,
                  size: "lg",
                  showFallback: true,
                  isBordered: true,
                }}
              />
            </div>
          );
        })}
      </Carousel>
    </section>
  );
};

export default CastsSection;
