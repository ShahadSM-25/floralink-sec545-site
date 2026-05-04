# FloraLink SEC545 Demo Script and Discussion Q&A

## Purpose

This document is a live presentation script for the **FloraLink** security demo. It is designed for a short classroom presentation in front of the professor and classmates, and it tells you exactly **what to say** and **what to show** during the live demo. The wording is intentionally natural and professional, so you can either read it closely or use it as a speaking guide.

## Before You Start the Demo

Before the session begins, open the FloraLink website and make sure the main authentication page is visible. It is also helpful to prepare one test email account that you can register or log in with during the demonstration. If possible, keep a second browser tab ready in case you need to repeat one step quickly.

| Item | What to prepare | Why it matters |
| --- | --- | --- |
| 1 | Open the FloraLink homepage | So the audience immediately sees the system interface |
| 2 | Prepare a valid demo email account | So registration and login can be shown smoothly |
| 3 | Be ready with one weak password and one strong password | To demonstrate password strength validation clearly |
| 4 | Be ready with a fake SQL injection input such as `' OR 1=1 --` | To demonstrate input rejection and SQL injection resistance |
| 5 | Keep the login form ready for repeated failed attempts | To demonstrate rate limiting and account lockout |

## Suggested Presentation Opening

You can begin with a short introduction like this:

> Good morning. My project is called **FloraLink**, and it is a flower e-commerce authentication security prototype developed for **SEC545**. The main goal of this project is to demonstrate how secure authentication can be implemented in a web application by protecting the registration, login, and password-reset flows against common security risks. In this demo, I will show the main user flows and explain how the system applies password strength enforcement, bot protection using reCAPTCHA, account lockout after repeated failed logins, secure password hashing with scrypt, and server-side input validation.

After that, move directly into the live walkthrough so the audience stays engaged.

## Live Demo Script

The table below gives you a practical sequence for the full live demonstration. If your time is limited, you can shorten some explanations, but the order is good because it starts with normal functionality and then moves into security controls.

| Step | What to show on screen | What to say |
| --- | --- | --- |
| 1 | Show the FloraLink homepage and authentication interface | This is the FloraLink authentication page. The system provides registration, login, and password reset in one interface, but the main focus of this project is not only usability. The main focus is secure authentication design and implementation. |
| 2 | Point to the registration form fields | I will begin with the registration flow. The user enters the required data, including name, email, phone number, and password. At this stage, the application already starts enforcing input rules before the data is accepted. |
| 3 | Type a weak password first | Here I am entering a weak password to show the password strength feedback. The system does not simply accept any password. It checks whether the password satisfies the required strength conditions before allowing registration. |
| 4 | Replace it with a strong password | Now I enter a stronger password. This demonstrates the strong authentication mitigation, where the system encourages secure credential creation instead of weak passwords that are easier to guess or crack. |
| 5 | Complete the reCAPTCHA challenge | Before registration is submitted, the user must complete reCAPTCHA. This is used as a bot-detection control to reduce automated abuse such as scripted account creation attempts. |
| 6 | Submit registration successfully | After valid input and successful reCAPTCHA verification, the account is created. At the backend level, the password is not stored in plain text. It is processed using **scrypt** with a random salt before storage in the database. |
| 7 | Move to the login form and log in correctly | Now I will log in with the same account. This shows the normal authentication path. The entered password is checked securely against the stored hashed value, and the user is authenticated only if the credentials match. |
| 8 | Log out or return to login and start entering wrong passwords | Next, I will demonstrate the rate-limiting and account-lockout control. I will intentionally enter the wrong password multiple times. |
| 9 | Perform repeated failed login attempts until lockout triggers | After repeated failed attempts, the account is temporarily locked. This is important because it reduces the risk of brute-force attacks by preventing unlimited password guessing. |
| 10 | Show the countdown timer or lockout message | Here the system displays the lockout status and the remaining waiting time. In this implementation, the lockout is triggered after five failed login attempts, and the account remains blocked for a limited period before login is allowed again. |
| 11 | Switch to the password reset form | I will now show the password reset flow. This allows the user to update the password through the application workflow while still applying the same password validation rules and bot-protection checks. |
| 12 | Enter a new valid password and complete reCAPTCHA | The reset flow is protected in the same way. That means security rules are applied consistently, instead of protecting only the login page and leaving the reset flow weaker. |
| 13 | Return to a form field and try a SQL injection input such as `' OR 1=1 --` | Finally, I will demonstrate how the application handles malicious-style input. Here I am entering a classic SQL injection pattern. The system rejects invalid input and does not treat it as executable SQL. |
| 14 | Submit the malicious or malformed input and show the validation error | This happens because validation is enforced on both the client and the server, and because the backend uses structured database access rather than unsafe string concatenation. As a result, malicious input is either rejected or treated only as data. |
| 15 | End on the main screen and summarize | In summary, this prototype demonstrates four main security mitigations: strong password enforcement, rate limiting and account lockout, bot detection using reCAPTCHA, and shared input validation. It also uses scrypt password hashing and a persistent database-backed authentication design. |

