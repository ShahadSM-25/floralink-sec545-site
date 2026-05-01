import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

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

type ForgotForm = {
  email: string;
  newPassword: string;
  confirmPassword: string;
};

type AccountSummary = {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  createdAt: Date | string;
  updatedAt: Date | string;
};

const defaultLoginEmail = "reem@example.com";

const emptyRegister: RegisterForm = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

const emptyLogin: LoginForm = {
  email: defaultLoginEmail,
  password: "",
};

const emptyForgot: ForgotForm = {
  email: "",
  newPassword: "",
  confirmPassword: "",
};

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

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
  const [tab, setTab] = useState<"register" | "login" | "forgot">("register");
  const [registerForm, setRegisterForm] = useState<RegisterForm>(emptyRegister);
  const [loginForm, setLoginForm] = useState<LoginForm>(emptyLogin);
  const [forgotForm, setForgotForm] = useState<ForgotForm>(emptyForgot);
  const [registerState, setRegisterState] = useState<"idle" | "error" | "exists" | "success">("idle");
  const [loginState, setLoginState] = useState<"idle" | "error" | "warning" | "locked" | "success">("idle");
  const [forgotState, setForgotState] = useState<"idle" | "error" | "missing" | "success">("idle");
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showForgotConfirmPassword, setShowForgotConfirmPassword] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockSeconds, setLockSeconds] = useState(0);
  const [registeredAccount, setRegisteredAccount] = useState<AccountSummary | null>(null);
  const [signedInAccount, setSignedInAccount] = useState<AccountSummary | null>(null);

  const registerMutation = trpc.auth.register.useMutation();
  const loginMutation = trpc.auth.login.useMutation();
  const resetPasswordMutation = trpc.auth.resetPassword.useMutation();

  useEffect(() => {
    if (lockSeconds <= 0) return;
    const timer = window.setInterval(() => {
      setLockSeconds(value => (value <= 1 ? 0 : value - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [lockSeconds]);

  useEffect(() => {
    if (lockSeconds === 0 && loginState === "locked") {
      setLoginState("idle");
      setFailedAttempts(0);
    }
  }, [lockSeconds, loginState]);

  const registerPasswordRules = useMemo(() => getPasswordRules(registerForm.password), [registerForm.password]);
  const registerPassedRules = registerPasswordRules.filter(item => item.passed).length;
  const registerPasswordStrong = registerPassedRules === registerPasswordRules.length;
  const registerPasswordProgress = `${(registerPassedRules / registerPasswordRules.length) * 100}%`;
  const registerEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email);
  const registerConfirmMatch =
    registerForm.password.length > 0 && registerForm.password === registerForm.confirmPassword;

  const forgotPasswordRules = useMemo(() => getPasswordRules(forgotForm.newPassword), [forgotForm.newPassword]);
  const forgotPassedRules = forgotPasswordRules.filter(item => item.passed).length;
  const forgotPasswordStrong = forgotPassedRules === forgotPasswordRules.length;
  const forgotPasswordProgress = `${(forgotPassedRules / forgotPasswordRules.length) * 100}%`;
  const forgotEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotForm.email);
  const forgotConfirmMatch =
    forgotForm.newPassword.length > 0 && forgotForm.newPassword === forgotForm.confirmPassword;

  async function submitRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = normalizeEmail(registerForm.email);
    const hasEmpty = Object.values(registerForm).some(value => value.trim() === "");

    if (hasEmpty || !registerEmailValid || !registerPasswordStrong || !registerConfirmMatch) {
      setRegisterState("error");
      return;
    }

    const result = await registerMutation.mutateAsync({
      fullName: registerForm.fullName.trim(),
      email: normalizedEmail,
      phone: registerForm.phone.trim(),
      password: registerForm.password,
    });

    if (!result.success) {
      setRegisterState(result.reason === "exists" ? "exists" : "error");
      return;
    }

    setRegisteredAccount(result.account);
    setLoginForm({ email: result.account.email, password: "" });
    setRegisterState("success");
  }

  async function submitLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (lockSeconds > 0) {
      setLoginState("locked");
      return;
    }

    const result = await loginMutation.mutateAsync({
      email: normalizeEmail(loginForm.email),
      password: loginForm.password,
    });

    if (result.success) {
      setSignedInAccount(result.account);
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

  async function submitForgotPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const hasEmpty = Object.values(forgotForm).some(value => value.trim() === "");

    if (hasEmpty || !forgotEmailValid || !forgotPasswordStrong || !forgotConfirmMatch) {
      setForgotState("error");
      return;
    }

    const result = await resetPasswordMutation.mutateAsync({
      email: normalizeEmail(forgotForm.email),
      newPassword: forgotForm.newPassword,
    });

    if (!result.success) {
      setForgotState(result.reason === "missing" ? "missing" : "error");
      return;
    }

    setForgotState("success");
    setLoginForm({ email: result.account.email, password: "" });
    setLoginState("idle");
    setFailedAttempts(0);
    setLockSeconds(0);
  }

  function resetRegister() {
    setRegisterForm(emptyRegister);
    setRegisterState("idle");
    setRegisteredAccount(null);
    setShowRegisterPassword(false);
    setShowConfirmPassword(false);
  }

  function resetLogin() {
    setLoginForm({ email: defaultLoginEmail, password: "" });
    setLoginState("idle");
    setFailedAttempts(0);
    setLockSeconds(0);
    setSignedInAccount(null);
    setShowLoginPassword(false);
  }

  function resetForgot() {
    setForgotForm(emptyForgot);
    setForgotState("idle");
    setShowForgotPassword(false);
    setShowForgotConfirmPassword(false);
  }

  function openForgotPassword() {
    setForgotForm({ email: loginForm.email, newPassword: "", confirmPassword: "" });
    setForgotState("idle");
    setShowForgotPassword(false);
    setShowForgotConfirmPassword(false);
    setTab("forgot");
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
          <p>Order bouquets, save your details, and come back faster next time.</p>

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
            <button className={tab === "register" ? "tab active" : "tab"} type="button" onClick={() => setTab("register")}>
              Create account
            </button>
            <button className={tab === "login" ? "tab active" : "tab"} type="button" onClick={() => setTab("login")}>
              Sign in
            </button>
          </div>

          {tab === "register" ? (
            registerState === "success" && registeredAccount ? (
              <div className="auth-success">
                <div className="success-circle">
                  <Check className="h-5 w-5" />
                </div>
                <h2>Welcome, {registeredAccount.fullName}</h2>
                <p>Your account is ready and saved securely.</p>
                <div className="summary-card">
                  <div>
                    <span>Name</span>
                    <strong>{registeredAccount.fullName}</strong>
                  </div>
                  <div>
                    <span>Email</span>
                    <strong>{registeredAccount.email}</strong>
                  </div>
                  <div>
                    <span>Phone</span>
                    <strong>{registeredAccount.phone}</strong>
                  </div>
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

                {registerState === "exists" ? <div className="notice error">This email is already registered.</div> : null}
                {registerState === "error" ? <div className="notice error">Please check the highlighted fields.</div> : null}
                {registerMutation.error ? <div className="notice error">Unable to create the account right now.</div> : null}

                <label>
                  <span>Full name</span>
                  <input
                    value={registerForm.fullName}
                    onChange={event => {
                      setRegisterState("idle");
                      setRegisterForm(current => ({ ...current, fullName: event.target.value }));
                    }}
                    className={registerState === "error" && registerForm.fullName.trim() === "" ? "field-error" : ""}
                    placeholder="Reem Alshareef"
                  />
                </label>

                <label>
                  <span>Email</span>
                  <input
                    value={registerForm.email}
                    onChange={event => {
                      setRegisterState("idle");
                      setRegisterForm(current => ({ ...current, email: event.target.value }));
                    }}
                    className={registerState === "exists" || (registerState === "error" && !registerEmailValid) ? "field-error" : ""}
                    placeholder="reem@example.com"
                  />
                </label>

                <label>
                  <span>Phone</span>
                  <input
                    value={registerForm.phone}
                    onChange={event => {
                      setRegisterState("idle");
                      setRegisterForm(current => ({ ...current, phone: event.target.value }));
                    }}
                    placeholder="+966 50 123 4567"
                  />
                </label>

                <label>
                  <span>Password</span>
                  <div className="password-field">
                    <input
                      type={showRegisterPassword ? "text" : "password"}
                      value={registerForm.password}
                      onChange={event => {
                        setRegisterState("idle");
                        setRegisterForm(current => ({ ...current, password: event.target.value }));
                      }}
                      className={registerState === "error" && !registerPasswordStrong ? "field-error" : ""}
                      placeholder="Create password"
                    />
                    <button type="button" className="icon-button" onClick={() => setShowRegisterPassword(value => !value)}>
                      {showRegisterPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </label>

                <div className="password-meter">
                  <div className="password-meter-fill" style={{ width: registerPasswordProgress }} />
                </div>
                <div className="rules-grid">
                  {registerPasswordRules.map(rule => (
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
                      onChange={event => {
                        setRegisterState("idle");
                        setRegisterForm(current => ({ ...current, confirmPassword: event.target.value }));
                      }}
                      className={registerState === "error" && !registerConfirmMatch ? "field-error" : ""}
                      placeholder="Repeat password"
                    />
                    <button type="button" className="icon-button" onClick={() => setShowConfirmPassword(value => !value)}>
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

                <button className="primary-cta block" type="submit" disabled={registerMutation.isPending}>
                  {registerMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create account"
                  )}
                </button>
                <button className="text-action" type="button" onClick={() => setTab("login")}>
                  Already have an account?
                </button>
              </form>
            )
          ) : tab === "forgot" ? (
            forgotState === "success" ? (
              <div className="auth-success">
                <div className="success-circle secure">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h2>Password updated</h2>
                <p>Your new password has been saved in the account database.</p>
                <button className="primary-cta block" type="button" onClick={() => setTab("login")}>
                  Back to sign in
                </button>
                <button className="text-action" type="button" onClick={resetForgot}>
                  Reset another password
                </button>
              </div>
            ) : (
              <form className="auth-form" onSubmit={submitForgotPassword}>
                <h2>Reset password</h2>

                {forgotState === "missing" ? (
                  <div className="notice error">We couldn't find an account with this email.</div>
                ) : null}
                {forgotState === "error" ? (
                  <div className="notice error">Please review the email and password details.</div>
                ) : null}
                {resetPasswordMutation.error ? (
                  <div className="notice error">Unable to update the password right now.</div>
                ) : null}

                <label>
                  <span>Email</span>
                  <input
                    value={forgotForm.email}
                    onChange={event => {
                      setForgotState("idle");
                      setForgotForm(current => ({ ...current, email: event.target.value }));
                    }}
                    className={forgotState !== "idle" && !forgotEmailValid ? "field-error" : ""}
                    placeholder="reem@example.com"
                  />
                </label>

                <label>
                  <span>New password</span>
                  <div className="password-field">
                    <input
                      type={showForgotPassword ? "text" : "password"}
                      value={forgotForm.newPassword}
                      onChange={event => {
                        setForgotState("idle");
                        setForgotForm(current => ({ ...current, newPassword: event.target.value }));
                      }}
                      className={forgotState === "error" && !forgotPasswordStrong ? "field-error" : ""}
                      placeholder="Create a new password"
                    />
                    <button type="button" className="icon-button" onClick={() => setShowForgotPassword(value => !value)}>
                      {showForgotPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </label>

                <div className="password-meter">
                  <div className="password-meter-fill" style={{ width: forgotPasswordProgress }} />
                </div>
                <div className="rules-grid">
                  {forgotPasswordRules.map(rule => (
                    <div key={rule.label} className={rule.passed ? "rule ok" : "rule"}>
                      <span>{rule.passed ? "✓" : "•"}</span>
                      {rule.label}
                    </div>
                  ))}
                </div>

                <label>
                  <span>Confirm new password</span>
                  <div className="password-field">
                    <input
                      type={showForgotConfirmPassword ? "text" : "password"}
                      value={forgotForm.confirmPassword}
                      onChange={event => {
                        setForgotState("idle");
                        setForgotForm(current => ({ ...current, confirmPassword: event.target.value }));
                      }}
                      className={forgotState === "error" && !forgotConfirmMatch ? "field-error" : ""}
                      placeholder="Repeat new password"
                    />
                    <button type="button" className="icon-button" onClick={() => setShowForgotConfirmPassword(value => !value)}>
                      {showForgotConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </label>

                <button className="primary-cta block" type="submit" disabled={resetPasswordMutation.isPending}>
                  {resetPasswordMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving password...
                    </>
                  ) : (
                    "Save new password"
                  )}
                </button>
                <button
                  className="text-action"
                  type="button"
                  onClick={() => {
                    resetForgot();
                    setTab("login");
                  }}
                >
                  Back to sign in
                </button>
              </form>
            )
          ) : loginState === "success" && signedInAccount ? (
            <div className="auth-success">
              <div className="success-circle secure">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h2>Welcome back</h2>
              <p>Your account was verified against the database.</p>
              <div className="summary-card compact">
                <div>
                  <span>Email</span>
                  <strong>{signedInAccount.email}</strong>
                </div>
                <div>
                  <span>Status</span>
                  <strong>Active</strong>
                </div>
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
              {loginMutation.error ? <div className="notice error">Unable to sign in right now.</div> : null}

              <label>
                <span>Email</span>
                <input
                  value={loginForm.email}
                  onChange={event => {
                    setLoginState("idle");
                    setLoginForm(current => ({ ...current, email: event.target.value }));
                  }}
                  className={loginState === "error" || loginState === "warning" ? "field-error" : ""}
                />
              </label>

              <label>
                <span>Password</span>
                <div className="password-field">
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    value={loginForm.password}
                    onChange={event => {
                      setLoginState("idle");
                      setLoginForm(current => ({ ...current, password: event.target.value }));
                    }}
                    className={loginState === "error" || loginState === "warning" ? "field-error" : ""}
                    placeholder="Enter password"
                  />
                  <button type="button" className="icon-button" onClick={() => setShowLoginPassword(value => !value)}>
                    {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </label>

              <div className="inline-actions">
                <button className="inline-link" type="button" onClick={openForgotPassword}>
                  Forgot password?
                </button>
              </div>

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

              <button className="primary-cta block" type="submit" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </button>
              <button className="text-action" type="button" onClick={() => setTab("register")}>
                Need a new account?
              </button>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}
