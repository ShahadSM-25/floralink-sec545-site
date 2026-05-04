# Ready-to-Paste Testing Strategy and Test Plan

## 7. Testing Strategy

Security testing is an essential part of the Secure Software Development Life Cycle. Although secure design and implementation reduce risk, they do not by themselves guarantee that the final software is secure and reliable. Therefore, systematic testing is required to verify both functional correctness and the effectiveness of the implemented security controls. For the FloraLink authentication prototype, the testing strategy serves as the main high-level document that defines the testing scope, objectives, methods, type of data required, and the environment and resources needed for the testing activity.

### 7.1 Testing Scope

The scope of testing in this project covers the implemented authentication-related features of the FloraLink prototype. These include user registration, user login, password strength validation, and the account lockout mechanism after repeated failed login attempts. The testing process focuses on validating the correctness of these functions, the handling of invalid and boundary inputs, and the visibility of appropriate system responses such as warnings, validation errors, success messages, and lockout messages. Activities such as full penetration testing, advanced fuzzing campaigns, large-scale SQL injection attack campaigns, privilege-escalation testing, and complete system-wide security assessment are outside the scope of this coursework phase and are reserved for future work.

### 7.2 Testing Objectives

The primary objective of testing is to verify that the implemented functional and security requirements of the authentication prototype operate correctly and consistently. More specifically, testing aims to confirm that valid inputs are accepted, invalid inputs are rejected, password rules are enforced correctly, and repeated unauthorized login attempts trigger the intended lockout control. In addition, testing seeks to identify any functional or security gaps related to the confidentiality, integrity, and availability expectations of the implemented authentication workflow.

### 7.3 Testing Methods

Black-box testing was adopted as the primary testing method for this project. This method evaluates the system from the external user perspective without relying on internal source-code inspection during the execution of test cases. Test inputs were selected according to expected user behaviour, invalid entries, and edge conditions, while outputs were evaluated based on observable system responses. To strengthen confidence in the behaviour of the backend logic, automated route tests using Vitest were also executed as a supporting verification method for server-side validation and authentication procedures.

### 7.4 Type of Data Needed

Both qualitative and quantitative data were required during the testing process. Qualitative data included observed system behaviour such as displayed success messages, validation errors, lockout notifications, warning messages, and password feedback indicators. Quantitative data included the number of executed test cases, the number of passed and failed tests, the number of covered requirements, and the measured percentage of achieved test coverage for the implemented coursework items.

### 7.5 Test Environment and Needed Resources

Testing was conducted using the local development environment of the FloraLink web application. The required environment and resources included a web browser for end-to-end interface verification, the running frontend and backend application, the configured database connection and migrated customer account table, predefined test inputs and test accounts, and the Vitest test runner for repeatable backend verification. Internet connectivity was also required for specific external verification tasks such as reCAPTCHA secret validation when such live checks were executed.

## 7.6 Test Plan

The test plan translates the testing strategy into a more detailed and systematic workflow. It identifies the specific requirements under test, the test methods used, the time needed for execution, and the degree of coverage achieved during the evaluation of the implemented authentication prototype.

### 7.6.1 Test Requirements

The test requirements in this phase consist of the functional and security requirements related to the implemented FloraLink authentication features. These include the registration module, the login module, password strength enforcement, and the rate-limiting or account lockout control. Each requirement was tested using cases that cover the normal workflow as well as negative, invalid, and boundary scenarios.

### 7.6.2 Test Methods

The test plan relies primarily on black-box testing, where each test case defines a clear input and an expected externally observable output. Manual browser-based verification was used to evaluate the end-to-end behaviour of the interface and the user journey, while automated backend testing with Vitest was used to verify the correctness of server-side logic independently of the frontend presentation layer.

### 7.6.3 Time Needed

Testing was completed over two working days. The first day focused on manual end-to-end verification of the implemented authentication flows through the browser interface. The second day focused on running and reviewing the automated Vitest suites and recording the final outcomes. The total effective testing time was approximately four hours.

### 7.6.4 Test Coverage

The testing activities covered all four implemented deliverable items for this prototype phase: registration, login, password validation, and account lockout. A total of 23 documented manual test cases were prepared for the implemented functional and security behaviours, while the automated Vitest suite provided an additional 26 backend route tests. This resulted in a combined total of 50 test cases used to evaluate the implemented scope. In relation to the broader project specification, the achieved coverage represents the subset of requirements implemented in this coursework phase, while the remaining system requirements are planned for later development and testing stages.

## Shorter Alternative Version

If a more concise version is required for the report, the following text may be used.

### 7. Testing Strategy

The testing strategy for the FloraLink authentication prototype defines the overall approach used to verify the implemented functional and security controls. The scope of testing includes registration, login, password validation, and account lockout behaviour, while advanced penetration testing, full fuzzing campaigns, and system-wide security assessment remain outside the current coursework scope. The main objective of testing is to ensure that valid inputs are accepted, invalid inputs are rejected, and security controls such as password rules and login lockout operate as intended. Black-box testing was selected as the primary method, supported by automated Vitest tests for backend verification. The testing process required both qualitative data, such as observed interface messages and system behaviour, and quantitative data, such as executed test counts and achieved coverage. Testing was carried out in the local development environment using the browser interface, the running application, the configured database, predefined test accounts, and automated backend testing tools.

### 7.1 Test Plan

The test plan for this phase specifies the functional and security requirements covered by testing, namely registration, login, password validation, and account lockout. Black-box testing was used as the main method, supported by manual browser-based verification and automated Vitest route tests. Testing was conducted over two days with an estimated total execution time of approximately four hours. Coverage includes all implemented deliverable items for the prototype phase, with broader project coverage reserved for future work.
