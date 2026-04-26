# FloraLink Authentication Prototype

This repository contains the FloraLink frontend implementation prepared for the SEC545 project phase focused on account registration and sign-in.

## Implemented Scope

The current version includes a simplified customer-facing interface for account creation and account sign-in, together with the required protection behaviors integrated naturally into the user flow.

| Area | Description |
|---|---|
| Account creation | A registration form with validation, password rules, and duplicate email handling |
| Account sign-in | A sign-in form with invalid credential handling and temporary lockout after repeated failures |
| Test cases | A separate review page that summarizes the main scenarios used during validation |

## Run Locally

Open a terminal in the project folder and run the following commands.

```bash
pnpm install
pnpm dev
```

After the development server starts, open the local address shown in the terminal.

## Production Build

To generate the production build, run the following command.

```bash
pnpm build
```

To run the built version locally, use:

```bash
pnpm start
```

## Project Notes

The interface is intentionally kept simple so it can be reviewed easily during demonstration and course evaluation.
