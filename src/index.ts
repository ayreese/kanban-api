import "./env";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { schema } from "./schema";
import { db } from "./db";
import { decodeAuthHeader, getAppSecret } from "./utils/auth";

// Fail fast at startup rather than on the first login.
getAppSecret();

const server = new ApolloServer({ schema });
const port = Number.parseInt(process.env.PORT ?? "", 10) || 4000;

const start = async () => {
  const { url } = await startStandaloneServer(server, {
    context: async ({ req }) => ({
      db,
      token: decodeAuthHeader(req.headers.authorization),
    }),
    listen: { port },
  });
  console.log(`🚀  Server ready at: ${url}`);
};

start();
