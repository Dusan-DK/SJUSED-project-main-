import { Link } from 'react-router-dom';

/*
  ─── FILL THESE IN BEFORE PUBLISHING ───────────────────────────────────────
  Anything still null renders as a highlighted [placeholder] on the page, so
  an unfinished policy can't go live unnoticed.

  HOSTING must say where the data REALLY is. The repo currently deploys the
  API + database to Railway (and has a vercel.json proxy), not Render — check
  the region in the dashboard before writing "EU".
*/
const CONTROLLER = {
  name: "Dušan Kostovčík",      // your full name, or company name
  address: "Slovakia, Košice",   // postal address (required for a sole trader / company) // IČO, if you have one. No IČO? Delete this whole line and it disappears from the page.
  email: "kostovcik.dusanwebstyle@gmail.com",
};

const HOSTING = {
  provider: "Render Services, Inc.",  // e.g. 'Render Services, Inc.'
  region: "EU (Frankfurt, Germany)",    // e.g. 'the EU (Frankfurt, Germany)'
};

const LAST_UPDATED = '22 November 2026';
// ───────────────────────────────────────────────────────────────────────────

function Fill({ value, label }) {
  if (value) return value;
  return (
    <mark className="rounded bg-amber-200 px-1 font-semibold text-amber-900">[{label}]</mark>
  );
}

function Section({ id, title, children }) {
  return (
    <section id={id} className="mt-12 scroll-mt-24">
      <h2 className="font-display text-2xl font-extrabold tracking-tight text-slate-900">{title}</h2>
      <div className="mt-4 space-y-4 text-base leading-relaxed text-slate-600">{children}</div>
    </section>
  );
}

const DATA_ROWS = [
  {
    what: 'Account: your email address and password, or your Google account ID if you sign in with Google',
    why: 'To create your account and keep it secure. Passwords are stored only as a one-way hash; nobody can read them.',
    basis: 'Contract (Art. 6(1)(b) GDPR)',
  },
  {
    what: 'Style profile: avatar name, gender, style, budget and age range from the quiz',
    why: 'To build your avatar and choose which products to recommend.',
    basis: 'Contract (Art. 6(1)(b) GDPR)',
  },
  {
    what: 'Liked products',
    why: 'So you can keep a list of things you like.',
    basis: 'Contract (Art. 6(1)(b) GDPR)',
  },
  {
    what: 'Activity: which products were shown to you, which "Buy now" links you clicked, and when you liked or unliked something',
    why: 'To see what is actually useful, improve the recommendations, and understand which shops work well.',
    basis: 'Legitimate interest (Art. 6(1)(f) GDPR) — you can object at any time',
  },
  {
    what: 'Technical data: IP address and basic request information',
    why: 'To keep the service running and secure, e.g. to block repeated failed logins.',
    basis: 'Legitimate interest (Art. 6(1)(f) GDPR)',
  },
];