## Short Natural Speaking Version

If you want a smoother version that sounds less like reading from a script, you can use the following paragraph flow during the live demo:

> This project is FloraLink, a flower e-commerce authentication security prototype developed for SEC545. My objective was to secure the most sensitive entry points in the system, which are registration, login, and password reset. First, I show the registration process, where the user must provide valid input and create a strong password. The interface gives immediate password feedback, and registration also requires reCAPTCHA to reduce automated abuse. After submission, the password is not stored directly; it is hashed using scrypt with a random salt before being saved in the database. Next, I show the login process. If the credentials are correct, the user can sign in normally. If the password is entered incorrectly multiple times, the system activates a temporary lockout after five failed attempts, which helps protect against brute-force attacks. I then show the password reset flow, which follows the same validation and bot-protection principles. Finally, I test malicious input such as a SQL injection pattern to demonstrate that the system rejects invalid input and protects the backend through server-side validation and safe database handling. Overall, the prototype demonstrates practical authentication security controls in a working web application.

## What to Say About the Backend

At some point, especially if the professor asks for implementation detail, you can say the following:

> On the backend, the application uses a persistent database table for customer accounts. Password protection is implemented using the Node.js scrypt function with a random salt, and password comparison is done securely. Input validation is shared between the client and server using defined schemas, so invalid data is not trusted even if a user bypasses the frontend. The authentication procedures were also tested using Vitest to verify the main success and failure paths.

## What to Say About Testing

You should also reserve a short section for testing, because that usually strengthens the presentation academically. You can say this after the live demo:

> In addition to manual browser-based testing, I used automated Vitest tests to verify backend security behaviour. The testing covered the implemented scope of the project, including registration, login, password validation, account lockout, and authentication-related procedures. The purpose of the testing was not only to confirm normal functionality, but also to verify that invalid input and repeated misuse are handled correctly.

| Testing point | Simple explanation you can say |
| --- | --- |
| Manual testing | I manually verified the full user journey through the browser interface. |
| Automated testing | I used Vitest to test backend behaviour in a repeatable way. |
| Security focus | I tested both normal usage and misuse scenarios, such as invalid input and failed login attempts. |
| Coverage summary | The tested scope included registration, login, password validation, lockout behaviour, and related authentication logic. |

## Strong Ending Statement

You can end the demo with a confident summary like this:

> To conclude, FloraLink shows how a web authentication system can be designed with security controls built directly into the user workflow. Instead of treating security as an extra feature, this prototype integrates it into registration, login, and password reset through password policy enforcement, reCAPTCHA, account lockout, secure password hashing with scrypt, and server-side validation.

## Likely Discussion Questions and Model Answers

The following questions are realistic for a professor or classmates to ask after the demo. The answers are intentionally concise, direct, and technically safe.

