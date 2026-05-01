import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import type { AppRouter } from './server/routers';

async function main() {
  const client = createTRPCProxyClient<AppRouter>({
    links: [
      httpBatchLink({
        url: 'http://127.0.0.1:3000/api/trpc',
        transformer: superjson,
        fetch(url, options) {
          return fetch(url, {
            ...(options ?? {}),
            credentials: 'include',
          });
        },
      }),
    ],
  });

  const stamp = Date.now();
  const email = `httpdiag.${stamp}@example.com`;

  const register = await client.auth.register.mutate({
    fullName: 'HTTP Diag User',
    email,
    phone: '+966500000001',
    password: 'Bloom@2037',
  });

  const login = await client.auth.login.mutate({
    email,
    password: 'Bloom@2037',
  });

  const reset = await client.auth.resetPassword.mutate({
    email,
    newPassword: 'Bloom@2038',
  });

  console.log(JSON.stringify({ register, login, reset }, null, 2));
}

main().catch(error => {
  console.error(error?.stack || String(error));
  process.exit(1);
});
