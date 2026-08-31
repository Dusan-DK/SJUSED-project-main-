import maleAvatar from "/public/img/MaleAvatar.png";
import { Link } from "react-router-dom";

function Hero() {
  return (
    // bg-[#f5f8fb] = the soft cool-grey page background from the screenshot.
    // Arbitrary values like this are fine for one-offs. If you reuse this color
    // a lot, promote it to a --color-* token in your @theme block later.
    <section className="bg-[#f5f8fb]">
      {/*
        max-w-6xl + mx-auto = center the content and stop it stretching on wide screens.
        px-6 = breathing room on the sides (more on mobile-safe spacing below).
        py-16 lg:py-24 = vertical padding, bigger on large screens.
      */}
      <div className="mx-auto max-w-6xl px-6 py-16 lg:py-24">
        {/*
          THE RESPONSIVE SWITCH:
          - default (mobile): flex-col-reverse → text on top, avatar below it.
            We use col-REVERSE because in the JSX the avatar comes first; reverse
            flips the visual order on mobile so text leads. (You wanted stacking,
            text-first — this does it without duplicating markup.)
          - lg: → side by side, avatar on the right.
        */}
        <div className="flex flex-col-reverse items-center gap-12 lg:flex-row lg:justify-between lg:gap-8">
 
          {/* LEFT: text block */}
          <div className="w-full text-center lg:w-1/2 lg:text-left">
            {/*
              font-display = the Poppins token we registered in @theme.
              tracking-tight = tighten letter spacing on big headings (looks sharper).
              The yellow word is its own <span> so only it gets the accent color.
            */}
            <h1 className="font-display text-5xl font-extrabold leading-[1.05] tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
              Stop browsing.<br />
              Start being{" "}
              <span className="text-amber-400">styled.</span>
            </h1>
 
            {/*
              max-w-md keeps the paragraph from running too wide (readability).
              mx-auto centers it on mobile; lg:mx-0 left-aligns it on desktop.
            */}
            <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-slate-500 lg:mx-0">
              Sjused builds a digital you, then hands you a short list of
              self-care and fashion picks matched to your skin, budget and
              taste — the stuff you'd actually buy, without wading through
              200 products.
            </p>
 
            {/* BUTTONS */}
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
              {/*
                Primary button: solid amber, fully rounded (rounded-full).
                transition + hover:bg-* = subtle feedback so it feels alive.
                These are real <button>s — swap to <Link> from react-router later.
              */}
              <Link
               to="/Register"
               className="rounded-full bg-amber-400 px-7 py-3.5 text-sm font-semibold text-slate-900 transition hover:bg-amber-500">
                Build my profile — it's free
              </Link>
 
              {/* Secondary: outlined, transparent. ring-1 draws the thin border. */}
              <Link 
              to="/Login"
              className="rounded-full px-7 py-3.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-300 transition hover:bg-slate-100">
                I have an account
              </Link>
            </div>
 
            {/*
              The little trust strip. We use flex with gap + dot separators.
              The dots are plain spans so they're easy to control.
            */}
            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-slate-500 lg:justify-start">
              <span><strong className="font-semibold text-slate-700">2 min</strong> quiz</span>
              <span className="text-slate-300">•</span>
              <span><strong className="font-semibold text-slate-700">Curated</strong>, never endless</span>
              <span className="text-slate-300">•</span>
              <span><strong className="font-semibold text-slate-700">Yours</strong> to refine anytime</span>
            </div>
          </div>
 
          {/* RIGHT: avatar */}
          <div className="flex w-full justify-center lg:w-1/2">
            {/*
              The screenshot has a soft warm glow behind the avatar.
              We fake it with a blurred radial gradient div positioned behind.
              `relative` on the wrapper + `absolute` on the glow = layering.
            */}
            <div className="relative">
              <div
                className="absolute inset-0 -z-10 rounded-full bg-amber-100/50 blur-3xl"
                aria-hidden="true"
              />
              <img
                src={maleAvatar}
                alt="Your digital avatar"
                className="h-auto w-80 select-none sm:w-80 lg:w-[30rem]"
                draggable="false"
              />
            </div>
          </div>
 
        </div>
      </div>
    </section>
  );
}

export default Hero;