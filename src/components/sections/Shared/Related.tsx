"use client";

import SectionTitle from "@/components/ui/other/SectionTitle";
import Carousel from "@/components/ui/wrapper/Carousel";
import { ContentType, TvShowListItem } from "@/types";
import { ACCENT } from "@/utils/accent";
import { Tab, Tabs } from "@heroui/tabs";
import { Movie } from "tmdb-ts/dist/types";
import PosterCard from "./PosterCard";

interface RelatedSectionProps {
  type: ContentType;
  recommendations: (Movie | TvShowListItem)[];
  similar: (Movie | TvShowListItem)[];
}

const RelatedList: React.FC<{ type: ContentType; items: (Movie | TvShowListItem)[] }> = ({
  type,
  items,
}) => (
  <div className="z-3 flex flex-col gap-2">
    <Carousel>
      {items.map((item) => (
        <div key={item.id} className="flex min-h-fit max-w-fit items-center px-1 py-2">
          <PosterCard type={type} item={item} />
        </div>
      ))}
    </Carousel>
  </div>
);

const RelatedSection: React.FC<RelatedSectionProps> = ({ type, recommendations, similar }) => {
  const accent = ACCENT[type];

  return (
    <section id="related" className="z-3">
      <SectionTitle color={accent.color} className="mb-2 sm:mb-0 sm:translate-y-10">
        You may like
      </SectionTitle>
      <Tabs
        aria-label="Related Section"
        variant="underlined"
        className="sm:w-full sm:justify-end"
        classNames={{ cursor: accent.tabCursor }}
      >
        {recommendations.length > 0 && (
          <Tab key="recommendations" title="Recommendations">
            <RelatedList type={type} items={recommendations} />
          </Tab>
        )}
        {similar.length > 0 && (
          <Tab key="similar" title="Similar">
            <RelatedList type={type} items={similar} />
          </Tab>
        )}
      </Tabs>
    </section>
  );
};

export default RelatedSection;
