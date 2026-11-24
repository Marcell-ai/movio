import SectionTitle from "@/components/ui/other/SectionTitle";

const Creator = () => (
  <section className="liquid-glass flex flex-col gap-4 rounded-2xl p-5 sm:flex-row sm:items-center">
    <div
      aria-label="Marcell Stephen"
      className="flex size-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 text-xl font-bold text-white shadow-lg"
    >
      MS
    </div>

    <div className="flex flex-col gap-2">
      <SectionTitle>Created by</SectionTitle>
      <div>
        <h2 className="text-lg font-bold">Marcell Stephen</h2>
        <p className="text-primary-500 text-sm font-medium">Computer Science Student</p>
      </div>
      <p className="text-foreground-500 text-sm leading-relaxed">
        Marcell created Movio to turn a love of movies and technology into a simpler, more
        enjoyable way to discover something worth watching.
      </p>
    </div>
  </section>
);

export default Creator;
