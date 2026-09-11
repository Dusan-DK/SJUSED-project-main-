import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGet } from '../lib/api';

/*
  ZONES AS DATA (same instinct as STEPS and questions):
  Each clickable region is an object. Instead of copy-pasting five near-identical
  <div>s with hand-tuned numbers buried in JSX, we keep the numbers in one place
  and .map over them. Want to nudge the torso box? Edit one object, not JSX.

  - id       → sent to your backend (?zone=torso). UNCHANGED from your base code.
  - label    → what the floating pill shows ("Top" for torso, matching screenshot).
  - top/left/width/height → position as % of the image wrapper.

  Note: I relabeled torso → "Top" to match the screenshot's pill, but the id
  stays 'torso' so your /products?zone=torso link is untouched.
*/
const ZONES = {
  female : [
    { id: 'hair',  label: 'Hair',  top: '7%', left: '39%', width: '20%', height: '8%' },
    { id: 'face',  label: 'Face',  top: '16%', left: '40%', width: '19%', height: '14%' },
    { id: 'torso', label: 'Top',   top: '37%', left: '31%', width: '40%', height: '25%' },
    { id: 'legs',  label: 'Legs',  top: '61%', left: '38%', width: '24%', height: '28%' },
    { id: 'feet',  label: 'Shoes', top: '89%', left: '40%', width: '19%', height: '10%' },
  ],
  male : [
    { id: 'hair',  label: 'Hair',  top: '8%', left: '37%', width: '20%', height: '8%' },
    { id: 'face',  label: 'Face',  top: '16%', left: '37%', width: '19%', height:'14%' },
    { id: 'torso', label: 'Top',   top: '35%', left: '27%', width:'40%', height:'25%' },
    { id: 'legs',  label:'Legs',  top:'60%', left:'34%', width:'25%', height: '29%' },
    { id: 'feet',  label: 'Shoes', top: '89%', left: '35%', width: '23%', height: '7%' },
  ]
};

/*
  Which side of its zone the touch callout ("• Hair") sits on. Alternating keeps
  the labels from stacking in one column, and puts each one in the empty space
  beside the body instead of over the face or clothes. Same for both avatars.
*/
const CALLOUT_SIDE = { hair: 'right', face: 'left', torso: 'right', legs: 'left', feet: 'right' };

