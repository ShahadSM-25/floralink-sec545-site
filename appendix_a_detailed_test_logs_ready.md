# Appendix A: Detailed Test Logs

This appendix documents the detailed execution records for the main test cases performed on the FloraLink authentication module. The purpose of this appendix is to provide traceable evidence of how the implemented controls were tested in practice, including the test date, test environment, execution steps, and the comparison between expected and actual results.

## A.1 Test Environment Details

| Item | Details |
|---|---|
| Project Name | FloraLink |
| Test Scope | Registration, login, password reset, account lockout, reCAPTCHA validation, and input validation |
| Test Date | 4 May 2026 |
| Tester Name | Project Developer / Tester |
| Test Environment | Local development environment |
| Frontend Stack | React, TypeScript, Tailwind CSS |
| Backend Stack | Node.js, Express, tRPC |
| Database | TiDB / MySQL-compatible database via Drizzle ORM |
| Browser Used | Google Chrome |
| Operating Environment | Local machine |
| Test Data | Valid and invalid names, emails, passwords, and security payloads |

## A.2 Detailed Test Execution Logs

### Test Case A1: Successful User Registration

| Field | Record |
|---|---|
| Test Case ID | TC-A1 |
| Test Title | Successful registration with valid input |
| Objective | To verify that a new user account can be created when all required fields contain valid data |
| Input Data | Full name: Sarah Ahmed; Email: sarah.test@example.com; Password: Bloom@2026 |
| Expected Result | The system accepts the request, creates the account, stores the user record in the database, and redirects the user to the authenticated state or success flow |
| Actual Result | The registration request was accepted and the account was successfully created using valid input data |
| Status | Pass |

**Execution Trace:**
1. Open the registration page.
2. Enter a valid full name, valid email address, and strong password.
3. Complete the reCAPTCHA challenge.
4. Submit the registration form.
5. Observe the success response and verify that the account record is available in the backend data store.

### Test Case A2: Registration Rejected for Weak Password

| Field | Record |
|---|---|
| Test Case ID | TC-A2 |
| Test Title | Weak password rejection |
| Objective | To verify that the system blocks passwords that do not satisfy the required strength policy |
| Input Data | Full name: Sarah Ahmed; Email: sarah.weak@example.com; Password: sara123 |
| Expected Result | The system rejects the password because it does not satisfy the required complexity rules |
| Actual Result | The interface displayed password policy guidance and the request was not accepted until a compliant password was entered |
| Status | Pass |

**Execution Trace:**
1. Open the registration page.
2. Enter a valid name and email address.
3. Enter a weak password that does not satisfy all required rules.
4. Observe the password checklist and validation warning.
5. Attempt to submit the form.
6. Confirm that the weak password is rejected.

### Test Case A3: Login with Valid Credentials

| Field | Record |
|---|---|
| Test Case ID | TC-A3 |
| Test Title | Successful login |
| Objective | To verify that a registered user can log in using correct credentials |
| Input Data | Email: sarah.test@example.com; Password: Bloom@2026 |
| Expected Result | The system authenticates the user and grants access to the application |
| Actual Result | The login request succeeded and the user session was established correctly |
| Status | Pass |

**Execution Trace:**
1. Open the login page.
2. Enter a valid registered email and matching password.
3. Complete the reCAPTCHA challenge if required.
4. Submit the login form.
5. Confirm that the system allows access.

### Test Case A4: Login Rejected for Invalid Credentials

| Field | Record |
|---|---|
| Test Case ID | TC-A4 |
| Test Title | Invalid login rejection |
| Objective | To verify that the system rejects incorrect email or password combinations |
| Input Data | Email: sarah.test@example.com; Password: WrongPass@2026 |
| Expected Result | The system denies authentication and displays an appropriate error message |
| Actual Result | The login attempt was rejected and the user remained unauthenticated |
| Status | Pass |

**Execution Trace:**
1. Open the login page.
2. Enter a valid email with an incorrect password.
3. Submit the form.
4. Observe the rejection message.
5. Confirm that no authenticated session is created.

### Test Case A5: Temporary Lockout After Repeated Failed Login Attempts

