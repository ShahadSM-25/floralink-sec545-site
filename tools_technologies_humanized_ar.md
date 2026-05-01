## Technologies and Tools Used

In this phase, the implementation relied on a set of technologies that fit the nature of the current FloraLink prototype. Since the project focuses on the authentication part of the system, the selected tools were meant to support a fast, clear, and maintainable frontend implementation rather than a full production environment.

From the programming side, the main language used was **TypeScript**. It was selected because it helps organize the code more clearly and reduces errors by defining data types for form inputs, application states, and validation logic. The interface itself was built using **React**, where the registration and login screens were implemented as interactive components. Inside these components, the structure of the page was written using **TSX/JSX**, which made it easier to combine the interface layout with the required logic for validation, success messages, warnings, and lockout behavior.[1] [2]

For the visual design and interface styling, the project used **CSS3** together with **Tailwind CSS**. CSS was used to control the detailed appearance of the page, such as spacing, colors, borders, and responsive layout. Tailwind CSS helped speed up the design process and made it easier to keep the interface visually consistent across the different parts of the page. This was especially useful in styling the authentication forms, error messages, success states, warning notices, and password strength section.[1] [2]

The project was developed and built using **Vite**, which served as the frontend development tool. Vite was useful for running the application locally during development and generating the final build used for demonstration. In addition, the current version includes a very lightweight **Express** server whose role is limited to serving the built frontend files after compilation. This means Express was not used here as a full backend with business logic or database processing, but only as a simple static serving layer for the website.[2] [3]

The following table summarizes the main technologies used in the implementation.

| Area | Technology | Purpose in the Project |
|---|---|---|
| Programming language | TypeScript | Used to write the application logic, validation rules, and form state management. |
| Frontend library | React | Used to build the registration and login interface as interactive components. |
| UI structure | TSX / JSX | Used to combine page structure with frontend logic inside React components. |
| Styling language | CSS3 | Used to control colors, spacing, layout, borders, and overall visual appearance. |
| Styling framework | Tailwind CSS | Used to speed up styling and maintain a consistent design across the interface. |
| Build tool | Vite | Used for local development and generating the production build. |
| Serving layer | Express | Used only to serve the final built files of the standalone website. |

## Database Used

In the current implementation of Phase 3, **no real database was used**. This is because the delivered version was designed as a **standalone frontend prototype** to demonstrate the selected use cases and security mitigations in a clear and direct way. Instead of storing data in a database, the implementation relies on **static demo account data** defined inside the code, while the form values, failed login attempts, and temporary lockout behavior are managed through the internal state of the frontend.[1]

As a result, the current system does not permanently save newly registered accounts and does not perform real database operations such as insert, update, or query. If FloraLink is extended in a later phase into a complete production-ready system, it would be appropriate to connect it to a database such as **MySQL** or **PostgreSQL** in order to store user information securely and persistently. However, for this deliverable, not using a database was a deliberate choice because the main purpose of the phase was to implement and test the required functionality and security behavior in a focused way.[1] [3]

## References

[1]: file:///home/ubuntu/floralink-sec545-site/client/src/pages/Home.tsx "Home.tsx - FloraLink authentication implementation"
[2]: file:///home/ubuntu/floralink-sec545-site/package.json "package.json - FloraLink project dependencies and scripts"
[3]: file:///home/ubuntu/floralink-sec545-site/server/index.ts "server/index.ts - Static server behavior for the current standalone build"
