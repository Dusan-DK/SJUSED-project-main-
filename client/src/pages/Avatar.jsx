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
    <div className="flex min-h-screen flex-col items-center bg-[#f5f8fb] px-6">
      {/* ── HEADING BLOCK ── (nav is added separately by you) */}
      <div className="mt-10 text-center">
       
        <p className="font-display text-sm font-bold uppercase tracking-widest text-amber-600">
          Your fashion guide
        </p>
         {profile.avatar_name && (
     <span className="my-3 inline-block rounded-full bg-amber-100 px-4 py-1 font-display text-lg font-extrabold text-amber-500">
        {profile.avatar_name}
      </span>
       )}
        <h1 className="mx-auto mt-3 max-w-md text-2xl font-medium leading-snug text-slate-600 sm:text-3xl">
          Click any zone to discover products picked for you.
        </h1>
      </div>

      {/* ── AVATAR + ZONES ──
          THE KEY STRUCTURAL FIX:
          - `relative w-fit` wrapper shrink-wraps the image, so the % positions
            on the zones are measured against the IMAGE, not the whole page.
          - The zones are now INSIDE this wrapper (they were siblings before —
            that was the positioning bug). Absolute children position against
            the nearest `relative` ancestor, which is now this wrapper. */}
      <div className="relative mt-8 w-fit">
        <img
          src={avatarSrc}
          alt="Your avatar"
          className="h-[70vh] w-auto select-none"
          draggable="false"
        />
        {zones.map((zone) => {
          const isHovered = hoveredZone === zone.id;
          return (
            <button
              key={zone.id}
              type="button"
              onClick={() => handleZoneClick(zone.id)}
              onMouseEnter={() => setHoveredZone(zone.id) }
              onMouseLeave={() => setHoveredZone(null)}
              // Inline style is the RIGHT tool ONLY for the dynamic per-zone
              // coordinates — Tailwind can't express arbitrary runtime %s well.
              // Everything visual/static stays in className.
              style={{
                top: zone.top,
                left: zone.left,
                width: zone.width,
                height: zone.height,
              }}
              className={`cursor-pointer absolute flex items-center justify-center rounded-2xl transition ${
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