const STEPS = [
  {
    number: "01",
    title: "Take the style quiz",
    description: "Six quick questions on style, skin, budget and age.",
  },
  {
    number: "02",
    title: "Meet your avatar",
    description: "A digital you. Tap any body zone you want help with.",
  },
  {
    number: "03",
    title: "Get your picks",
    description: "A short, ranked shortlist — filtered to exactly you.",
  },
];
 
function HowItWorks() {
  return (
    <section className="bg-[#f5f8fb]">
      <div className="mx-auto max-w-6xl px-6 py-16 lg:py-24">
 
        {/* Section header — centered */}
        <div className="mx-auto max-w-xl text-center">
          <h2 className="font-display text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            How Sjused works
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-500">
            Three steps between you and a recommendation you'll actually believe.
          </p>
        </div>
 
        {/*
          The card grid:
          - mobile: 1 column (cards stack)
          - md and up: 3 equal columns (grid-cols-3)
          gap-6 spaces them evenly.
        */}
        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {STEPS.map((step) => (
            <div
              key={step.number}
              className="rounded-2xl border border-slate-200 bg-white/60 p-8 transition hover:border-slate-300 hover:shadow-sm"
            >
              {/* The big amber number */}
              <p className="font-display text-3xl font-extrabold text-amber-500">
                {step.number}
              </p>
              <h3 className="mt-5 font-display text-lg font-bold text-slate-900">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-500">
                {step.description}
              </p>
            </div>
          ))}
        </div>
 
      </div>
    </section>
  );
}

export default HowItWorks;