# Deliverable #4: Phase 3 – Implementation and Testing

## 3.1 Phase Introduction

In this phase, the theoretical work identified in Phase 2 was transformed into a **practical and testable implementation** within the FloraLink website. Two authentication-related **use cases** were selected and implemented, namely **Register Account** and **Login**. In addition, two **security mitigations** were implemented to protect these functions, namely **Strong Authentication** and **Rate Limiting with Temporary Account Lockout**. The current implementation was developed as a **standalone web interface** that focuses on authentication logic and user experience, without relying on a real database or external backend services in this version.[1] [2] [3]

The objective of this phase was not only to show that the forms work, but also to demonstrate that the security requirements chosen in Phase 2 were integrated into the system behavior itself. For that reason, the interface was designed to reflect input validation, password strength enforcement, error handling, warning messages before lockout, and temporary lockout after repeated failed attempts. This makes the implementation suitable for demonstrating the direct relationship between **use cases** and **mitigations** in the FloraLink project.[1]

## 3.2 Implemented Items

The following table summarizes the four items implemented in this phase and links each item to its role in the system.

| Category | ID | Implemented Item | Purpose of Implementation |
|---|---:|---|---|
| Use Case | UC-01 | Register Account | To allow a new user to create an account in the system by entering required data and validating it before acceptance. |
| Use Case | UC-02 | Login | To allow a registered user to sign in using the correct email address and password. |
| Mitigation | MIT-01 | Strong Authentication | To enforce strong password requirements during registration and reduce the likelihood of weak or common passwords. |
| Mitigation | MIT-02 | Rate Limiting & Account Lockout | To reduce the risk of repeated guessing and brute-force attempts by limiting failed attempts and temporarily locking the account. |

## 3.3 Implementation of the Use Cases and Mitigations

### 3.3.1 UC-01: Register Account

The account registration function was implemented within the registration interface on the FloraLink page. The form requires the user to enter **full name**, **email address**, **phone number**, **password**, and **confirm password**. Before the request is accepted, the system checks that no required field is empty, verifies that the email format is valid, and compares the password against the confirmation field to ensure that both values match. If any of these conditions is not satisfied, the system displays an error message instructing the user to review the highlighted fields.[1]

In addition, a specific validation rule was implemented to ensure that the email address has not already been used by the demo account stored in the application. If the user enters the same email as the simulated account, the interface displays a message indicating that the email is already registered and prevents registration from being completed. If all inputs are valid, the interface displays a success screen containing the entered account details and a button that directs the user to the login step.[1]

### 3.3.2 UC-02: Login

The login function was implemented in a separate tab within the same authentication page. The form asks the user to enter **email address** and **password**. The system compares the entered values against the demo account data defined inside the application. If the login data is correct, a success message appears confirming that the user has signed in successfully, while the account status is shown as **Active** and a continuation button is provided.[1]

If the login data is incorrect, the system displays an error message indicating that the email or password is invalid. The login function is also connected to a failed-attempt counter, making the login feature itself the direct point where the two selected security mitigations are applied. This integration is important because it makes the login page more than a simple form; it becomes part of the overall system protection logic against misuse.[1]

### 3.3.3 MIT-01: Strong Authentication

Strong authentication was implemented during the registration process by enforcing a **strong password policy**. The system does not only ask the user to enter a password; it also evaluates the password in real time according to several rules. These rules require the password to contain at least **8 characters**, at least **one uppercase letter**, at least **one number**, at least **one special character**, and to avoid common values such as `password`, `123456`, `qwerty`, or `welcome`.[1]

To make these requirements clear to the user, the interface displays a **visual password strength indicator** in addition to an interactive checklist showing which rules have already been satisfied and which rules are still incomplete. This design decision is important because it does not merely reject invalid input; it also helps the user correct the password immediately. Therefore, MIT-01 was implemented at two levels: the level of **security validation** and the level of **user experience support** during password creation.[1]

### 3.3.4 MIT-02: Rate Limiting & Account Lockout

The rate limiting and temporary account lockout mitigation was implemented within the login function. The system keeps track of failed login attempts and increments the counter every time the user enters incorrect credentials. When the user reaches the **fourth failed attempt**, the system displays a clear warning message stating that **one attempt remains** before temporary lockout. At this stage, an additional visual verification step also appears in the form of a **Verify you're human** checkbox, reflecting the escalation of security measures in the interface.[1]