| Question | Model answer |
| --- | --- |
| Why did you choose **scrypt** for password hashing? | I used scrypt because it is designed for password hashing and is more resistant to brute-force cracking than general-purpose hashing algorithms. It also supports salting and is intentionally computationally expensive, which makes large-scale guessing attacks harder. |
| Why not use plain SHA-256 for passwords? | Plain SHA-256 is fast, which is useful for integrity checking but not for password storage. For passwords, a deliberately slow password-hashing function such as scrypt is more appropriate because it increases the attack cost for offline cracking attempts. |
| Why did you choose scrypt instead of bcrypt? | Both are recognized password-hashing approaches, but in this implementation I used the built-in Node.js scrypt support. It integrates well with the project stack and still provides strong password protection with a salt and secure comparison. |
| What exactly happens after five failed login attempts? | After five failed attempts, the account enters a temporary lockout period. During that time, the user cannot continue attempting to log in, and the interface shows the lockout message and countdown. This helps reduce brute-force guessing. |
| How does reCAPTCHA improve security here? | reCAPTCHA helps distinguish normal user activity from automated bot behaviour. In this project, it is used before sensitive actions such as registration and password reset, so automated abuse becomes harder to perform at scale. |
| Can reCAPTCHA alone stop all bots? | No. reCAPTCHA is helpful, but it is only one layer of defense. That is why I combined it with input validation, password rules, and rate limiting instead of depending on a single control. |
| How is SQL injection prevented in your project? | SQL injection is reduced through two main layers. First, inputs are validated before processing. Second, the backend uses structured database access through the ORM instead of unsafe raw string concatenation. This means user input is handled as data, not executable SQL. |
| Why do validation on both client and server? | Client-side validation improves usability by giving immediate feedback, but it cannot be trusted by itself because an attacker can bypass the frontend. Server-side validation is the real enforcement layer, so both are needed for security and user experience. |
| What does **Zod** do in your system? | Zod is used to define validation rules in a structured way. It checks whether incoming data matches the required format, such as valid email structure, password constraints, and field length requirements. |
| Where are user accounts stored? | User accounts are stored in a persistent database table for customer accounts. This means the data remains available across sessions rather than existing only temporarily in memory. |
| Is the password stored anywhere in plain text? | No. The password is never stored in plain text. It is hashed with scrypt and a random salt before storage, so the stored value is not the original password. |
| What did your tests verify? | The tests verified both expected and defensive behaviour, such as successful and failed authentication flows, validation behaviour, and the handling of lockout-related logic. |
| What are the limitations of this prototype? | The prototype focuses on the implemented coursework scope, mainly authentication security controls. It is not yet a full production e-commerce platform, and some broader features such as advanced monitoring, multi-factor authentication, and wider security testing can be added in future work. |
| What would you improve next if you had more time? | The next improvements would be multi-factor authentication, email-based reset confirmation, broader audit logging, stronger monitoring, and more advanced security testing such as deeper fuzzing and penetration-oriented verification. |
| Why is account lockout important even if passwords are strong? | Strong passwords reduce guessability, but attackers may still attempt repeated logins automatically. Lockout adds another layer by limiting repeated attempts, so the system is not relying on password complexity alone. |

## Quick Recovery Lines if Something Goes Wrong in the Live Demo

Sometimes live demos do not go perfectly. If something minor happens, use calm fallback lines like these:

| Situation | What to say |
| --- | --- |
| The page loads slowly | I will give the page a moment to refresh. Meanwhile, the key point is that the implemented control is part of the authentication workflow I designed. |
| reCAPTCHA takes time | This step depends on the live verification challenge, but the important point is that the flow requires bot verification before sensitive actions are accepted. |
| You do not want to wait through the full lockout timer | The lockout has already been triggered here, and this demonstrates the security response. I will move to the next flow to keep the demo within time. |
| A form value is rejected unexpectedly | This actually supports the main idea of the project, which is that invalid input is actively rejected instead of being silently accepted. |

## Final Advice for Delivery

Speak slowly, keep your explanation tied to what is visible on the screen, and avoid jumping immediately into backend details unless someone asks. First show that the application works, then show that it fails safely when you give it bad input. That presentation style usually makes the security value clearer to both technical and non-technical listeners.
