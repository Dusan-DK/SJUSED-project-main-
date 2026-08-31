import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function NameAvatar() {
  const [avatarName, setAvatarName] = useState('');
  const navigate = useNavigate();

  function handleContinue() {
    // Pass the name to the quiz via navigation state.
    // The quiz reads it with useLocation() and sends it in the final payload.
    // (Note: navigation state is lost on a hard refresh — fine here, since the
    //  name only needs to survive the click-through to the quiz.)
    navigate('/quiz', { state: { avatarName } });
  }

  return (
    <div className="flex min-h-screen items-center bg-white px-6">
      <div className="mx-auto w-full max-w-xl">

        {/* Big stacked heading — alternating amber/slate words */}
        <h1 className="font-display text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
          <span className="text-amber-400">FEW</span><br />
          <span className="text-slate-900">QUESTIONS</span><br />
          <span className="text-slate-900">FOR</span><br />
          <span className="text-amber-400">BETTER</span><br />
          <span className="text-slate-900">KNOWING</span>
        </h1>

        {/* Input block */}
        <div className="mt-12">
          <label htmlFor="avatarName" className="block text-lg text-slate-700">
            How should we call your fashion guide?
          </label>
          <input
            id="avatarName"
            type="text"
            value={avatarName}
            onChange={(e) => setAvatarName(e.target.value)}
            placeholder="Give them a name…"
            className="mt-4 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3.5 text-slate-900 placeholder:text-slate-400 transition focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/40"
          />
        </div>

        {/* Continue button — centered, disabled until a name is typed */}
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={handleContinue}
            disabled={avatarName.trim() === ''}
            className="rounded-full bg-amber-400 px-12 py-3.5 text-sm font-semibold text-slate-900 transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
          >
            Let's explore
          </button>
        </div>

      </div>
    </div>
  );
}

export default NameAvatar;




/* import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function NameAvatar() {
  const [avatarName, setAvatarName] = useState('');
  const navigate = useNavigate();

  function handleContinue() {
    // Pass the name to the quiz via router STATE — it rides in router memory
    // through the whole quiz, and gets attached to the payload at the end.
    // .trim() so a stray space doesn't count as a "name".
    navigate('/quiz', { state: { avatarName: avatarName.trim() } });
  }

  // Allow Enter key to submit, like a normal form field.
  function handleKeyDown(e) {
    if (e.key === 'Enter' && avatarName.trim()) {
      handleContinue();
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f8fb] px-6">
      <div className="w-full max-w-md">

         Big vertical heading — amber accent lines, like the screenshot 
        <h1 className="font-display text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
          <span className="text-amber-400">Few</span>
          <br />
          <span className="text-slate-900">questions</span>
          <br />
          <span className="text-slate-900">for</span>
          <br />
          <span className="text-amber-400">better</span>
          <br />
          <span className="text-slate-900">knowing</span>
        </h1>

        {/* Input 
        <label htmlFor="avatarName" className="mt-12 block text-base text-slate-700">
          What should we call your fashion guide?
        </label>
        <input
          id="avatarName"
          type="text"
          value={avatarName}
          onChange={(e) => setAvatarName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. Oscar"
          autoFocus
          className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 transition focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
        />

        {/* Continue — disabled until a name is typed 
        <button
          type="button"
          onClick={handleContinue}
          disabled={!avatarName.trim()}
          className="mt-8 rounded-full bg-amber-400 px-10 py-3.5 text-sm font-semibold text-slate-900 transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
        >
          Let's explore
        </button>

      </div>
    </div>
  );
}

export default NameAvatar; */