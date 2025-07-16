
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

import { generateRecipeInputSchema, createRecipeInputSchema } from './schema';
import { generateRecipe } from './handlers/generate_recipe';
import { getRecipeById } from './handlers/get_recipe_by_id';
import { createRecipe } from './handlers/create_recipe';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  
  generateRecipe: publicProcedure
    .input(generateRecipeInputSchema)
    .mutation(({ input }) => generateRecipe(input)),
  
  getRecipeById: publicProcedure
    .input(z.number())
    .query(({ input }) => getRecipeById(input)),
  
  createRecipe: publicProcedure
    .input(createRecipeInputSchema)
    .mutation(({ input }) => createRecipe(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
