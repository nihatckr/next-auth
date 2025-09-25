
nihat@CAKIR MINGW64 ~/Desktop/Web/next-auth (main)
$ cd /c/Users/nihat/Desktop/Web/next-auth && npm run build

> next-auth@0.1.0 build
> next build

   ▲ Next.js 15.5.3
   - Environments: .env.local, .env

   Creating an optimized production build ...
<w> [webpack.cache.PackFileCacheStrategy] Serializing big strings (128kiB) impacts deserialization performance (consider using Buffer instead and decode when needed)
 ⚠ Compiled with warnings in 1759ms

./src/lib/generated/prisma/runtime/wasm-engine-edge.js
A Node.js API is used (setImmediate at line: 4825) which is not supported in the Edge Runtime.
Learn more: https://nextjs.org/docs/api-reference/edge-runtime

Import trace for requested module:
./src/lib/generated/prisma/runtime/wasm-engine-edge.js
./src/lib/generated/prisma/wasm.js
./src/lib/generated/prisma/default.js
./src/schemas/index.ts
./src/auth.config.ts

./node_modules/bcryptjs/index.js
A Node.js module is loaded ('crypto' at line 32) which is not supported in the Edge Runtime.
Learn More: https://nextjs.org/docs/messages/node-module-in-edge-runtime

Import trace for requested module:
./node_modules/bcryptjs/index.js
./src/auth.config.ts

./node_modules/bcryptjs/index.js
A Node.js API is used (process.nextTick at line: 337) which is not supported in the Edge Runtime.
Learn more: https://nextjs.org/docs/api-reference/edge-runtime

Import trace for requested module:
./node_modules/bcryptjs/index.js
./src/auth.config.ts

./node_modules/bcryptjs/index.js
A Node.js API is used (setImmediate at line: 338) which is not supported in the Edge Runtime.
Learn more: https://nextjs.org/docs/api-reference/edge-runtime

Import trace for requested module:
./node_modules/bcryptjs/index.js
./src/auth.config.ts

./node_modules/bcryptjs/index.js
A Node.js API is used (setImmediate at line: 339) which is not supported in the Edge Runtime.
Learn more: https://nextjs.org/docs/api-reference/edge-runtime

Import trace for requested module:
./node_modules/bcryptjs/index.js
./src/auth.config.ts

./node_modules/bcryptjs/index.js
A Node.js API is used (process.nextTick at line: 340) which is not supported in the Edge Runtime.
Learn more: https://nextjs.org/docs/api-reference/edge-runtime

Import trace for requested module:
./node_modules/bcryptjs/index.js
./src/auth.config.ts

 ✓ Compiled successfully in 13.8s
   Linting and checking validity of types  ...Failed to compile.

./src/auth.ts:12:3
Type error: 'pages' is specified more than once, so this usage will be overwritten.

  10 |
  11 | export const { handlers , auth,signIn,signOut,unstable_update  } = NextAuth({
> 12 |   pages: {
     |   ^
  13 |     signIn: '/auth/login',
  14 |     error: '/auth/error',
  15 |
Next.js build worker exited with code: 1 and signal: null

nihat@CAKIR MINGW64 ~/Desktop/Web/next-auth (main)
$
