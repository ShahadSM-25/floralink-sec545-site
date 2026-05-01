export type RegisterValidationInput = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  captchaToken: string;
};

export type LoginValidationInput = {
  email: string;
  password: string;
  captchaToken: string;
};

export type ForgotValidationInput = {
  email: string;
  newPassword: string;
  confirmPassword: string;
  captchaToken: string;
};

const fullNamePattern = /^[\p{L}][\p{L}\s'.-]*$/u;
const phonePattern = /^\+?[0-9()\-\s]+$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const commonPasswordPattern = /(password|123456|qwerty|welcome)/i;

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function normalizeFullName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function countDigits(value: string) {
  return value.replace(/\D/g, "").length;
}

export function isFullNameValid(value: string) {
  const normalized = normalizeFullName(value);
  return normalized.length >= 2 && normalized.length <= 160 && fullNamePattern.test(normalized);
}

export function isPhoneValid(value: string) {
  const trimmed = value.trim();
  const digits = countDigits(trimmed);
  return trimmed.length >= 7 && trimmed.length <= 32 && phonePattern.test(trimmed) && digits >= 7 && digits <= 15;
}

export function isEmailValid(value: string) {
  return emailPattern.test(value.trim());
}

export function hasCaptchaToken(value: string) {
  return value.trim().length > 0;
}

export function getPasswordRules(password: string) {
  return [
    { label: "8+ characters", passed: password.length >= 8 },
    { label: "Uppercase letter", passed: /[A-Z]/.test(password) },
    { label: "Number", passed: /\d/.test(password) },
    { label: "Special character", passed: /[^A-Za-z0-9]/.test(password) },
  ];
}

export function isPasswordStrong(password: string) {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password) &&
    !commonPasswordPattern.test(password)
  );
}

export function getRegisterFieldErrors(form: RegisterValidationInput) {
  const errors = {
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    captcha: "",
  };

  if (form.fullName.trim() === "") {
    errors.fullName = "Full name is required.";
  } else if (!isFullNameValid(form.fullName)) {
    errors.fullName = "Use at least 2 letters and only letters, spaces, apostrophes, periods, or hyphens.";
  }

  if (form.email.trim() === "") {
    errors.email = "Email is required.";
  } else if (!isEmailValid(form.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (form.phone.trim() === "") {
    errors.phone = "Phone number is required.";
  } else if (!isPhoneValid(form.phone)) {
    errors.phone = "Enter 7 to 15 digits using numbers, spaces, parentheses, hyphens, and an optional leading +.";
  }

  if (form.password === "") {
    errors.password = "Password is required.";
  } else if (!isPasswordStrong(form.password)) {
    errors.password = "Password must satisfy all listed security rules.";
  }

  if (form.confirmPassword === "") {
    errors.confirmPassword = "Please confirm your password.";
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  if (!hasCaptchaToken(form.captchaToken)) {
    errors.captcha = "Please complete the reCAPTCHA verification.";
  }

  return errors;
}

export function getLoginFieldErrors(form: LoginValidationInput) {
  const errors = {
    email: "",
    password: "",
    captcha: "",
  };

  if (form.email.trim() === "") {
    errors.email = "Email is required.";
  } else if (!isEmailValid(form.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (form.password.trim() === "") {
    errors.password = "Password is required.";
  }

  if (!hasCaptchaToken(form.captchaToken)) {
    errors.captcha = "Please complete the reCAPTCHA verification before signing in.";
  }

  return errors;
}

export function getForgotFieldErrors(form: ForgotValidationInput) {
  const errors = {
    email: "",
    newPassword: "",
    confirmPassword: "",
    captcha: "",
  };

  if (form.email.trim() === "") {
    errors.email = "Email is required.";
  } else if (!isEmailValid(form.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (form.newPassword === "") {
    errors.newPassword = "New password is required.";
  } else if (!isPasswordStrong(form.newPassword)) {
    errors.newPassword = "Password must satisfy all listed security rules.";
  }

  if (form.confirmPassword === "") {
    errors.confirmPassword = "Please confirm the new password.";
  } else if (form.newPassword !== form.confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  if (!hasCaptchaToken(form.captchaToken)) {
    errors.captcha = "Please complete the reCAPTCHA verification before saving the new password.";
  }

  return errors;
}
