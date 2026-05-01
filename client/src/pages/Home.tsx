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
import {
  getForgotFieldErrors,
  getLoginFieldErrors,
  getPasswordRules,
  getRegisterFieldErrors,
  normalizeEmail,
  normalizeFullName,
} from "@/lib/authValidation";
import { RecaptchaWidget } from "@/components/RecaptchaWidget";
import { trpc } from "@/lib/trpc";

type RegisterForm = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  captchaToken: string;
};

type LoginForm = {
  email: string;
  password: string;
  captchaToken: string;
};

type ForgotForm = {
  email: string;
  newPassword: string;
  confirmPassword: string;
  captchaToken: string;
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
  captchaToken: "",
};

const emptyLogin: LoginForm = {
  email: defaultLoginEmail,
  password: "",
  captchaToken: "",
};

const emptyForgot: ForgotForm = {
  email: "",
  newPassword: "",
  confirmPassword: "",
  captchaToken: "",
};

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
  const [registerRemoteError, setRegisterRemoteError] = useState("");
  const [loginRemoteError, setLoginRemoteError] = useState("");
  const [forgotRemoteError, setForgotRemoteError] = useState("");
  const [registerCaptchaVersion, setRegisterCaptchaVersion] = useState(0);
  const [loginCaptchaVersion, setLoginCaptchaVersion] = useState(0);
  const [forgotCaptchaVersion, setForgotCaptchaVersion] = useState(0);

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
  const registerPasswordProgress = `${(registerPassedRules / registerPasswordRules.length) * 100}%`;
  const registerFieldErrors = useMemo(() => getRegisterFieldErrors(registerForm), [registerForm]);
  const loginFieldErrors = useMemo(() => getLoginFieldErrors(loginForm), [loginForm]);
  const forgotPasswordRules = useMemo(() => getPasswordRules(forgotForm.newPassword), [forgotForm.newPassword]);
  const forgotPassedRules = forgotPasswordRules.filter(item => item.passed).length;
  const forgotPasswordProgress = `${(forgotPassedRules / forgotPasswordRules.length) * 100}%`;
  const forgotFieldErrors = useMemo(() => getForgotFieldErrors(forgotForm), [forgotForm]);

  const registerFormValid = Object.values(registerFieldErrors).every(message => message === "");
  const loginFormValid = Object.values(loginFieldErrors).every(message => message === "");
  const forgotFormValid = Object.values(forgotFieldErrors).every(message => message === "");

  function getRecaptchaErrorMessage(error: unknown, fallback: string) {
    const message = error instanceof Error ? error.message : "";
    if (/recaptcha/i.test(message)) {
      return "reCAPTCHA verification expired or failed. Please complete it again.";
    }
    return fallback;
  }

  async function submitRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = normalizeEmail(registerForm.email);

       if (!registerFormValid) {
      setRegisterRemoteError("");
      setRegisterState("error");
      return;
    }

    try {
      setRegisterRemoteError("");
      const result = await registerMutation.mutateAsync({
        fullName: normalizeFullName(registerForm.fullName),
        email: normalizedEmail,
        phone: registerForm.phone.trim(),
        password: registerForm.password,
        captchaToken: registerForm.captchaToken,
      });
      if (!result.success) {
        setRegisterState(result.reason === "exists" ? "exists" : "error");
        return;
      }
      setRegisteredAccount(result.account);
      setLoginForm({ email: result.account.email, password: "", captchaToken: "" });
      setRegisterCaptchaVersion(current => current + 1);
      setRegisterForm(emptyRegister);
      setRegisterState("success");
    } catch (error) {
      setRegisterState("error");
      setRegisterRemoteError(getRecaptchaErrorMessage(error, "Unable to create the account right now."));
      setRegisterCaptchaVersion(current => current + 1);
      setRegisterForm(current => ({ ...current, captchaToken: "" }));
    }
  }

  async function submitLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

      if (lockSeconds > 0) {
      setLoginRemoteError("");
      setLoginState("locked");
      return;
    }
    if (!loginFormValid) {
      setLoginRemoteError("");
      setLoginState("error");
      return;
    }

    try {
      setLoginRemoteError("");
      const result = await loginMutation.mutateAsync({
        email: normalizeEmail(loginForm.email),
        password: loginForm.password,
        captchaToken: loginForm.captchaToken,
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
    } catch (error) {
      setLoginState("error");
      setLoginRemoteError(getRecaptchaErrorMessage(error, "Unable to sign in right now."));
      setLoginCaptchaVersion(current => current + 1);
      setLoginForm(current => ({ ...current, captchaToken: "" }));
    }
  }

  async function submitForgotPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

     if (!forgotFormValid) {
      setForgotRemoteError("");
      setForgotState("error");
      return;
    }

    try {
      setForgotRemoteError("");
      const result = await resetPasswordMutation.mutateAsync({
        email: normalizeEmail(forgotForm.email),
        newPassword: forgotForm.newPassword,
        captchaToken: forgotForm.captchaToken,
      });
      if (!result.success) {
        setForgotState(result.reason === "missing" ? "missing" : "error");
        return;
      }
      setForgotState("success");
      setLoginForm({ email: result.account.email, password: "", captchaToken: "" });
      setForgotCaptchaVersion(current => current + 1);
      setForgotForm(emptyForgot);
      setLoginState("idle");
      setFailedAttempts(0);
      setLockSeconds(0);
    } catch (error) {
      setForgotState("error");
      setForgotRemoteError(getRecaptchaErrorMessage(error, "Unable to update the password right now."));
      setForgotCaptchaVersion(current => current + 1);
      setForgotForm(current => ({ ...current, captchaToken: "" }));
    }
;
  }

  function resetRegister() {
    setRegisterForm(emptyRegister);
    setRegisterState("idle");
    setRegisteredAccount(null);
    setRegisterRemoteError("");
    setRegisterCaptchaVersion(current => current + 1);
    setShowRegisterPassword(false);
    setShowConfirmPassword(false);
  }

  function resetLogin() {
    setLoginForm(emptyLogin);
    setLoginState("idle");
    setLoginRemoteError("");
    setLoginCaptchaVersion(current => current + 1);
    setFailedAttempts(0);
    setLockSeconds(0);
    setSignedInAccount(null);
    setShowLoginPassword(false);
  }

  function resetForgot() {
    setForgotForm(emptyForgot);
    setForgotState("idle");
    setForgotRemoteError("");
    setForgotCaptchaVersion(current => current + 1);
    setShowForgotPassword(false);
    setShowForgotConfirmPassword(false);
  }

  function openForgotPassword() {
    setForgotForm({ email: loginForm.email, newPassword: "", confirmPassword: "", captchaToken: "" });
    setForgotState("idle");
    setForgotRemoteError("");
    setForgotCaptchaVersion(current => current + 1);
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
                {registerState === "error" && !registerRemoteError ? <div className="notice error">Please check the highlighted fields.</div> : null}
                {registerRemoteError ? <div className="notice error">{registerRemoteError}</div> : null}

                <label>
                  <span>Full name</span>
                  <input
                    type="text"
                    value={registerForm.fullName}
                    onChange={event => {
                      setRegisterState("idle");
                      setRegisterForm(current => ({ ...current, fullName: event.target.value }));
                    }}
                    className={registerFieldErrors.fullName && (registerState === "error" || registerForm.fullName.trim() !== "") ? "field-error" : ""}
                    placeholder="Reem Alshareef"
                    autoComplete="name"
                    required
                    minLength={2}
                    maxLength={160}
                    aria-invalid={registerFieldErrors.fullName ? "true" : "false"}
                  />
                  {registerFieldErrors.fullName && (registerState === "error" || registerForm.fullName.trim() !== "") ? (
                    <small className="field-note error">{registerFieldErrors.fullName}</small>
                  ) : null}
                </label>

                <label>
                  <span>Email</span>
                  <input
                    type="email"
                    value={registerForm.email}
                    onChange={event => {
                      setRegisterState("idle");
                      setRegisterForm(current => ({ ...current, email: event.target.value }));
                    }}
                    className={registerState === "exists" || (registerFieldErrors.email && (registerState === "error" || registerForm.email.trim() !== "")) ? "field-error" : ""}
                    placeholder="reem@example.com"
                    autoComplete="email"
                    inputMode="email"
                    required
                    maxLength={320}
                    aria-invalid={registerState === "exists" || !!registerFieldErrors.email}
                  />
                  {registerState === "exists" ? <small className="field-note error">This email is already registered.</small> : null}
                  {registerState !== "exists" && registerFieldErrors.email && (registerState === "error" || registerForm.email.trim() !== "") ? (
                    <small className="field-note error">{registerFieldErrors.email}</small>
                  ) : null}
                </label>

                <label>
                  <span>Phone</span>
                  <input
                    type="tel"
                    value={registerForm.phone}
                    onChange={event => {
                      setRegisterState("idle");
                      setRegisterForm(current => ({ ...current, phone: event.target.value }));
                    }}
                    className={registerFieldErrors.phone && (registerState === "error" || registerForm.phone.trim() !== "") ? "field-error" : ""}
                    placeholder="+966 50 123 4567"
                    autoComplete="tel"
                    inputMode="tel"
                    required
                    minLength={7}
                    maxLength={32}
                    aria-invalid={registerFieldErrors.phone ? "true" : "false"}
                  />
                  {registerFieldErrors.phone && (registerState === "error" || registerForm.phone.trim() !== "") ? (
                    <small className="field-note error">{registerFieldErrors.phone}</small>
                  ) : null}
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
                      className={registerFieldErrors.password && (registerState === "error" || registerForm.password !== "") ? "field-error" : ""}
                      placeholder="Create password"
                      autoComplete="new-password"
                      required
                      minLength={8}
                      maxLength={128}
                      aria-invalid={registerFieldErrors.password ? "true" : "false"}
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
                {registerFieldErrors.password && (registerState === "error" || registerForm.password !== "") ? (
                  <small className="field-note error">{registerFieldErrors.password}</small>
                ) : null}

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
                      className={registerFieldErrors.confirmPassword && (registerState === "error" || registerForm.confirmPassword !== "") ? "field-error" : ""}
                      placeholder="Repeat password"
                      autoComplete="new-password"
                      required
                      minLength={8}
                      maxLength={128}
                      aria-invalid={registerFieldErrors.confirmPassword ? "true" : "false"}
                    />
                    <button type="button" className="icon-button" onClick={() => setShowConfirmPassword(value => !value)}>
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </label>
                {registerFieldErrors.confirmPassword && (registerState === "error" || registerForm.confirmPassword !== "") ? (
                  <small className="field-note error">{registerFieldErrors.confirmPassword}</small>
                ) : null}

                <RecaptchaWidget
                  key={registerCaptchaVersion}
                  id="register-recaptcha"
                  label="Security verification"
                  errorMessage={registerFieldErrors.captcha && registerState === "error" ? registerFieldErrors.captcha : ""}
                  onTokenChange={token => {
                    setRegisterState("idle");
                    setRegisterForm(current => ({ ...current, captchaToken: token }));
                  }}
                />

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
                {forgotState === "error" && !forgotRemoteError ? (
                  <div className="notice error">Please review the email and password details.</div>
                ) : null}
                {forgotRemoteError ? <div className="notice error">{forgotRemoteError}</div> : null}

                <label>
                  <span>Email</span>
                  <input
                    type="email"
                    value={forgotForm.email}
                    onChange={event => {
                      setForgotState("idle");
                      setForgotForm(current => ({ ...current, email: event.target.value }));
                    }}
                    className={forgotFieldErrors.email && (forgotState === "error" || forgotState === "missing" || forgotForm.email.trim() !== "") ? "field-error" : ""}
                    placeholder="reem@example.com"
                    autoComplete="email"
                    inputMode="email"
                    required
                    maxLength={320}
                    aria-invalid={forgotFieldErrors.email ? "true" : "false"}
                  />
                  {forgotFieldErrors.email && (forgotState === "error" || forgotState === "missing" || forgotForm.email.trim() !== "") ? (
                    <small className="field-note error">{forgotFieldErrors.email}</small>
                  ) : null}
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
                      className={forgotFieldErrors.newPassword && (forgotState === "error" || forgotForm.newPassword !== "") ? "field-error" : ""}
                      placeholder="Create a new password"
                      autoComplete="new-password"
                      required
                      minLength={8}
                      maxLength={128}
                      aria-invalid={forgotFieldErrors.newPassword ? "true" : "false"}
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
                {forgotFieldErrors.newPassword && (forgotState === "error" || forgotForm.newPassword !== "") ? (
                  <small className="field-note error">{forgotFieldErrors.newPassword}</small>
                ) : null}

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
                      className={forgotFieldErrors.confirmPassword && (forgotState === "error" || forgotForm.confirmPassword !== "") ? "field-error" : ""}
                      placeholder="Repeat new password"
                      autoComplete="new-password"
                      required
                      minLength={8}
                      maxLength={128}
                      aria-invalid={forgotFieldErrors.confirmPassword ? "true" : "false"}
                    />
                    <button type="button" className="icon-button" onClick={() => setShowForgotConfirmPassword(value => !value)}>
                      {showForgotConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </label>
                {forgotFieldErrors.confirmPassword && (forgotState === "error" || forgotForm.confirmPassword !== "") ? (
                  <small className="field-note error">{forgotFieldErrors.confirmPassword}</small>
                ) : null}

                <RecaptchaWidget
                  key={forgotCaptchaVersion}
                  id="forgot-recaptcha"
                  label="Security verification"
                  errorMessage={forgotFieldErrors.captcha && forgotState === "error" ? forgotFieldErrors.captcha : ""}
                  onTokenChange={token => {
                    setForgotState("idle");
                    setForgotForm(current => ({ ...current, captchaToken: token }));
                  }}
                />

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

              {loginState === "error" && !loginRemoteError ? <div className="notice error">Invalid email or password.</div> : null}
              {loginRemoteError ? <div className="notice error">{loginRemoteError}</div> : null}
              {loginState === "warning" ? (
                <div className="notice warning">One attempt remaining before temporary lock.</div>
              ) : null}
              {loginMutation.error ? <div className="notice error">Unable to sign in right now.</div> : null}

              <label>
                <span>Email</span>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={event => {
                    setLoginState("idle");
                    setLoginForm(current => ({ ...current, email: event.target.value }));
                  }}
                  className={loginFieldErrors.email && (loginState === "error" || loginState === "warning" || loginForm.email.trim() !== "") ? "field-error" : ""}
                  autoComplete="email"
                  inputMode="email"
                  required
                  maxLength={320}
                  aria-invalid={loginFieldErrors.email ? "true" : "false"}
                />
                {loginFieldErrors.email && (loginState === "error" || loginState === "warning" || loginForm.email.trim() !== "") ? (
                  <small className="field-note error">{loginFieldErrors.email}</small>
                ) : null}
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
                    className={loginFieldErrors.password && (loginState === "error" || loginState === "warning" || loginForm.password.trim() !== "") ? "field-error" : ""}
                    placeholder="Enter password"
                    autoComplete="current-password"
                    required
                    minLength={1}
                    maxLength={128}
                    aria-invalid={loginFieldErrors.password ? "true" : "false"}
                  />
                  <button type="button" className="icon-button" onClick={() => setShowLoginPassword(value => !value)}>
                    {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </label>
              {loginFieldErrors.password && (loginState === "error" || loginState === "warning" || loginForm.password.trim() !== "") ? (
                <small className="field-note error">{loginFieldErrors.password}</small>
              ) : null}

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

              <RecaptchaWidget
                key={loginCaptchaVersion}
                id="login-recaptcha"
                label="Security verification"
                errorMessage={loginFieldErrors.captcha && (loginState === "error" || loginState === "warning") ? loginFieldErrors.captcha : ""}
                onTokenChange={token => {
                  setLoginState("idle");
                  setLoginForm(current => ({ ...current, captchaToken: token }));
                }}
              />

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
