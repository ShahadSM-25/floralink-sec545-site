import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Eye,
  EyeOff,
  Lock,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

type RegisterForm = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

type LoginForm = {
  email: string;
  password: string;
};

const demoAccount = {
  name: "Reem Alshareef",
  email: "reem@example.com",
  password: "Bloom@2026",
  phone: "+966 50 123 4567",
};

const emptyRegister: RegisterForm = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

const emptyLogin: LoginForm = {
  email: demoAccount.email,
  password: "",
};

function getPasswordRules(password: string) {
  return [
    { label: "8+ characters", passed: password.length >= 8 },
    { label: "Uppercase letter", passed: /[A-Z]/.test(password) },
    { label: "Number", passed: /\d/.test(password) },
    { label: "Special character", passed: /[^A-Za-z0-9]/.test(password) },
    {
      label: "Not common",
      passed: password.length >= 8 && !/(password|123456|qwerty|welcome)/i.test(password),
    },
  ];
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export default function Home() {
  const [tab, setTab] = useState<"register" | "login">("register");
  const [registerForm, setRegisterForm] = useState<RegisterForm>(emptyRegister);
  const [loginForm, setLoginForm] = useState<LoginForm>(emptyLogin);
  const [registerState, setRegisterState] = useState<"idle" | "error" | "exists" | "success">("idle");
  const [loginState, setLoginState] = useState<"idle" | "error" | "warning" | "locked" | "success">("idle");
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockSeconds, setLockSeconds] = useState(0);

  useEffect(() => {
    if (lockSeconds <= 0) return;
    const timer = window.setInterval(() => {
      setLockSeconds((value) => (value <= 1 ? 0 : value - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [lockSeconds]);

  useEffect(() => {
    if (lockSeconds === 0 && loginState === "locked") {
      setLoginState("idle");
      setFailedAttempts(0);
    }
  }, [lockSeconds, loginState]);

  const passwordRules = useMemo(() => getPasswordRules(registerForm.password), [registerForm.password]);
  const passedRules = passwordRules.filter((item) => item.passed).length;
  const passwordStrong = passedRules === passwordRules.length;
  const passwordProgress = `${(passedRules / passwordRules.length) * 100}%`;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email);
  const confirmMatch = registerForm.password.length > 0 && registerForm.password === registerForm.confirmPassword;

  function submitRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = registerForm.email.trim().toLowerCase();
    const hasEmpty = Object.values(registerForm).some((value) => value.trim() === "");

    if (normalizedEmail === demoAccount.email) {
      setRegisterState("exists");
      return;
    }

    if (hasEmpty || !emailValid || !passwordStrong || !confirmMatch) {
      setRegisterState("error");
      return;
    }

    setRegisterState("success");
  }

  function submitLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (lockSeconds > 0) {
      setLoginState("locked");
      return;
    }

    const valid =
      loginForm.email.trim().toLowerCase() === demoAccount.email && loginForm.password === demoAccount.password;

    if (valid) {
      setLoginState("success");
      setFailedAttempts(0);
      return;
    }

    const next = failedAttempts + 1;
    setFailedAttempts(next);

    if (next >= 5) {
      setLockSeconds(15 * 60);
      setLoginState("locked");
      return;
    }

    if (next === 4) {
      setLoginState("warning");
      return;
    }

    setLoginState("error");
  }

  function resetRegister() {
    setRegisterForm(emptyRegister);
    setRegisterState("idle");
  }

  function resetLogin() {
    setLoginForm(emptyLogin);
    setLoginState("idle");
    setFailedAttempts(0);
    setLockSeconds(0);
  }

  return (
    <div className="site-shell">
      <header className="topbar">
        <a className="brand" href="#home" aria-label="FloraLink home">
          <img src="/manus-storage/floralink-logo_02b3becb.png" alt="FloraLink" className="brand-logo" />
        </a>

        <nav className="topnav">
          <a href="#home">Home</a>
          <a href="#auth">Account</a>
        </nav>

        <button className="bag-button" type="button">
          <ShoppingBag className="h-4 w-4" />
          Cart
        </button>
      </header>

      <main className="main-grid" id="home">
        <section className="hero-copy">
          <span className="hero-badge">Fresh flowers, simple checkout</span>
          <h1>Flowers for every small moment.</h1>
          <p>
            Order bouquets, save your details, and come back faster next time.
          </p>

          <div className="hero-actions">
            <button className="primary-cta" type="button" onClick={() => setTab("register")}>
              Create account
            </button>
            <button className="secondary-cta" type="button" onClick={() => setTab("login")}>
              Sign in
            </button>
          </div>

        </section>

        <section className="auth-panel" id="auth">
          <div className="tabs">
            <button
              className={tab === "register" ? "tab active" : "tab"}
              type="button"
              onClick={() => setTab("register")}
            >
              Create account
            </button>
            <button
              className={tab === "login" ? "tab active" : "tab"}
              type="button"
              onClick={() => setTab("login")}
            >
              Sign in
            </button>
          </div>

          {tab === "register" ? (
            registerState === "success" ? (
              <div className="auth-success">
                <div className="success-circle">
                  <Check className="h-5 w-5" />
                </div>
                <h2>Welcome, {registerForm.fullName || demoAccount.name}</h2>
                <p>Your account is ready.</p>
                <div className="summary-card">
                  <div><span>Name</span><strong>{registerForm.fullName || demoAccount.name}</strong></div>
                  <div><span>Email</span><strong>{registerForm.email || "new@floralink.com"}</strong></div>
                  <div><span>Phone</span><strong>{registerForm.phone || demoAccount.phone}</strong></div>
                </div>
                <button className="primary-cta block" type="button" onClick={() => setTab("login")}>
                  Continue to sign in
                </button>
                <button className="text-action" type="button" onClick={resetRegister}>
                  Create another account
                </button>
              </div>
            ) : (
              <form className="auth-form" onSubmit={submitRegister}>
                <h2>Create your account</h2>

                {registerState === "exists" ? (
                  <div className="notice error">This email is already registered.</div>
                ) : null}
                {registerState === "error" ? (
                  <div className="notice error">Please check the highlighted fields.</div>
                ) : null}

                <label>
                  <span>Full name</span>
                  <input
                    value={registerForm.fullName}
                    onChange={(event) => setRegisterForm((current) => ({ ...current, fullName: event.target.value }))}
                    className={registerState === "error" && registerForm.fullName.trim() === "" ? "field-error" : ""}
                    placeholder="Reem Alshareef"
                  />
                </label>

                <label>
                  <span>Email</span>
                  <input
                    value={registerForm.email}
                    onChange={(event) => setRegisterForm((current) => ({ ...current, email: event.target.value }))}
                    className={registerState === "exists" || (registerState === "error" && !emailValid) ? "field-error" : ""}
                    placeholder="reem@example.com"
                  />
                </label>

                <label>
                  <span>Phone</span>
                  <input
                    value={registerForm.phone}
                    onChange={(event) => setRegisterForm((current) => ({ ...current, phone: event.target.value }))}
                    placeholder="+966 50 123 4567"
                  />
                </label>

                <label>
                  <span>Password</span>
                  <div className="password-field">
                    <input
                      type={showRegisterPassword ? "text" : "password"}
                      value={registerForm.password}
                      onChange={(event) => setRegisterForm((current) => ({ ...current, password: event.target.value }))}
                      className={registerState === "error" && !passwordStrong ? "field-error" : ""}
                      placeholder="Create password"
                    />
                    <button type="button" className="icon-button" onClick={() => setShowRegisterPassword((value) => !value)}>
                      {showRegisterPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </label>

                <div className="password-meter">
                  <div className="password-meter-fill" style={{ width: passwordProgress }} />
                </div>
                <div className="rules-grid">
                  {passwordRules.map((rule) => (
                    <div key={rule.label} className={rule.passed ? "rule ok" : "rule"}>
                      <span>{rule.passed ? "✓" : "•"}</span>
                      {rule.label}
                    </div>
                  ))}
                </div>

                <label>
                  <span>Confirm password</span>
                  <div className="password-field">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={registerForm.confirmPassword}
                      onChange={(event) => setRegisterForm((current) => ({ ...current, confirmPassword: event.target.value }))}
                      className={registerState === "error" && !confirmMatch ? "field-error" : ""}
                      placeholder="Repeat password"
                    />
                    <button type="button" className="icon-button" onClick={() => setShowConfirmPassword((value) => !value)}>
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </label>

                <div className="captcha-row">
                  <label className="check-row">
                    <input type="checkbox" defaultChecked />
                    <span>I'm not a robot</span>
                  </label>
                  <span className="captcha-mark">reCAPTCHA</span>
                </div>

                <button className="primary-cta block" type="submit">
                  Create account
                </button>
                <button className="text-action" type="button" onClick={() => setTab("login")}>
                  Already have an account?
                </button>
              </form>
            )
          ) : loginState === "success" ? (
            <div className="auth-success">
              <div className="success-circle secure">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h2>Welcome back</h2>
              <p>You're signed in.</p>
              <div className="summary-card compact">
                <div><span>Email</span><strong>{demoAccount.email}</strong></div>
                <div><span>Status</span><strong>Active</strong></div>
              </div>
              <button className="primary-cta block" type="button" onClick={resetLogin}>
                Continue shopping
              </button>
            </div>
          ) : loginState === "locked" ? (
            <div className="locked-box">
              <div className="lock-icon">
                <Lock className="h-5 w-5" />
              </div>
              <h2>Account temporarily locked</h2>
              <div className="timer-box">{formatTime(lockSeconds)}</div>
              <p>Too many failed attempts. Try again later.</p>
              <button className="secondary-cta block" type="button" onClick={resetLogin}>
                Reset form
              </button>
            </div>
          ) : (
            <form className="auth-form" onSubmit={submitLogin}>
              <h2>Sign in</h2>

              {loginState === "error" ? <div className="notice error">Invalid email or password.</div> : null}
              {loginState === "warning" ? (
                <div className="notice warning">One attempt remaining before temporary lock.</div>
              ) : null}

              <label>
                <span>Email</span>
                <input
                  value={loginForm.email}
                  onChange={(event) => setLoginForm((current) => ({ ...current, email: event.target.value }))}
                  className={loginState === "error" || loginState === "warning" ? "field-error" : ""}
                />
              </label>

              <label>
                <span>Password</span>
                <div className="password-field">
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    value={loginForm.password}
                    onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
                    className={loginState === "error" || loginState === "warning" ? "field-error" : ""}
                    placeholder="Enter password"
                  />
                  <button type="button" className="icon-button" onClick={() => setShowLoginPassword((value) => !value)}>
                    {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </label>

              {failedAttempts > 0 ? (
                <div className="attempts-row">
                  <span>{failedAttempts}/5</span>
                  <div className="attempts-dots">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <i key={index} className={index < failedAttempts ? "filled" : ""} />
                    ))}
                  </div>
                </div>
              ) : null}

              {failedAttempts >= 4 ? (
                <div className="captcha-row">
                  <label className="check-row">
                    <input type="checkbox" defaultChecked />
                    <span>Verify you're human</span>
                  </label>
                  <span className="captcha-mark">reCAPTCHA</span>
                </div>
              ) : null}

              <button className="primary-cta block" type="submit">
                Sign in
              </button>
              <button className="text-action" type="button" onClick={() => setTab("register")}>
                Need a new account?
              </button>
            </form>
          )}
        </section>
      </main>

      <section className="feature-strip">
        <div>
          <Sparkles className="h-4 w-4" />
          Same-day bouquets
        </div>
        <div>
          <ShieldCheck className="h-4 w-4" />
          Secure account access
        </div>
        <div>
          <ShoppingBag className="h-4 w-4" />
          Fast repeat orders
        </div>
      </section>
    </div>
  );
}
