const Creator = () => (
  <section className="relative isolate overflow-hidden rounded-2xl border border-slate-700/70 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-6 py-7 shadow-xl shadow-black/20 sm:px-8">
    <div
      aria-hidden="true"
      className="absolute -top-20 -right-12 -z-10 size-56 rounded-full bg-cyan-400/10 blur-3xl"
    />
    <div className="flex items-center gap-5">
      <div
        aria-hidden="true"
        className="h-16 w-1 shrink-0 rounded-full bg-gradient-to-b from-cyan-300 to-blue-500"
      />
      <div className="min-w-0">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl">
          Marcell Stephen
        </h2>
        <p className="mt-2 text-sm font-medium tracking-wide text-cyan-200 sm:text-base">
          Computer Science Student
        </p>
      </div>
    </div>
  </section>
);

export default Creator;
