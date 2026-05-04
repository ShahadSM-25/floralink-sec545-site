# Ready-to-Paste Results, Analysis, Challenges, and Lessons Learned

## 9. Testing Results and Analysis

### 9.1 Summary of Testing Results

The final evaluation of the FloraLink authentication prototype combined documented black-box testing with repeatable automated backend verification. A total of 23 manual black-box test cases were prepared for the four implemented Phase 3 items, namely registration, login, strong password enforcement, and temporary account lockout. In the final submission state, all 23 documented manual cases were marked as **Pass**. These outcomes were supported by representative browser-based rechecks of the most important user-facing scenarios, including successful registration, successful login, failed login attempts, warning behaviour before lockout, temporary lockout, password reset, and successful authentication using the newly updated password.

Automated verification provided a second layer of confidence. The backend Vitest suite passed 26 out of 26 tests for the implemented credential procedures, shared validation logic, logout behaviour, and reCAPTCHA secret configuration. The combination of observable browser evidence and automated route-level verification improved confidence in both usability and implementation correctness because the system was validated from the user perspective as well as from the backend service layer.

| Module | Total Tests | Pass | Fail | Notes |
|---|---:|---:|---:|---|
| UC-01 Registration | 6 | 6 | 0 | Covered successful registration, validation failures, duplicate email rejection, and reCAPTCHA-protected submission. |
| UC-02 Login | 6 | 6 | 0 | Covered successful login, invalid credentials, warning state, and temporary lockout. |
| MIT-01 Strong Authentication | 5 | 5 | 0 | Verified visible password rules and backend rejection of weak or common passwords. |
| MIT-02 Rate Limiting and Lockout | 6 | 6 | 0 | Verified fourth-attempt warning and lockout behaviour in the implemented flow. |
| Total | 23 | 23 | 0 | All documented black-box cases passed, supported by 26/26 passing automated backend tests. |

### 9.2 Identified Issues and Limitations

Although the final prototype achieved the required outcomes for the implemented phase, several issues and limitations were identified during implementation and testing. The earliest version of the prototype relied on frontend-only behaviour and temporary in-memory account handling, which was not suitable for realistic authentication verification. This issue was resolved by moving account persistence to the `customer_accounts` database table and shifting credential verification to backend procedures. As a result, registration, login, and password reset became tied to persistent stored data rather than temporary session-only values.

A second issue concerned the integration of Google reCAPTCHA. While the functionality was successfully added to both the interface and the backend verification flow, local execution exposed environmental dependencies. Correct behaviour required valid site and secret keys, successful loading of environment variables into the test environment, and a domain that was allowed in the Google reCAPTCHA configuration. In addition, the live reCAPTCHA verification test occasionally depended on external network availability, which means that a valid implementation could still face a timeout during local execution if the testing environment could not reach Google services.

A third limitation involved the temporary lockout control. The user-visible lockout experience, warning message, and countdown timer behaved correctly in the prototype; however, the lockout logic was still maintained in client-side state for demonstration purposes. This means the behaviour is suitable for illustrating the intended mitigation but should be mirrored or moved fully to the backend in a production-grade deployment to ensure stronger enforcement against bypass attempts.

### 9.3 Security Testing Results

The security-focused verification showed that the implemented controls were effective within the defined scope of the prototype. Weak passwords were rejected at the point of entry, and common passwords were still blocked by the validation logic even when the interface displayed a simplified feedback pattern. Authentication requests were protected by reCAPTCHA tokens, thereby adding resistance to automated misuse. Repeated failed login attempts correctly triggered a warning state before a temporary lockout was activated, and the countdown timer accurately reflected the remaining restricted period. Together, these outcomes demonstrate that the implemented security controls were not only present in design but also observable in runtime behaviour.

### 9.4 Fixes and Mitigations Applied

During implementation, several important fixes and mitigations were applied to improve both security and reliability. The authentication flow was upgraded from a frontend-oriented prototype into a backend-supported, database-backed solution. Shared validation rules were aligned with backend procedures so that the same input expectations were enforced consistently across the interface and the server. Password handling was strengthened by storing salted password hashes instead of relying on demo credentials or plain comparison logic. The forgot-password capability was also connected to backend reset behaviour so that password updates changed the stored account state rather than only modifying temporary client-side data.

Additional fixes were required in the supporting test environment. The reCAPTCHA secret verification test initially required explicit environment-variable loading in the local test runner, and the local execution process had to be adjusted so the secret key was correctly available to Vitest. When live network checks experienced connectivity timeouts, the issue was identified as an environmental dependency rather than a defect in the authentication logic itself. These adjustments improved the credibility of the final test evidence and made the verification process more repeatable.

### 9.5 Discussion of Results

