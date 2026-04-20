/*
Design reminder — Midnight Conservatory Console:
Use an asymmetric panoramic composition, dark glass panels, emerald glow accents,
editorial typography, and measured motion so the page feels like a premium academic security demo.
*/
import { useEffect, useMemo, useState } from "react";
import { ShieldCheck, LockKeyhole, TimerReset, UserPlus, LogIn, CheckCircle2, AlertTriangle } from "lucide-react";

type PasswordRule = {
  label: string;
  passed: boolean;
};

type AccountRecord = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  createdAt: string;
};

const heroImage = "https://d2xsxph8kpxj0f.cloudfront.net/310419663028461165/Gt6iYhPCNZWstzygyVkic7/floralink-hero-auth-console-YMPfM2KxkpTAYVQ4W2qTY6.webp";
const securityImage = "https://d2xsxph8kpxj0f.cloudfront.net/310419663028461165/Gt6iYhPCNZWstzygyVkic7/floralink-security-panel-art-DwVkf6fAVFTQVbveJhnfcn.webp";
const ambientTexture = "https://d2xsxph8kpxj0f.cloudfront.net/310419663028461165/Gt6iYhPCNZWstzygyVkic7/floralink-auth-texture-Xdp2yL6XqUqqvNUQxmYJyY.webp";

const initialRegister = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
};

const initialLogin = {
  email: "",
  password: "",
};

function evaluatePassword(password: string): PasswordRule[] {
  return [
    { label: "12+ characters", passed: password.length >= 12 },
    { label: "Uppercase letter", passed: /[A-Z]/.test(password) },
    { label: "Lowercase letter", passed: /[a-z]/.test(password) },
    { label: "Number", passed: /\d/.test(password) },
    { label: "Special character", passed: /[^A-Za-z0-9]/.test(password) },
    { label: "No spaces", passed: !/\s/.test(password) },
  ];
}

