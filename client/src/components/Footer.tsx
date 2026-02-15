export function Footer() {
  return (
    <div className="fixed bottom-0 left-0 right-0 py-3 text-center text-xs text-text-secondary/60 bg-bg-primary border-t border-border/30 z-10">
      Powered by{' '}
      <a
        href="https://deckster.pro/"
        target="_blank"
        rel="noopener noreferrer"
        className="text-accent hover:text-accent-hover transition-colors font-medium"
      >
        Deckster
      </a>
    </div>
  );
}
