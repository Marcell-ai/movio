import { cn } from "@/utils/helpers";
import { ArrowLeft, Server } from "@/utils/icons";
import ActionButton from "@/components/sections/Shared/ActionButton";

interface MoviePlayerHeaderProps {
  id: number;
  movieName: string;
  hidden?: boolean;
  onOpenSource: () => void;
}

const MoviePlayerHeader: React.FC<MoviePlayerHeaderProps> = ({
  id,
  movieName,
  hidden,
  onOpenSource,
}) => {
  return (
    <div
      className={cn(
        "absolute top-0 z-40 flex h-28 w-full items-start justify-between gap-4",
        "liquid-glass top-2! mx-2 h-20 w-[calc(100%-1rem)] rounded-2xl p-2 text-white transition-opacity md:mx-4 md:w-[calc(100%-2rem)] md:p-4",
        {
          "pointer-events-none opacity-0 focus-within:pointer-events-auto focus-within:opacity-100":
            hidden,
        },
      )}
    >
      <ActionButton type="movie" label="Back" href={`/movie/${id}`}>
        <ArrowLeft size={42} />
      </ActionButton>
      <div className="absolute left-1/2 hidden -translate-x-1/2 flex-col justify-center text-center sm:flex">
        <p className="text-sm text-white text-shadow-lg sm:text-lg lg:text-xl">{movieName}</p>
      </div>
      <div className="flex items-center gap-4">
        <ActionButton type="movie" label="Sources" tooltip="Sources" onClick={onOpenSource}>
          <Server size={34} />
        </ActionButton>
      </div>
    </div>
  );
};

export default MoviePlayerHeader;
