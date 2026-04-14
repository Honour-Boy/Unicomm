import { useNavigate } from "react-router-dom";

function Intro() {
  const navigate = useNavigate();

  return (
    <div className="w-screen min-h-screen max-h-screen overflow-y-auto bg-uni-bg text-uni-text font-sans">
      {/* Ambient gradient orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full bg-violet-600/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-20 backdrop-blur-md bg-uni-bg/80 border-b border-uni-border">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-bubble">
              <span className="text-white font-bold text-lg">U</span>
            </div>
            <span className="text-lg font-bold tracking-tight">Unicomm</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm text-uni-muted">
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a
              href="#how-it-works"
              className="hover:text-white transition-colors"
            >
              How it works
            </a>
            <a href="#pricing" className="hover:text-white transition-colors">
              Pricing
            </a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 text-sm font-medium text-uni-text hover:text-white transition-colors"
            >
              Log in
            </button>
            <button
              onClick={() => navigate("/register")}
              className="px-4 py-2 text-sm font-semibold text-white rounded-lg bg-bubble-sent shadow-bubble hover:opacity-90 transition-opacity"
            >
              Get started
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 md:pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-uni-surface border border-uni-border text-xs font-medium text-uni-muted mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-uni-online animate-pulse-dot" />
          Real-time translation, now in beta
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] max-w-4xl mx-auto">
          Chat across{" "}
          <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            every language
          </span>
          , instantly.
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-uni-muted max-w-2xl mx-auto leading-relaxed">
          Unicomm translates messages as you send them. Your team writes in
          their native language — everyone else reads in theirs.
        </p>

        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate("/register")}
            className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-white rounded-xl bg-bubble-sent shadow-bubble hover:opacity-90 transition-opacity"
          >
            Start chatting free
          </button>
          <button
            onClick={() => navigate("/login")}
            className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-white rounded-xl bg-uni-surface border border-uni-border hover:bg-uni-surface2 transition-colors"
          >
            I have an account
          </button>
        </div>

        {/* Chat preview mockup */}
        <div className="mt-16 md:mt-20 max-w-3xl mx-auto">
          <div className="rounded-2xl border border-uni-border bg-uni-surface/60 backdrop-blur-sm shadow-2xl overflow-hidden">
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-uni-border">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
              <span className="ml-3 text-xs text-uni-muted">
                Mei · EN → JA
              </span>
            </div>
            <div className="p-6 space-y-3 text-left">
              <div className="flex justify-start">
                <div className="max-w-[70%]">
                  <div className="px-4 py-2.5 rounded-2xl rounded-bl-md bg-uni-surface border border-uni-border text-sm text-uni-text">
                    こんにちは！プロジェクトの件で話せますか？
                  </div>
                  <p className="text-[11px] text-uni-muted mt-1">
                    translated from Japanese
                  </p>
                </div>
              </div>
              <div className="flex justify-end">
                <div className="max-w-[70%] flex flex-col items-end">
                  <div className="px-4 py-2.5 rounded-2xl rounded-br-md bg-bubble-sent text-white text-sm shadow-bubble">
                    Of course — let me share the latest mockups.
                  </div>
                  <p className="text-[11px] text-indigo-300/80 mt-1">
                    Translated to Japanese
                  </p>
                </div>
              </div>
              <div className="flex justify-start">
                <div className="max-w-[70%]">
                  <div className="px-4 py-2.5 rounded-2xl rounded-bl-md bg-uni-surface border border-uni-border text-sm text-uni-text">
                    完璧。ありがとう！
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Built for teams that speak every language
          </h2>
          <p className="mt-3 text-uni-muted max-w-xl mx-auto">
            Everything you need for clear, professional, multilingual
            conversations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <FeatureCard
            title="Instant translation"
            description="Messages are translated the moment you hit send — no delays, no context-switching."
            icon={
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m5 8 6 6" />
                <path d="m4 14 6-6 2-3" />
                <path d="M2 5h12" />
                <path d="M7 2h1" />
                <path d="m22 22-5-10-5 10" />
                <path d="M14 18h6" />
              </svg>
            }
          />
          <FeatureCard
            title="Real-time presence"
            description="See who's online, who's typing, and when your team was last active."
            icon={
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            }
          />
          <FeatureCard
            title="Preserved meaning"
            description="View the original or the translation with one tap — context never gets lost."
            icon={
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            }
          />
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            How Unicomm works
          </h2>
          <p className="mt-3 text-uni-muted max-w-xl mx-auto">
            Three steps to seamless multilingual conversations.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <StepCard
            n="01"
            title="Set your language"
            body="Choose your preferred language during onboarding. Every contact sets their own."
          />
          <StepCard
            n="02"
            title="Send like normal"
            body="Type naturally in your own language. We'll handle the translation in-flight."
          />
          <StepCard
            n="03"
            title="Read in yours"
            body="Recipients see messages in their preferred language, with the original one tap away."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="rounded-3xl border border-uni-border bg-gradient-to-br from-indigo-500/10 via-uni-surface to-violet-500/10 p-10 md:p-14 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Ready to remove the language barrier?
          </h2>
          <p className="mt-3 text-uni-muted max-w-lg mx-auto">
            Join Unicomm and start conversations that cross every border.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate("/register")}
              className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-white rounded-xl bg-bubble-sent shadow-bubble hover:opacity-90 transition-opacity"
            >
              Create account
            </button>
            <button
              onClick={() => navigate("/login")}
              className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-white rounded-xl bg-uni-surface border border-uni-border hover:bg-uni-surface2 transition-colors"
            >
              Start chatting
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-uni-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-uni-muted">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
              <span className="text-white font-bold text-xs">U</span>
            </div>
            <span>© {new Date().getFullYear()} Unicomm</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

const FeatureCard = ({ icon, title, description }) => (
  <div className="group p-6 rounded-2xl border border-uni-border bg-uni-surface/60 hover:bg-uni-surface hover:border-indigo-500/40 transition-all">
    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/20 flex items-center justify-center text-indigo-300 mb-4 group-hover:scale-105 transition-transform">
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-white">{title}</h3>
    <p className="mt-1.5 text-sm text-uni-muted leading-relaxed">
      {description}
    </p>
  </div>
);

const StepCard = ({ n, title, body }) => (
  <div className="p-6 rounded-2xl border border-uni-border bg-uni-surface/60">
    <span className="text-xs font-bold tracking-widest text-indigo-400">
      STEP {n}
    </span>
    <h3 className="mt-2 text-lg font-semibold text-white">{title}</h3>
    <p className="mt-1.5 text-sm text-uni-muted leading-relaxed">{body}</p>
  </div>
);

export default Intro;
