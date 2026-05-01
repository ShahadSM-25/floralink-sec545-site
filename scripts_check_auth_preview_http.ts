import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import type { AppRouter } from './server/routers';

async function main() {
  const client = createTRPCProxyClient<AppRouter>({
    links: [
      httpBatchLink({
        url: 'https://3000-imoqes6aejhdoejsf52re-c18e3a29.sg1.manus.computer/api/trpc',
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
  const email = `previewdiag.${stamp}@example.com`;

  const register = await client.auth.register.mutate({
    fullName: 'Preview Diag User',
    email,
    phone: '+966500000002',
    password: 'Bloom@2039',
  });

  console.log(JSON.stringify({ register }, null, 2));
}

main().catch(error => {
  console.error(error?.stack || String(error));
  process.exit(1);
});