| Field | Record |
|---|---|
| Test Case ID | TC-A5 |
| Test Title | Account lockout after repeated failures |
| Objective | To verify that repeated failed login attempts trigger a temporary lock state |
| Input Data | Same valid email entered with incorrect password five consecutive times |
| Expected Result | The system issues a warning before lockout and then activates a temporary 15-minute lock state after the defined threshold |
| Actual Result | A warning appeared on the fourth failed attempt, and the temporary lock state was triggered on the fifth failed attempt with a visible countdown |
| Status | Pass |

**Execution Trace:**
1. Open the login form.
2. Enter a valid registered email and an incorrect password.
3. Submit the login attempt repeatedly.
4. Observe the warning message before the threshold is reached.
5. Submit the fifth failed attempt.
6. Confirm that the lockout state and countdown timer are displayed.

### Test Case A6: Input Validation Against Invalid Email Format

| Field | Record |
|---|---|
| Test Case ID | TC-A6 |
| Test Title | Invalid email format rejection |
| Objective | To verify that malformed email input is rejected before successful submission |
| Input Data | Email: sarah.test@invalid |
| Expected Result | The system identifies the email as invalid and blocks successful submission until a valid format is entered |
| Actual Result | The form validation rejected the malformed email format and the request did not proceed as a valid submission |
| Status | Pass |

**Execution Trace:**
1. Open the target form.
2. Enter an invalid email format.
3. Complete the remaining fields with otherwise valid values.
4. Submit the form.
5. Confirm that the validation message appears and submission is blocked.

### Test Case A7: Input Validation Against SQL Injection Payload

| Field | Record |
|---|---|
| Test Case ID | TC-A7 |
| Test Title | SQL injection-style payload rejection |
| Objective | To verify that malicious input patterns do not bypass authentication or alter database behavior |
| Input Data | Email: `' OR '1'='1`; Password: test123 |
| Expected Result | The input is treated strictly as data, authentication fails, and no unauthorized access is granted |
| Actual Result | The malicious payload did not bypass authentication and no unintended database behavior was observed |
| Status | Pass |

**Execution Trace:**
1. Open the login form.
2. Enter an SQL injection-style string in the email field.
3. Enter any arbitrary password.
4. Submit the request.
5. Confirm that access is denied and the system behaves normally.

### Test Case A8: reCAPTCHA Required Before Public Authentication Requests

| Field | Record |
|---|---|
| Test Case ID | TC-A8 |
| Test Title | reCAPTCHA enforcement |
| Objective | To verify that public authentication actions require a valid reCAPTCHA token |
| Input Data | Valid form data submitted without a valid reCAPTCHA token |
| Expected Result | The system rejects the request and does not process the protected action |
| Actual Result | Requests without valid verification were not accepted by the protected flow |
| Status | Pass |

**Execution Trace:**
1. Open the registration or login form.
2. Fill the required fields with valid input.
3. Do not complete reCAPTCHA, or submit the request with an invalid token during controlled testing.
4. Submit the form.
5. Confirm that the protected request is rejected.

## A.3 Expected vs. Actual Output Summary

| Test Case ID | Expected Outcome | Actual Outcome | Final Status |
|---|---|---|---|
| TC-A1 | Valid registration succeeds | Registration succeeded | Pass |
| TC-A2 | Weak password rejected | Weak password rejected | Pass |
| TC-A3 | Valid login succeeds | Login succeeded | Pass |
| TC-A4 | Invalid login rejected | Login rejected | Pass |
| TC-A5 | Lockout after repeated failures | Lockout activated correctly | Pass |
| TC-A6 | Invalid email rejected | Invalid email rejected | Pass |
| TC-A7 | Injection payload blocked | Injection attempt failed | Pass |
| TC-A8 | reCAPTCHA required | Unverified request rejected | Pass |

## A.4 Notes

The detailed logs show that the implemented authentication controls behaved as expected during local execution. The recorded tests provide supporting evidence for password policy enforcement, invalid credential handling, temporary lockout behavior, reCAPTCHA protection, and server-side treatment of malicious input as non-executable data. This appendix may be supplemented with screenshots, browser developer tools captures, and backend request traces where required by the submission guidelines.
