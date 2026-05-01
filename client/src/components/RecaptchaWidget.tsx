import { useEffect, useMemo, useRef, useState } from "react";

declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void;
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
          theme?: "light" | "dark";
        }
      ) => number;
      reset: (widgetId?: number) => void;
    };
    __floralinkRecaptchaScriptLoading?: Promise<void>;
  }
}

const RECAPTCHA_SCRIPT_ID = "floralink-recaptcha-script";
const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

function ensureRecaptchaScript() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Window is not available."));
  }

  if (window.grecaptcha) {
    return Promise.resolve();
  }

  if (window.__floralinkRecaptchaScriptLoading) {
    return window.__floralinkRecaptchaScriptLoading;
  }

  window.__floralinkRecaptchaScriptLoading = new Promise((resolve, reject) => {
    const existingScript = document.getElementById(RECAPTCHA_SCRIPT_ID) as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", () => reject(new Error("Failed to load reCAPTCHA.")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = RECAPTCHA_SCRIPT_ID;
    script.src = "https://www.google.com/recaptcha/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load reCAPTCHA."));
    document.head.appendChild(script);
  });

  return window.__floralinkRecaptchaScriptLoading;
}

type RecaptchaWidgetProps = {
  id: string;
  label?: string;
  errorMessage?: string;
  onTokenChange: (token: string) => void;
};

export function RecaptchaWidget({ id, label = "Security verification", errorMessage, onTokenChange }: RecaptchaWidgetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<number | null>(null);
  const [loadError, setLoadError] = useState("");

  const resolvedError = useMemo(() => loadError || errorMessage || "", [errorMessage, loadError]);

  useEffect(() => {
    let cancelled = false;

    async function mountWidget() {
      if (!RECAPTCHA_SITE_KEY) {
        setLoadError("reCAPTCHA site key is not configured.");
        return;
      }

      try {
        await ensureRecaptchaScript();
        if (cancelled || !containerRef.current || !window.grecaptcha || widgetIdRef.current !== null) {
          return;
        }

        window.grecaptcha.ready(() => {
          if (cancelled || !containerRef.current || !window.grecaptcha || widgetIdRef.current !== null) {
            return;
          }

          widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
            sitekey: RECAPTCHA_SITE_KEY,
            theme: "light",
            callback: token => {
              setLoadError("");
              onTokenChange(token);
            },
            "expired-callback": () => {
              onTokenChange("");
            },
            "error-callback": () => {
              onTokenChange("");
              setLoadError("reCAPTCHA could not be verified. Please try again.");
            },
          });
        });
      } catch (error) {
        console.error("Failed to initialize reCAPTCHA", error);
        if (!cancelled) {
          setLoadError("reCAPTCHA could not be loaded. Please refresh and try again.");
        }
      }
    }

    void mountWidget();

    return () => {
      cancelled = true;
      if (widgetIdRef.current !== null && window.grecaptcha) {
        window.grecaptcha.reset(widgetIdRef.current);
      }
      widgetIdRef.current = null;
    };
  }, [onTokenChange]);

  return (
    <div className="captcha-widget-group">
      <span className="captcha-label">{label}</span>
      <div id={id} ref={containerRef} className="captcha-widget-shell" />
      {resolvedError ? <small className="field-note error">{resolvedError}</small> : null}
    </div>
  );
}