function Privacy() {
  const email = CONTROLLER.email ? (
    <a href={`mailto:${CONTROLLER.email}`} className="font-semibold text-amber-700 underline underline-offset-2">
      {CONTROLLER.email}
    </a>
  ) : (
    <Fill label="contact email" />
  );

  return (
    <div className="min-h-screen bg-[#f5f8fb]">
      <article className="mx-auto max-w-3xl px-6 py-12">
        <p className="font-display text-sm font-bold uppercase tracking-widest text-amber-600">Legal</p>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-slate-400">Last updated: {LAST_UPDATED}</p>

        {/* The short version — most people read only this. */}
        <div className="mt-8 rounded-2xl bg-white p-6 ring-1 ring-slate-200">
          <p className="font-display text-base font-bold text-slate-900">The short version</p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-600">
            <li>We only collect what we need to recommend things you'll like.</li>
            <li>We never sell your data.</li>
            <li>The only cookie keeps you logged in. No tracking or advertising cookies.</li>
            <li>Some shop links earn us a commission. That never changes your price or what we recommend.</li>
            <li>You can change your answers or delete your whole account yourself, any time, on your profile.</li>
          </ul>
        </div>

        <Section id="controller" title="1. Who is responsible">
          <p>
            The controller of your personal data under the GDPR is:
          </p>
          <p className="rounded-xl bg-white px-5 py-4 ring-1 ring-slate-200">
            <Fill value={CONTROLLER.name} label="full name / company" />
            <br />
            <Fill value={CONTROLLER.address} label="postal address" />
            {CONTROLLER.companyId !== undefined && (
              <>
                <br />
                IČO: <Fill value={CONTROLLER.companyId} label="IČO, or delete this line" />
              </>
            )}
            <br />
            Email: {email}
          </p>
          <p>For any question about your data, or to use any of your rights below, email us.</p>
        </Section>

        <Section id="data" title="2. What we collect, why, and on what legal basis">
          {/* Cards rather than a <table>: a 3-column table is unreadable at phone width. */}
          <div className="space-y-3">
            {DATA_ROWS.map((row) => (
              <div key={row.what} className="rounded-xl bg-white p-5 ring-1 ring-slate-200">
                <p className="font-semibold text-slate-900">{row.what}</p>
                <p className="mt-1 text-sm">{row.why}</p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-amber-700">{row.basis}</p>
              </div>
            ))}
          </div>
          <p>
            Recommendations are suggestions only. We make no automated decisions that have legal or
            similarly significant effects on you.
          </p>
        </Section>

        <Section id="cookies" title="3. Cookies">
          <p>
            We use exactly <strong>one cookie</strong>, <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">connect.sid</code>,
            which keeps you logged in. It is strictly necessary for the service to work, so it does not
            need your consent. It expires after 7 days or when you log out.
          </p>
          <p>
            While you take the quiz, your browser also briefly stores the avatar name you chose
            (in session storage), so it survives a page refresh. It is deleted when you close the tab.
          </p>
          <p>
            We use no analytics, advertising or tracking cookies. If that ever changes, we will ask for your
            consent first.
          </p>
        </Section>

        <Section id="affiliate" title="4. Affiliate links">
          <p>
            Some "Buy now" links are affiliate links: if you buy something after clicking one, the shop may pay
            us a commission.
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li><strong>Your price is the same</strong> whether or not you use our link.</li>
            <li>
              <strong>Commissions do not affect the ranking.</strong> Products are ordered by how well they match
              your profile and what other users find useful, never by what we earn.
            </li>
            <li>
              <strong>We share no personal data with shops</strong> — not your name, email or profile.
            </li>
          </ul>
          <p>
            When you click through, you are on the shop's own website, which has its own privacy policy. Like any
            website, it can see your IP address and that you arrived via our link. Product images are also loaded
            directly from the shops' servers, so they can see your IP address when an image loads, but nothing else
            about you.
          </p>
        </Section>

        <Section id="processors" title="5. Who else handles your data">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Hosting:</strong> <Fill value={HOSTING.provider} label="hosting provider" /> stores
              our database and runs the service in <Fill value={HOSTING.region} label="hosting region" />,
              acting only on our instructions.
            </li>
            <li>
              <strong>Google</strong>, only if you choose "Sign in with Google": Google handles the login and
              shares your email address and Google account ID with us. Google's own privacy policy applies to that
              step. Transfers to Google in the US are covered by the EU–US Data Privacy Framework.
            </li>
          </ul>
          <p className="font-semibold text-slate-900">We never sell your data, and never share it for advertising.</p>
        </Section>

        <Section id="retention" title="6. How long we keep it">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Account, profile, liked products and activity:</strong> for as long as you have an account.
              When you delete your account, all of it is deleted immediately and you are logged out on every device.
            </li>
            <li><strong>Login session:</strong> 7 days, or until you log out.</li>
            <li><strong>Technical data:</strong> only briefly, for security.</li>
          </ul>
        </Section>

        <Section id="rights" title="7. Your rights">
          <p>Under the GDPR you have the right to:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li><strong>Access</strong> — get a copy of the data we hold about you.</li>
            <li>
              <strong>Rectification</strong> — correct it. You can change your quiz answers yourself on your{' '}
              <Link to="/profile" className="font-semibold text-amber-700 underline underline-offset-2">profile</Link>.
            </li>
            <li>
              <strong>Erasure</strong> — have your account and all its data deleted. You can do this yourself with
              "Delete my account" on your{' '}
              <Link to="/profile" className="font-semibold text-amber-700 underline underline-offset-2">profile</Link>.
            </li>
            <li><strong>Restriction</strong> — ask us to limit how we use your data.</li>
            <li><strong>Portability</strong> — receive your data in a machine-readable format.</li>
            <li>
              <strong>Objection</strong> — object to processing based on legitimate interest, including activity
              tracking.
            </li>
          </ul>
          <p>
            To use any of these, email {email}. We reply within one month.
          </p>
          <p>
            You can also complain to the Slovak data protection authority:{' '}
            <strong>Úrad na ochranu osobných údajov Slovenskej republiky</strong>, Hraničná 12, 820 07
            Bratislava 27,{' '}
            <a
              href="https://dataprotection.gov.sk"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-amber-700 underline underline-offset-2"
            >
              dataprotection.gov.sk
            </a>.
          </p>
        </Section>

        <Section id="security" title="8. Security">
          <p>
            Passwords are hashed with bcrypt, connections are encrypted (HTTPS), and the login cookie cannot be read
            by scripts on the page. No system is perfectly secure, but we take reasonable measures to protect your
            data.
          </p>
        </Section>

        <Section id="changes" title="9. Changes to this policy">
          <p>
            If we change this policy, we update the date at the top. For significant changes, we will let you know
            before they take effect.
          </p>
        </Section>
      </article>
    </div>
  );
}

export default Privacy;
