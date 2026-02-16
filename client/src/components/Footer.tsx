export function Footer() {
  return (
    <div className="fixed bottom-0 left-0 right-0 py-3 text-center text-xs text-text-secondary/60 bg-bg-primary border-t border-border/30 z-10 flex items-center justify-center gap-3">
      <span>
        Powered by{' '}
        <a
          href="https://deckster.pro/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:text-accent-hover transition-colors font-medium"
        >
          Deckster
        </a>
      </span>
      <>
          <span className="text-border">·</span>
          <span className="relative group">
            <button
              type="button"
              className="inline-flex items-center gap-1 text-text-secondary/60 hover:text-text-secondary transition-colors cursor-pointer bg-transparent border-none p-0 text-xs"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0">
                <path d="M6 1L2 3V5.5C2 8.15 3.71 10.6 6 11.25C8.29 10.6 10 8.15 10 5.5V3L6 1Z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
                <path d="M4.5 6L5.5 7L7.5 5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              On security
            </button>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-[320px] p-3.5 bg-text-primary text-bg-primary text-[11px] leading-[1.65] rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none text-left z-20">
              <p className="font-semibold text-[12px] mb-1.5">Your data stays yours</p>
              <ul className="flex flex-col gap-1 list-none p-0 m-0">
                <li>
                  <span className="text-emerald-400 mr-1">&#10003;</span>
                  Files are parsed locally in your browser — never uploaded to our servers
                </li>
                <li>
                  <span className="text-emerald-400 mr-1">&#10003;</span>
                  Only extracted slide text is transmitted, encrypted via HTTPS
                </li>
                <li>
                  <span className="text-emerald-400 mr-1">&#10003;</span>
                  No database, no storage — our server is fully stateless and retains nothing after your session
                </li>
                <li>
                  <span className="text-emerald-400 mr-1">&#10003;</span>
                  AI analysis is processed through OpenAI's API, which does not use API data for model training
                </li>
                <li>
                  <span className="text-emerald-400 mr-1">&#10003;</span>
                  API keys are server-side only — never exposed to the browser
                </li>
              </ul>
              {/* Tooltip arrow */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-text-primary" />
            </div>
          </span>
      </>
    </div>
  );
}
