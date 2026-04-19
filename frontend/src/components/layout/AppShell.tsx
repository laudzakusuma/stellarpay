import { Navbar } from './Navbar';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Background mesh */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(232,184,109,0.05) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(56,189,248,0.04) 0%, transparent 60%)',
        }}
      />

      <Navbar />

      <main className="flex-1 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">{children}</div>
      </main>

      <footer className="border-t border-white/[0.06] py-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <p className="text-xs text-text-muted font-body">
            StellarPay &copy; {new Date().getFullYear()} — Testnet Only
          </p>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-text-muted hover:text-text-secondary transition-colors"
          >
            GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}
