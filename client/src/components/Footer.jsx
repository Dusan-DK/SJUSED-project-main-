import { Link } from 'react-router-dom';

/*
  Site-wide footer, mainly so the privacy policy is reachable from every page —
  the GDPR expects it to be easy to find, not buried.
*/
export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white px-8 py-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 text-sm text-gray-500 sm:flex-row">
        <p>© {new Date().getFullYear()} SJUSED</p>
        <Link to="/privacy" className="font-medium transition-colors hover:text-gray-900">
          Privacy Policy
        </Link>
      </div>
    </footer>
  );
}
