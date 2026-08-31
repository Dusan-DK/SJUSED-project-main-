import { useState } from 'react';
import { useLocation } from 'react-router-dom'
import { useNavigate } from 'react-router-dom';
/*
  DATA SHAPE — the important change:
  Options used to be plain strings ('oldMoney'). Now each option is an object:
    { value, label, description? }
  - value  → the EXACT string sent to your DB (unchanged — contract intact)
  - label  → what the user sees (e.g. "Old money" instead of "oldMoney")
  - description → optional sub-text (only style + budget have these)

  Your backend still receives question.id as the key and option.value as the value.
  The label/description never leave the browser.
*/
const questions = [
  {
    id: 'gender',
    question: 'First, who are we styling?',
    subtitle: 'This shapes your avatar and the fit of every pick.',
    options: [
      { value: 'female', label: 'Female' },
      { value: 'male', label: 'Male' },
      { value: 'other', label: 'Non-binary' }, // value stays 'other' for your DB
    ],
  },
  {
    id: 'style_archetype',
    question: 'How would you describe your style?',
    subtitle: 'Pick the one that feels most like you.',
    multiSelect: true,
    options: [
      { value: 'oldMoney', label: 'Old money', description: 'Quiet, timeless, tailored' },
      { value: 'streetwear', label: 'Streetwear', description: 'Bold, relaxed, statement' },
      { value: 'casual', label: 'Casual', description: 'Easy, everyday, comfortable' },
      { value: 'elegant', label: 'Elegant', description: 'Polished, refined, sleek' },
      { value: 'minimalist', label: 'Minimalist', description: 'Clean lines, neutral, considered' },
    ],
  },
  {
    id: 'skin_type',
    question: 'What is your skin type?',
    subtitle: 'So skincare picks actually suit you.',
    options: [
      { value: 'oily', label: 'Oily' },
      { value: 'dry', label: 'Dry' },
      { value: 'combination', label: 'Combination' },
      { value: 'normal', label: 'Normal' },
      { value: 'sensitive', label: 'Sensitive' },
    ],
  },
  {
    id: 'budget',
    question: "What's your budget?",
    subtitle: 'We only ever show you things in range.',
    options: [
      { value: 'low', label: 'Low', description: 'Smart everyday value' },
      { value: 'medium', label: 'Medium', description: 'Considered mid-range' },
      { value: 'high', label: 'High', description: 'Premium, fewer-better' },
      { value: 'premium', label: 'Premium', description: 'Luxury, no compromise' },
    ],
  },
  {
    id: 'age_range',
    question: 'Which age range fits you?',
    subtitle: 'Helps us tune the recommendations.',
    options: [
      { value: '<18', label: 'Under 18' },
      { value: '18-24', label: '18–24' },
      { value: '25-34', label: '25–34' },
      { value: '35+', label: '35 and up' },
    ],
  },
  {
    id: 'primary_interest',
    question: 'What are you most interested in?',
    subtitle: 'You can always change this later.',
    options: [
      { value: 'fashion', label: 'Fashion' },
      { value: 'skincare', label: 'Skincare' },
      { value: 'both', label: 'A bit of both' },
    ],
  },
];



function Quiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedStyles, setSelectedStyles] = useState([]);
  
  const navigate = useNavigate();
  const location = useLocation();
  const avatarName = location.state?.avatarName;

  const question = questions[currentQuestion];
  const isLast = currentQuestion === questions.length - 1;

  // Progress: how many questions are BEHIND us, as a %.
  // currentQuestion is 0-indexed, so on Q1 it's 0% — matches your screenshot.
  const progressPercent = Math.round((currentQuestion / questions.length) * 100);



  function handleStyleToggle(value) {
    if (selectedStyles.includes(value)) {
      setSelectedStyles(selectedStyles.filter((s) => s !== value));
    } else {
      setSelectedStyles([...selectedStyles, value]);
    }
  }

  function handleBack() {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  }

  async function handleAnswer(answerValue) {
    const updatedAnswers = { ...answers, [question.id]: answerValue };
    setAnswers(updatedAnswers);

    // BUG FIX: reset the multi-select buffer after a style question is submitted,
    // so stale selections don't leak into a later question.
    setSelectedStyles([]);

    if (!isLast) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      const response = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updatedAnswers, avatar_name: avatarName }),
        credentials: 'include',
      });

      if (response.ok) {
        navigate('/avatar');
      } else {
        alert('Something went wrong, try again');
      }
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f8fb]">
      {/* ── TOP BAR: wordmark + progress pills ── */}
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 pt-12">
        <p className="font-display text-lg font-extrabold tracking-tight text-amber-400">
          SJUSED
        </p>

        {/*
          PROGRESS PILLS:
          We .map over the questions array to draw one pill per question.
          A pill is "filled" (amber) if its index is <= the current question.
          Driving this off the same array means it can never go out of sync.
        */}
        <div className="flex items-center gap-2">
          {questions.map((q, index) => (
            <span
              key={q.id}
              className={`h-1.5 w-8 rounded-full transition-colors ${
                index <= currentQuestion ? 'bg-amber-400' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>

        {/* Skip removed on purpose — it would break the recommendation profile.
            Empty span keeps the wordmark + pills spacing balanced. */}
        <span className="w-12" />
      </header>

      {/* ── QUESTION BLOCK ── */}
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 pt-16">
        <p className="font-display text-sm font-bold text-amber-600">
          Question {currentQuestion + 1} of {questions.length}
        </p>
        <h1 className="mt-3 font-display text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl">
          {question.question}
        </h1>
        <p className="mt-3 text-base text-slate-500">{question.subtitle}</p>

        {/* ── OPTIONS ── */}
        {question.multiSelect ? (
          // MULTI-SELECT (style question): toggle cards + a Continue button
          <div className="mt-10">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {question.options.map((option) => {
                const isSelected = selectedStyles.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleStyleToggle(option.value)}
                    /*
                      Conditional classes: when selected, amber border + ring +
                      a faint amber tint so the pick is obvious. Otherwise the
                      plain white card. text-left because these have descriptions.
                    */
                    className={`rounded-2xl border p-5 text-left transition ${
                      isSelected
                        ? 'border-amber-400 bg-amber-50 ring-1 ring-amber-400'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <p className="font-display text-base font-bold text-slate-900">
                      {option.label}
                    </p>
                    {option.description && (
                      <p className="mt-1 text-sm text-slate-500">{option.description}</p>
                    )}
                  </button>
                );
              })}
            </div>

            {/*
              Continue is disabled until at least one style is picked.
              disabled:* classes grey it out so the user understands why.
            */}
            <button
              type="button"
              onClick={() => handleAnswer(selectedStyles)}
              disabled={selectedStyles.length === 0}
              className="mt-8 w-full rounded-full bg-amber-400 py-3.5 text-sm font-semibold text-slate-900 transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 sm:w-auto sm:px-10"
            >
              Continue
            </button>
          </div>
        ) : (
          // SINGLE-SELECT: clicking a card immediately advances
          <div
            /*
              Layout switch: questions WITH descriptions (budget) read better as
              a single stacked column; short ones use a 2-col grid like the
              screenshots. We detect descriptions to decide.
            */
            className={`mt-10 grid gap-4 ${
              question.options.some((o) => o.description)
                ? 'grid-cols-1'
                : 'grid-cols-1 sm:grid-cols-2'
            }`}
          >
            {question.options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleAnswer(option.value)}
                className="rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:border-amber-400 hover:ring-1 hover:ring-amber-400"
              >
                <p className="font-display text-base font-bold text-slate-900">
                  {option.label}
                </p>
                {option.description && (
                  <p className="mt-1 text-sm text-slate-500">{option.description}</p>
                )}
              </button>
            ))}
          </div>
        )}
      </main>

      {/* ── FOOTER: Back + % complete ── */}
      <footer className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 pb-12 pt-16">
        {/*
          Back is hidden (invisible) on Q1 so the layout doesn't jump, but the
          space is reserved. disabled guard in handleBack is the real safety.
        */}
        <button
          type="button"
          onClick={handleBack}
          className={`text-sm font-semibold text-slate-600 transition hover:text-slate-900 ${
            currentQuestion === 0 ? 'pointer-events-none opacity-0' : ''
          }`}
        >
          ← Back
        </button>
        <span className="text-sm text-slate-400">{progressPercent}% complete</span>
      </footer>
    </div>
  );
}

export default Quiz;











/* import { useState } from 'react';

const questions = [
  {
    id: 'gender',
    question: 'What is your gender?',
    options: ['male', 'female', 'other']
  },
  {
    id: 'style_archetype',
    question: 'How would you describe your style?',
    options: ['oldMoney', 'streetwear', 'casual', 'elegant', 'minimalist'],
    multiSelect: true
  },
  {
    id: 'skin_type',
    question: 'What is your skin type?',
    options: ['oily', 'dry', 'combination', 'normal', 'sensitive']
  },
  {
    id: 'budget',
    question: 'What is your budget?',
    options: ['low', 'medium', 'high', 'premium']
  },
  {
    id: 'age_range',
    question: 'What is your age range?',
    options: ['<18', '18-24', '25-34', '35+']
  },
  {
    id: 'primary_interest',
    question: 'What are you most interested in?',
    options: ['fashion', 'skincare', 'both']
  }
];

function Quiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedStyles, setSelectedStyles] = useState([]);


  function handleStyleToggle(option) {
  if (selectedStyles.includes(option)) {
    setSelectedStyles(selectedStyles.filter(s => s !== option));
  } else {
    setSelectedStyles([...selectedStyles, option]);
  }
}

  async function handleAnswer(option) {
  const question = questions[currentQuestion];
  const updatedAnswers = { ...answers, [question.id]: option };
  setAnswers(updatedAnswers);

  if (currentQuestion < questions.length - 1) {
    setCurrentQuestion(currentQuestion + 1);
  } else {
    const response = await fetch('/api/quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedAnswers),
      credentials: 'include',
    });

    if (response.ok) {
      window.location.href = '/avatar';
    } else {
      alert('Something went wrong, try again');
    }
  }
}
 

  return (
    <div>
      <h2>{questions[currentQuestion].question}</h2>
    {questions[currentQuestion].multiSelect ? (
  <div>
    {questions[currentQuestion].options.map(option => (
      <button 
        key={option} 
        onClick={() => handleStyleToggle(option)}
        style={{ 
          backgroundColor: selectedStyles.includes(option) ? 'black' : 'white',
          color: selectedStyles.includes(option) ? 'white' : 'black'
        }}
      >
        {option}
      </button>
    ))}
    <button onClick={() => handleAnswer(selectedStyles)}>
      Continue
    </button>
  </div>
) : (
  <div>
    {questions[currentQuestion].options.map((option) => (
      <button key={option} onClick={() => handleAnswer(option)}>
        {option}
      </button>
    ))}
  </div>
)}
</div>
  );
}

export default Quiz; */