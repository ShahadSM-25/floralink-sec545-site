import 'dotenv/config';
import { appRouter } from './server/routers.ts';

const ctx = {
  user: null,
  req: { protocol: 'http', headers: {} },
  res: { clearCookie() {} },
};

async function main() {
  const caller = appRouter.createCaller(ctx);
  const stamp = Date.now();
  const email = `diag.${stamp}@example.com`;

  const register = await caller.auth.register({
    fullName: 'Diag User',
    email,
    phone: '+966500000000',
    password: 'Bloom@2035',
  });

  const login = await caller.auth.login({
    email,
    password: 'Bloom@2035',
  });

  const reset = await caller.auth.resetPassword({
    email,
    newPassword: 'Bloom@2036',
  });

  console.log(JSON.stringify({ register, login, reset }, null, 2));
}

main().catch(error => {
  console.error(error?.stack || String(error));
  process.exit(1);
});