function formatTime(value: string) {
  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Home() {
  const [mode, setMode] = useState<"register" | "login">("register");
  const [registerForm, setRegisterForm] = useState(initialRegister);
  const [loginForm, setLoginForm] = useState(initialLogin);
  const [account, setAccount] = useState<AccountRecord | null>(null);
  const [registered, setRegistered] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [registerMessage, setRegisterMessage] = useState<string>("Create a secure FloraLink customer account for the SEC545 demo.");
  const [loginMessage, setLoginMessage] = useState<string>("Authenticate with the registered account to validate the security controls.");
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const passwordRules = useMemo(() => evaluatePassword(registerForm.password), [registerForm.password]);
  const passwordStrength = useMemo(() => Math.round((passwordRules.filter((rule) => rule.passed).length / passwordRules.length) * 100), [passwordRules]);
  const lockRemaining = lockoutUntil ? Math.max(0, Math.ceil((lockoutUntil - now) / 1000)) : 0;
  const locked = lockRemaining > 0;

  useEffect(() => {
    if (!locked && lockoutUntil) {
      setLockoutUntil(null);
      setFailedAttempts(0);
      setLoginMessage("Lockout window ended. You can try signing in again.");
    }
  }, [locked, lockoutUntil]);

  function submitRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (Object.values(registerForm).some((value) => value.trim().length === 0)) {
      setRegisterMessage("All registration fields are required for UC-01.");
      return;
    }

    const policyValid = passwordRules.every((rule) => rule.passed);
    if (!policyValid) {
      setRegisterMessage("MIT-01 rejected the password because the full policy is not yet satisfied.");
      return;
    }

    const record: AccountRecord = {
      ...registerForm,
      email: registerForm.email.trim().toLowerCase(),
      createdAt: new Date().toISOString(),
    };

    setAccount(record);
    setRegistered(true);
    setAuthenticated(true);
    setMode("login");
    setFailedAttempts(0);
    setLockoutUntil(null);
    setRegisterMessage("Account created successfully. In the real implementation, the password is hashed and stored securely.");
    setLoginMessage("Registration completed. The account is now ready for secure login testing.");
    setRegisterForm(initialRegister);
  }

  function submitLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!account) {
      setLoginMessage("Register an account first so the authentication flow has a valid customer record.");
      return;
    }

    if (locked) {
      setLoginMessage(`MIT-02 lockout is active. Try again in ${lockRemaining} seconds.`);
      return;
    }

    const normalizedEmail = loginForm.email.trim().toLowerCase();
    const validCredentials = normalizedEmail === account.email && loginForm.password === account.password;

    if (!validCredentials) {
      const nextAttempts = failedAttempts + 1;
      setFailedAttempts(nextAttempts);
      if (nextAttempts >= 5) {
        const expiresAt = Date.now() + 2 * 60 * 1000;
        setLockoutUntil(expiresAt);
        setAuthenticated(false);
        setLoginMessage("MIT-02 activated a timed account lockout after 5 failed attempts.");
        return;
      }
      setAuthenticated(false);
      setLoginMessage(`Invalid credentials. ${5 - nextAttempts} attempt(s) remaining before lockout.`);
      return;
    }

    setAuthenticated(true);
    setFailedAttempts(0);
    setLockoutUntil(null);
    setLoginMessage("Login successful. MIT-02 reset the failed-attempt counter after secure authentication.");
    setLoginForm(initialLogin);
  }

  const highlights = [
    {
      icon: UserPlus,
      title: "UC-01 Register Account",
      text: "Guest visitors create a FloraLink customer account using validated identity fields and a strong password policy.",
    },
    {
      icon: LogIn,
      title: "UC-02 Login",
      text: "Registered users authenticate with secure credential checking and clear feedback on successful or failed access.",
    },
    {
      icon: ShieldCheck,
      title: "MIT-01 Strong Authentication",
      text: "A six-rule password policy is enforced visually and procedurally to demonstrate secure-by-design registration.",
    },
    {
      icon: LockKeyhole,
      title: "MIT-02 Rate Limiting & Lockout",
      text: "The page simulates repeated failed-login monitoring and timed lockout behavior for the academic demo scenario.",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 opacity-60" style={{ backgroundImage: `url(${ambientTexture})`, backgroundSize: "cover", backgroundPosition: "center" }} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(125,255,214,0.12),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(215,236,255,0.10),transparent_32%),linear-gradient(180deg,rgba(7,12,20,0.1),rgba(7,12,20,0.85))]" />

      <main className="relative container py-8 lg:py-12">
        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-card/70 shadow-[0_32px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <div className="grid min-h-[680px] lg:grid-cols-[0.9fr_1.1fr]">
              <div className="relative flex flex-col justify-between overflow-hidden border-b border-white/10 p-8 lg:border-b-0 lg:border-r lg:p-10">
                <div className="absolute inset-0">
                  <img src={heroImage} alt="FloraLink visual identity" className="h-full w-full object-cover opacity-45" />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,11,18,0.2),rgba(7,11,18,0.88))]" />
                </div>

                <div className="relative z-10 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.34em] text-emerald-200/80">FloraLink · SEC545</p>
                    <h1 className="mt-4 max-w-md font-display text-4xl leading-[1.05] text-white sm:text-5xl">
                      Authentication demo engineered as a polished security story.
                    </h1>
                  </div>
                  <div className="rounded-full border border-emerald-200/20 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-100/85">
                    Standalone site
                  </div>
                </div>

                <div className="relative z-10 grid gap-4 sm:grid-cols-2">
                  {highlights.map((item) => (
                    <article key={item.title} className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4 backdrop-blur-md transition duration-300 hover:border-emerald-200/35 hover:bg-black/30">
                      <item.icon className="mb-4 h-5 w-5 text-emerald-200" />
                      <h2 className="text-sm font-semibold text-white">{item.title}</h2>
                      <p className="mt-2 text-sm leading-6 text-white/72">{item.text}</p>
                    </article>
                  ))}
                </div>
              </div>

              <div className="flex flex-col justify-between p-7 sm:p-9 lg:p-10">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200/80">Chosen design</p>
                    <h2 className="mt-2 text-2xl font-display text-white">Midnight Conservatory Console</h2>
                  </div>
                  <div className="flex gap-2 rounded-full border border-white/10 bg-black/20 p-1">
                    <button
                      type="button"
                      onClick={() => setMode("register")}
                      className={`rounded-full px-4 py-2 text-sm transition ${mode === "register" ? "bg-emerald-200 text-slate-950" : "text-white/70 hover:text-white"}`}
                    >
                      Register
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode("login")}
                      className={`rounded-full px-4 py-2 text-sm transition ${mode === "login" ? "bg-emerald-200 text-slate-950" : "text-white/70 hover:text-white"}`}
                    >
                      Login
                    </button>
                  </div>
                </div>

                <div className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                  <div className="rounded-[1.75rem] border border-white/10 bg-black/20 p-5 backdrop-blur-md sm:p-6">
                    {mode === "register" ? (
                      <form className="space-y-4" onSubmit={submitRegister}>
                        <div>
                          <label className="mb-2 block text-sm text-white/70">Full name</label>
                          <input value={registerForm.fullName} onChange={(e) => setRegisterForm((current) => ({ ...current, fullName: e.target.value }))} className="field-input" placeholder="Shahad Almahmoud" />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label className="mb-2 block text-sm text-white/70">Email</label>
                            <input type="email" value={registerForm.email} onChange={(e) => setRegisterForm((current) => ({ ...current, email: e.target.value }))} className="field-input" placeholder="user@floralink.sa" />
                          </div>
                          <div>
                            <label className="mb-2 block text-sm text-white/70">Phone</label>
                            <input value={registerForm.phone} onChange={(e) => setRegisterForm((current) => ({ ...current, phone: e.target.value }))} className="field-input" placeholder="05XXXXXXXX" />
                          </div>
                        </div>
                        <div>
                          <label className="mb-2 block text-sm text-white/70">Password</label>
                          <input type="password" value={registerForm.password} onChange={(e) => setRegisterForm((current) => ({ ...current, password: e.target.value }))} className="field-input" placeholder="Create a strong password" />
                        </div>

                        <div className="rounded-[1.5rem] border border-emerald-200/15 bg-emerald-200/5 p-4">
                          <div className="mb-3 flex items-center justify-between text-sm text-white/76">
                            <span>MIT-01 password policy meter</span>
                            <span>{passwordStrength}%</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-white/10">
                            <div className="h-full rounded-full bg-[linear-gradient(90deg,#b8ffe5,#6fe0c0,#d9f2ff)] transition-all duration-500" style={{ width: `${passwordStrength}%` }} />
                          </div>
                          <div className="mt-4 grid gap-2 sm:grid-cols-2">
                            {passwordRules.map((rule) => (
                              <div key={rule.label} className={`rounded-2xl px-3 py-2 text-sm transition ${rule.passed ? "bg-emerald-200/15 text-emerald-100" : "bg-white/5 text-white/65"}`}>
                                {rule.label}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-white/78">
                          {registerMessage}
                        </div>
                        <button type="submit" className="action-button">
                          <UserPlus className="h-4 w-4" />
                          Create FloraLink account
                        </button>
                      </form>
                    ) : (
                      <form className="space-y-4" onSubmit={submitLogin}>
                        <div>
                          <label className="mb-2 block text-sm text-white/70">Registered email</label>
                          <input type="email" value={loginForm.email} onChange={(e) => setLoginForm((current) => ({ ...current, email: e.target.value }))} className="field-input" placeholder="user@floralink.sa" />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm text-white/70">Password</label>
                          <input type="password" value={loginForm.password} onChange={(e) => setLoginForm((current) => ({ ...current, password: e.target.value }))} className="field-input" placeholder="Enter the registered password" />
                        </div>

                        <div className="rounded-[1.5rem] border border-amber-200/20 bg-amber-100/5 p-4 text-sm leading-6 text-white/76">
                          <div className="flex items-start gap-3">
                            <TimerReset className="mt-0.5 h-4 w-4 text-amber-100" />
                            <p>
                              MIT-02 simulates account monitoring with a lockout after <strong>5 failed attempts</strong>.
                              This static site keeps the behavior in browser state to present the deliverable cleanly.
                            </p>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em] text-white/60">
                            <span>Failed attempts: {failedAttempts}</span>
                            <span>Status: {locked ? "Locked" : authenticated ? "Authenticated" : "Ready"}</span>
                          </div>
                          {locked ? <p className="mt-3 font-semibold text-amber-100">Lockout active · {lockRemaining}s remaining</p> : null}
                        </div>

                        <div className="rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-white/78">
                          {loginMessage}
                        </div>
                        <button type="submit" className="action-button" disabled={locked}>
                          <LogIn className="h-4 w-4" />
                          {locked ? "Account temporarily locked" : "Authenticate securely"}
                        </button>
                      </form>
                    )}
                  </div>

                  <aside className="space-y-4">
                    <article className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-black/20 backdrop-blur-md">
                      <img src={securityImage} alt="FloraLink security concepts" className="h-44 w-full object-cover opacity-90" />
                      <div className="p-5">
                        <h3 className="font-display text-xl text-white">Why this repo exists separately</h3>
                        <p className="mt-3 text-sm leading-6 text-white/70">
                          This standalone website isolates the SEC545 deliverable from the graduation project and turns the authentication demo into its own clean presentation space.
                        </p>
                      </div>
                    </article>

                    <article className="rounded-[1.75rem] border border-white/10 bg-black/20 p-5 backdrop-blur-md">
                      <h3 className="font-display text-xl text-white">Current demo state</h3>
                      <div className="mt-4 space-y-3 text-sm leading-6 text-white/72">
                        <div className="info-row"><span>UC-01</span><strong>Implemented</strong></div>
                        <div className="info-row"><span>UC-02</span><strong>Implemented</strong></div>
                        <div className="info-row"><span>MIT-01</span><strong>Password policy</strong></div>
                        <div className="info-row"><span>MIT-02</span><strong>Lockout simulation</strong></div>
                      </div>
                    </article>

                    <article className="rounded-[1.75rem] border border-white/10 bg-black/20 p-5 backdrop-blur-md">
                      <h3 className="font-display text-xl text-white">Session card</h3>
                      {account ? (
                        <div className="mt-4 space-y-3 text-sm leading-6 text-white/72">
                          <div className="flex items-center gap-2 text-emerald-100">
                            {authenticated ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                            <span>{authenticated ? "Active secure session" : "Account exists, not signed in"}</span>
                          </div>
                          <div className="info-row"><span>Name</span><strong>{account.fullName}</strong></div>
                          <div className="info-row"><span>Email</span><strong>{account.email}</strong></div>
                          <div className="info-row"><span>Registered</span><strong>{formatTime(account.createdAt)}</strong></div>
                          <div className="info-row"><span>Lock state</span><strong>{locked ? "Locked" : "Normal"}</strong></div>
                        </div>
                      ) : (
                        <p className="mt-4 text-sm leading-6 text-white/70">
                          No account exists yet in this browser session. Start with UC-01 to populate the demo state.
                        </p>
                      )}
                    </article>
                  </aside>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            <article className="rounded-[2rem] border border-white/10 bg-black/20 p-6 backdrop-blur-xl shadow-[0_24px_72px_rgba(0,0,0,0.28)]">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200/80">Deliverable framing</p>
              <h2 className="mt-3 font-display text-3xl text-white">A polished permanent web presentation for the SEC545 implementation.</h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-white/72">
                The page is structured as a panoramic academic product demo rather than a generic one-box form. It explains the security story, provides an interactive registration/login flow, and visually separates the course deliverable from unrelated repositories.
              </p>
            </article>

            <article className="grid gap-4 rounded-[2rem] border border-white/10 bg-black/20 p-6 backdrop-blur-xl shadow-[0_24px_72px_rgba(0,0,0,0.28)] sm:grid-cols-3">
              <div>
                <p className="stat-label">1</p>
                <p className="stat-title">Dedicated repo</p>
                <p className="stat-copy">The work now belongs to an isolated SEC545 codebase.</p>
              </div>
              <div>
                <p className="stat-label">2</p>
                <p className="stat-title">Use cases</p>
                <p className="stat-copy">Register Account and Login are presented as the core functional scope.</p>
              </div>
              <div>
                <p className="stat-label">2</p>
                <p className="stat-title">Mitigations</p>
                <p className="stat-copy">Strong Authentication and Account Lockout are demonstrated clearly.</p>
              </div>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}