function Avatar() {
  const [profile, setProfile] = useState(null);
  // ONE piece of state drives ALL hover visuals. null = nothing hovered.
  const [hoveredZone, setHoveredZone] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    apiGet('/api/avatar/profile')
      .then((data) => {
        if (!cancelled) setProfile(data);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err.status === 401) return navigate('/login');
        /*
          404 = logged in but the quiz was never completed, so there is no
          profile to build an avatar from. Previously the error object was
          stored as the profile: it is truthy, so the `if (!profile)` guard
          below passed and the page rendered with profile.gender undefined —
          silently showing every such user the female avatar.
        */
        if (err.status === 404) return navigate('/avatar/name');
        setError(err.message);
      });

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  function handleZoneClick(zone) {
    // navigate() instead of window.location.href: this is a client-side route
    // change, so React Router swaps the view. Assigning to location.href threw
    // away the whole SPA — full document reload, every asset re-fetched, and
    // /api/me re-requested by the navbar and route guard on the way back.
    navigate(`/products?zone=${zone}`);
  }

  // Error state has to come FIRST — otherwise a failed load is indistinguishable
  // from a slow one and the user stares at "Loading…" forever.
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f8fb]">
        <p className="text-sm font-semibold text-red-500">{error}</p>
      </div>
    );
  }

  // Loading state — styled instead of a bare <p>.
  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f8fb]">
        <p className="text-sm text-slate-400">Loading your avatar…</p>
      </div>
    );
  }

  const avatarSrc =
    profile.gender === 'male' ? '/img/MaleAvatar.png' : '/img/FemaleAvatar.png';
    const zones = profile.gender === 'male' ? ZONES.male : ZONES.female;
    
  return (
    // overflow-x-clip: the avatar box may run slightly past the screen edges on
    // phones (see below) — clip that instead of letting the page scroll sideways.
    <div className="flex min-h-screen flex-col items-center overflow-x-clip bg-[#f5f8fb] px-4 pb-6 sm:px-6 sm:pb-10">
      {/* ── HEADING BLOCK ── tighter on phones so the avatar gets the height */}
      <div className="mt-5 text-center sm:mt-10">
        <p className="font-display text-xs font-bold uppercase tracking-widest text-amber-600 sm:text-sm">
          Your fashion guide
        </p>
        {profile.avatar_name && (
          <span className="mt-2 inline-block rounded-full bg-amber-100 px-4 py-1 font-display text-base font-extrabold text-amber-500 sm:my-3 sm:text-lg">
            {profile.avatar_name}
          </span>
        )}
        <h1 className="mx-auto mt-2 max-w-xs text-lg font-medium leading-snug text-slate-600 sm:mt-3 sm:max-w-md sm:text-3xl">
          {/* pointer-coarse = touchscreen, where there is nothing to "click" */}
          <span className="pointer-coarse:hidden">Click</span>
          <span className="hidden pointer-coarse:inline">Tap</span> any zone to
          discover products picked for you.
        </h1>
      </div>

      {/* ── AVATAR + ZONES ──
          The zones are % positions, so they only line up if this box has the
          image's exact proportions: `aspect-[976/1101]` is the PNG's size, and
          the image fills the box edge to edge.

          THE MOBILE BUG: the old `h-[70vh] w-auto` fixed the HEIGHT and let the
          width follow. On a phone that width was wider than the screen, so
          Tailwind's base `img { max-width: 100% }` squeezed it — and the avatar
          came out stretched thin. Now the WIDTH is set and the height follows:
          - (100svh - 15rem) × 0.886 → as tall as the screen allows under the
            navbar and heading (0.886 = 976 / 1101, width per unit of height).
          - max 100% + 4rem → may run 2rem past each side. The PNG has wide
            transparent margins, so only empty space gets clipped.
          - min 16rem → still usable on a phone held sideways. */}
      <div className="relative mt-4 aspect-[976/1101] w-[calc((100svh_-_15rem)*0.886)] min-w-64 max-w-[calc(100%_+_4rem)] sm:mt-8 sm:w-[calc((100svh_-_20rem)*0.886)] sm:max-w-[min(100%,44rem)]">
        {/* Soft glow behind the figure and a floor shadow under the shoes, so
            the avatar stands on the page instead of floating on flat grey. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-[20%] top-[10%] bottom-[10%] rounded-full bg-amber-200/40 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute bottom-[2.5%] left-1/2 h-[4%] w-[36%] -translate-x-1/2 rounded-[50%] bg-slate-900/15 blur-md" />

        <img
          src={avatarSrc}
          alt="Your avatar"
          className="absolute inset-0 size-full select-none"
          draggable="false"
        />
        {zones.map((zone, i) => {
          const isHovered = hoveredZone === zone.id;
          const calloutLeft = CALLOUT_SIDE[zone.id] === 'left';
          return (
            <button
              key={zone.id}
              type="button"
              aria-label={`Shop ${zone.label}`}
              onClick={() => handleZoneClick(zone.id)}
              /*
                Pointer events, and only for a real mouse. With onMouseEnter, a
                tap on iPhone fired the "hover" first, the pill appeared, and
                Safari treats a tap that changes the page on hover as "just
                hovering" — so the first tap often did nothing at all.
              */
              onPointerEnter={(e) => e.pointerType === 'mouse' && setHoveredZone(zone.id)}
              onPointerLeave={() => setHoveredZone(null)}
              // Inline style is the RIGHT tool ONLY for the dynamic per-zone
              // coordinates — Tailwind can't express arbitrary runtime %s well.
              // Everything visual/static stays in className.
              style={{
                top: zone.top,
                left: zone.left,
                width: zone.width,
                height: zone.height,
              }}
              className={`absolute flex cursor-pointer items-center justify-center rounded-2xl outline-none transition focus-visible:ring-2 focus-visible:ring-amber-400 active:bg-amber-300/25 ${
                isHovered
                  ? 'bg-amber-300/25 ring-2 ring-amber-400'
                  : 'bg-transparent'
              }`}
            >
              {/* Floating label pill — only shows on the hovered zone.
                  This is WHY we needed state: the pill is a child of the zone,
                  but its visibility depends on shared hover state, not on the
                  element itself being styled imperatively. */}
              {isHovered && (
                <span className="pointer-events-none whitespace-nowrap rounded-full bg-amber-400 px-3 py-1 text-sm font-semibold text-slate-900 shadow-sm">
                  • {zone.label}
                </span>
              )}

              {/* Touch callout — phones have no hover, so without this nothing
                  tells you the avatar is tappable or where. A pulsing dot sits
                  on the zone's edge with its label outside the body. It lives
                  INSIDE the button, so tapping the label counts as a tap on
                  the zone — a bigger target than the zone alone. */}
              <span
                aria-hidden="true"
                className={`absolute top-1/2 hidden -translate-y-1/2 items-center gap-1.5 pointer-coarse:flex ${
                  calloutLeft ? 'right-full -mr-1.5 flex-row-reverse' : 'left-full -ml-1.5'
                }`}
              >
                <span className="relative flex size-3">
                  <span
                    className="absolute size-full rounded-full bg-amber-400 opacity-75 motion-safe:animate-ping"
                    // Staggered so the five dots ripple instead of blinking in unison.
                    style={{ animationDelay: `${i * 300}ms` }}
                  />
                  <span className="relative size-3 rounded-full bg-amber-500 ring-2 ring-white" />
                </span>
                <span className="whitespace-nowrap rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200">
                  {zone.label}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default Avatar;




/* import { useState, useEffect } from 'react';

function Avatar() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetch('/api/avatar/profile', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setProfile(data));
  }, []);

  if (!profile) return <p>Loading...</p>;

  function handleZoneClick(zone) {
  window.location.href = `/products?zone=${zone}`;
}

  return (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh' 
  }}>
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <img
        src={profile.gender === 'male' ? '/img/MaleAvatar.png' : '/img/FemaleAvatar.png'}
        alt="avatar"
        style={{ width: 'auto', height: '90vh' }}
      />
    </div>

      <div onClick={() => handleZoneClick('face')} 
      onMouseEnter={e => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'}
      onMouseLeave={e => e.target.style.backgroundColor = 'transparent'}
      style={{
        position: 'absolute', top: '29%', left: '40%',
        width: '19%', height: '14%',
        cursor: 'pointer', backgroundColor: 'transparent'
      }} />

    
        <div onClick={() => handleZoneClick('hair')} 
        onMouseEnter={e => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'}
        onMouseLeave={e => e.target.style.backgroundColor = 'transparent'}   
        style={{
          position: 'absolute', top: '20%', left: '39%',
          width: '20%', height: '8%',
           cursor: 'pointer', backgroundColor: 'transparent'
        }} />

      
      <div onClick={() => handleZoneClick('torso')} 
      onMouseEnter={e => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'}
      onMouseLeave={e => e.target.style.backgroundColor = 'transparent'}
      style={{
        position: 'absolute', top: '44%', left: '38%',
        width: '24%', height: '25%',
        cursor: 'pointer', backgroundColor: 'transparent'
      }} />

      
      <div onClick={() => handleZoneClick('legs')} 
      onMouseEnter={e => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'}
      onMouseLeave={e => e.target.style.backgroundColor = 'transparent'}
      style={{
        position: 'absolute', top: '69%', left: '40%',
        width: '19%', height: '24%',
        cursor: 'pointer', backgroundColor: 'transparent'
      }} />

      
      <div onClick={() => handleZoneClick('feet')} 
      onMouseEnter={e => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'}
      onMouseLeave={e => e.target.style.backgroundColor = 'transparent'}
      style={{
        position: 'absolute', top: '93%', left: '40%',
        width: '19%', height: '10%',
        cursor: 'pointer', backgroundColor: 'transparent'
      }} />
    </div>
);
}

export default Avatar; */