If the user reaches **five failed login attempts**, the system activates a **temporary lockout for 15 minutes** and displays a dedicated screen indicating that the account is temporarily locked, together with a countdown timer shown in minutes and seconds. Once the lockout period expires, the system automatically returns the login state to normal and resets the failed-attempt counter. In this way, MIT-02 was implemented as a functional and behavioral part of the system rather than as a purely theoretical requirement.[1]

## 3.4 Technologies Used in Programming and Design

The implementation of this phase relied on a set of clear and lightweight technologies that suit the nature of the current version as a **standalone implementation website**. From the programming perspective, the project was built using **TypeScript** with **React**, and the interface was written through React components using **TSX/JSX**, which combine interface structure and application logic within the same files. **Vite** was also used as the development and build tool to run the project locally and generate the production build.[1] [2]

From the interface design perspective, **CSS3** and **Tailwind CSS v4** were used to create the visual layout, including spacing, colors, buttons, input fields, error states, and success or warning messages. Accordingly, the main implementation languages and design technologies can be summarized as **TypeScript/TSX** for programming, and **HTML semantics inside React components** with **CSS3 and Tailwind CSS** for interface design.[1] [2]

The following table provides a direct summary.

| Aspect | Technology / Language Used | Usage in the Project |
|---|---|---|
| Main programming language | TypeScript | Used to implement form logic, application state, and input validation. |
| User interface development | React + TSX/JSX | Used to build the registration and login components and connect them to internal state. |
| Frontend structure | HTML semantics within React | Used to define fields, buttons, messages, and semantic interface elements. |
| Interface styling | CSS3 | Used to customize layout, colors, borders, and spacing. |
| Styling framework | Tailwind CSS v4 | Used to speed up interface styling and maintain visual consistency. |
| Development and build tool | Vite | Used to run the project locally and generate the production build. |
| Local serving layer | Express static server | Used to serve the built frontend files without complex backend logic. |

## 3.5 Database Used

In the **current version of Phase 3**, **no real database** was used. This is because the project was implemented here as a **standalone frontend** intended to demonstrate the logic of the selected use cases and security mitigations directly in the web interface. For that reason, account data was represented using **static demo data embedded in the code**, while form states, failed attempts, and temporary lockout behavior were managed through **React state** inside the interface itself.[1]

This means that the system in this phase **does not permanently store accounts** and does not perform real insert, update, or query operations against a database. If the project were extended into a full production system in later phases, it would be appropriate to connect it to a database such as **MySQL** or **PostgreSQL** in order to store user records securely and persistently. However, within the scope of this deliverable, not using a database was an intentional decision so that the implementation remains focused on the required security behavior and functional testing.[1] [3]

## 3.6 Black-Box Testing Design and Execution

**Black-box testing** was adopted because this testing approach focuses on the **external behavior of the system** without examining the internal source code. It is highly suitable for this phase because the main requirement is to verify that the implemented functional and security modules produce the correct response when valid, invalid, and boundary inputs are entered. Therefore, the test cases were designed based on **user inputs** and **observable interface outputs**, such as error messages, success messages, warnings before lockout, and the temporary lockout screen.[1]

The tests were divided into four groups directly related to the modules developed in Phase 3: the **registration module**, the **login module**, the **password strength validation module**, and the **rate limiting and temporary lockout module**. This structure ensures that each of the four implemented items was tested functionally from the perspective of the end user.

## 3.7 Black-Box Test Cases

### 3.7.1 Registration Module Tests (UC-01)

| Test ID | Scenario | Input Data | Expected Result |
|---|---|---|---|
| TC-R01 | Register with complete valid data | Valid name + valid email + phone + strong password + matching confirmation | The request is accepted and the account creation success screen appears. |
| TC-R02 | Leave required fields empty | Any required field left blank | The request is rejected and an error message asks the user to review the fields. |
| TC-R03 | Enter invalid email format | For example `reemexample.com` | The request is rejected and the email field is marked as invalid. |
| TC-R04 | Password does not satisfy the rules | Short password or password without uppercase or special character | The request is rejected and registration cannot be completed. |
| TC-R05 | Password and confirmation do not match | `Bloom@2026` and `Bloom@2027` | The request is rejected and the confirmation field is marked as invalid. |
| TC-R06 | Register with an already existing email | `reem@example.com` | A message appears stating that the email is already registered. |

### 3.7.2 Login Module Tests (UC-02)

