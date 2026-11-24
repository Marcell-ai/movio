const Creator = () => (
  <section className="relative isolate overflow-hidden rounded-3xl border border-slate-700/70 bg-slate-950 px-6 py-8 shadow-xl shadow-black/25 sm:px-10 sm:py-10">
    <div
      aria-hidden="true"
      className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-slate-800/80 via-slate-950 to-slate-950"
    />
    <div
      aria-hidden="true"
      className="absolute -right-16 -top-24 -z-10 size-72 rounded-full bg-cyan-400/10 blur-3xl"
    />
    <div className="flex items-center justify-between gap-8">
      <div className="min-w-0">
        <div
          aria-hidden="true"
          className="mb-5 h-1 w-12 rounded-full bg-gradient-to-r from-teal-300 to-cyan-400"
        />
        <h2 className="text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">
          Marcell Stephen
        </h2>
        <p className="mt-3 text-base font-medium text-slate-300 sm:text-lg">
          Founder <span className="px-1.5 text-teal-300">·</span> Computer Science Student
        </p>
      </div>
      <div
        aria-hidden="true"
        className="relative hidden size-24 shrink-0 items-center justify-center sm:flex"
      >
        <div className="absolute inset-1 rounded-full border border-cyan-300/20" />
        <div className="absolute inset-4 rounded-full border border-teal-300/30" />
        <div className="size-3 rounded-full bg-cyan-300 shadow-[0_0_24px_8px_rgba(103,232,249,0.2)]" />
        <div className="absolute right-2 top-5 size-2 rounded-full bg-teal-200" />
        <div className="absolute bottom-4 left-3 size-1.5 rounded-full bg-cyan-200" />
      </div>
    </div>
  </section>
);

export default Creator;