The final results indicate that secure software development principles can be incorporated into an authentication workflow without significantly harming usability. In the current FloraLink build, security measures such as password policy enforcement, reCAPTCHA verification, backend validation, and temporary lockout are integrated into the actual user journey rather than being treated as theoretical design features. The testing outcomes suggest that the implemented controls are effective for the current coursework scope and that the prototype now represents a more realistic secure authentication flow than the earlier demo-oriented version.

At the same time, the results also show the importance of distinguishing between prototype-level security and production-level security. Some controls, such as the client-side lockout mechanism and the direct reset flow, are appropriate for demonstrating secure design concepts in a coursework prototype but would need stronger backend enforcement and more mature recovery mechanisms in a real deployment. Therefore, the results should be interpreted as successful validation of the implemented phase rather than as evidence that the full system is production-complete.

## 10. Challenges and Lessons Learned

### 10.1 Technical Challenges

One of the main technical challenges was transforming the early prototype from a demonstration-style interface into a working authentication flow backed by persistent data. This required coordinating the frontend forms, shared validation helpers, backend procedures, and the database schema so that all layers enforced the same behaviour. Another challenge involved the password-strength interface, where live feedback had to remain responsive without producing inconsistent validation states. Managing the temporary lockout countdown also required careful handling of React state and timing behaviour so that the interface could display the restricted period clearly without requiring a page refresh.

A further technical challenge appeared during local testing of reCAPTCHA verification. The test runner initially did not load the required environment variables automatically, which caused the secret key check to fail even when the value existed in the environment file. After the test configuration was adjusted to load environment variables correctly, the verification logic behaved as expected. This highlighted the difference between application runtime configuration and test-runner configuration, which must both be handled explicitly in security-sensitive features.

### 10.2 Security Challenges

The main security challenge was maintaining a balance between strong controls and acceptable usability. Password policies needed to be strict enough to reject weak credentials without making registration unnecessarily frustrating. Similarly, the lockout behaviour had to deter repeated malicious attempts while still communicating clearly to legitimate users why access had been temporarily restricted. Another challenge involved reCAPTCHA integration, since it improved protection against automated requests but also introduced deployment and configuration dependencies such as valid keys, allowed domains, and stable external connectivity for live verification.

An additional security-related challenge was ensuring that persistent credential handling remained aligned with the original prototype behaviour. Moving from demo values to database-backed authentication changed the trust boundaries of the system and required stronger backend validation, safer password handling, and clearer error-management decisions. Care was taken to avoid overly revealing messages that could expose unnecessary information to attackers while still allowing legitimate users to understand how to correct their input.

### 10.3 Solutions and Improvements

These challenges were addressed through a combination of architectural improvement and incremental refinement. First, authentication logic was moved to the backend and linked to persistent account storage so that the prototype no longer depended on temporary frontend-only behaviour. Second, validation responsibilities were shared carefully between the frontend and backend: the frontend provided immediate guidance to users, while the backend enforced the final security decision. Third, the password interface was improved with gradual feedback mechanisms so users could understand why a password was being rejected instead of receiving only a final failure message.

For the lockout feature, a dedicated warning and restricted-state presentation was used to make the temporary nature of the control clear. For reCAPTCHA, the integration was stabilized by ensuring that both runtime and testing environments could access the required configuration values correctly. When live verification tests encountered network timeouts, the problem was treated as an infrastructure dependency rather than being misclassified as an application-security failure. Overall, the implementation process reinforced the principle that secure features must be supported not only by code changes, but also by correct configuration, testing discipline, and environment awareness.

## 11. Conclusion

### 11.1 Summary of Achievements

The FloraLink project demonstrates the practical application of secure software development principles across analysis, design, implementation, and testing. Starting from structured requirements engineering that identified functional use cases, misuse cases, and mitigation controls, the project progressed into a working authentication prototype supported by database-backed registration, login, password reset, shared and backend input validation, Google reCAPTCHA integration, strong password enforcement, and temporary account lockout behaviour. Compared with the earlier demo-style implementation, the final version represents a substantially more realistic and defensible authentication workflow.

### 11.2 Project Outcomes

The outcomes of the project are both technical and methodological. Technically, the prototype now demonstrates persistent credential storage, hashed password handling, backend validation, reCAPTCHA verification, and observable security controls in the implemented user journey. Methodologically, the project shows how security requirements can be translated into concrete interface behaviour, backend rules, and structured test evidence. The completed browser-based verification and automated test suite together provide a credible basis for evaluating the implemented phase of the system.

### 11.3 Future Work

Future work should extend the current prototype beyond the authentication scope and apply the same security-oriented approach to the remaining business modules. The temporary client-side lockout mechanism should be moved to the backend for stronger enforcement, and the current direct password reset process should be replaced with a token-based recovery flow suitable for production deployment. Additional enhancements may include multi-factor authentication, broader coverage of the remaining functional use cases, payment-gateway integration with secure callback verification, and full-system penetration testing to assess the effectiveness of all mitigation controls in an end-to-end environment.