| Test ID | Scenario | Input Data | Expected Result |
|---|---|---|---|
| TC-L01 | Successful login | Correct demo email + correct password | Login succeeds and the Welcome back screen appears. |
| TC-L02 | Incorrect password | Correct email + incorrect password | An error message appears indicating invalid credentials. |
| TC-L03 | Incorrect email | Non-matching email + any password | An error message appears and access is denied. |
| TC-L04 | Fourth failed attempt | Repeat incorrect login details four times | A warning message appears indicating that one attempt remains. |
| TC-L05 | Fifth failed attempt | Repeat incorrect login details five times | The account is temporarily locked and the countdown timer is displayed. |
| TC-L06 | Attempt login while locked | Try signing in before the timer expires | The lockout state remains active and login is still blocked. |

### 3.7.3 MIT-01 Tests: Strong Authentication

| Test ID | Validation Rule | Example Input | Expected Result |
|---|---|---|---|
| TC-SA01 | Minimum length | `Ab@123` | The rule fails because the password is shorter than 8 characters. |
| TC-SA02 | Uppercase letter required | `bloom@2026` | The uppercase-letter rule fails. |
| TC-SA03 | Number required | `Bloom@Test` | The number rule fails. |
| TC-SA04 | Special character required | `Bloom2026` | The special-character rule fails. |
| TC-SA05 | Common passwords must be rejected | `Password@1` or `qwerty@1A` | The Not common rule fails and the password is rejected. |
| TC-SA06 | Fully strong password | `Bloom@2026` | All rules pass and registration can proceed. |

### 3.7.4 MIT-02 Tests: Rate Limiting & Account Lockout

| Test ID | Security Scenario | Execution Steps | Expected Result |
|---|---|---|---|
| TC-RL01 | Failed attempts are counted | Enter invalid credentials repeatedly | The failed-attempt counter increases after each failure. |
| TC-RL02 | Attempt indicator is displayed | Fail login one or more times | The attempts indicator appears in the interface. |
| TC-RL03 | Warning before lockout | Reach the fourth failed attempt | A clear warning appears stating that only one attempt remains. |
| TC-RL04 | Human verification after increased risk | After four failed attempts | The Verify you're human checkbox appears in the login form. |
| TC-RL05 | Temporary lockout | Reach five failed attempts | The account is temporarily locked for 15 minutes. |
| TC-RL06 | Reset after lockout expires | Wait until the timer finishes | The system returns to normal state and resets the counter. |

## 3.8 Testing Results and Phase Evaluation

Based on the current implementation logic, the modules developed in Phase 3 satisfy the required functional and security goals in a clear way. The first use case, **UC-01**, validates required inputs and enforces the password policy before account creation is accepted, while the second use case, **UC-02**, provides the operational context in which protective measures are activated during login. In addition, **MIT-01** and **MIT-02** were not treated as isolated security statements; they were integrated directly into the actual user experience, which reflects a correct understanding of the relationship between security requirements and software implementation.[1]

From a testing perspective, the **black-box testing** approach was appropriate for this phase because it allowed the system to be evaluated as an end user would experience it. The key questions were whether valid inputs are accepted, invalid inputs are rejected, warnings and error messages appear at the correct time, and temporary lockout is activated after the allowed number of failed attempts is exceeded. The current implementation provides affirmative answers to these questions within the limits of this demonstration version, which does not depend on a real authentication backend or persistent database.[1] [3]

## 3.9 Conclusion

Phase 3 can be considered successful in terms of converting the previous functional and security analysis into a clear practical model within FloraLink. Two **use cases** and two **mitigations** were implemented in an interconnected way, and **black-box test cases** were designed to cover all modules developed in this phase. The technologies used in programming and interface design were also clearly identified, and the report explained that the current version does not use a real database but instead relies on simulated account data and internal application state for proof-of-concept purposes. This makes the section suitable for academic submission because it connects **analysis**, **implementation**, and **testing** within one coherent structure.

## References

[1]: file:///home/ubuntu/floralink-sec545-site/client/src/pages/Home.tsx "Home.tsx - FloraLink authentication implementation"
[2]: file:///home/ubuntu/floralink-sec545-site/package.json "package.json - FloraLink project dependencies and scripts"
[3]: file:///home/ubuntu/floralink-sec545-site/server/index.ts "server/index.ts - Static server behavior for the current standalone build"
