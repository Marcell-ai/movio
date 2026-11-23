import type { ContentType } from "@/types";
import type { ColorType } from "@/types/component";

/**
 * Per-content-type accent styling. Tailwind only generates classes it can find as complete
 * strings in the source, so every class is written out in full here instead of interpolated.
 */
export const ACCENT: Record<
  ContentType,
  {
    color: ColorType;
    /** hover color/scale for icon buttons */
    iconButton: string;
    /** poster card border on hover */
    cardBorder: string;
    /** active tab underline */
    tabCursor: string;
  }
> = {
  movie: {
    color: "primary",
    iconButton: "hover:[&>svg]:scale-125 [&>svg]:hover:text-primary",
    cardBorder: "hover:border-primary",
    tabCursor: "bg-primary h-1 rounded-full",
  },
  tv: {
    color: "warning",
    iconButton: "hover:[&>svg]:scale-125 [&>svg]:hover:text-warning",
    cardBorder: "hover:border-warning",
    tabCursor: "bg-warning h-1 rounded-full",
  },
};
