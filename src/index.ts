import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { schema } from "./schema";
import { db } from "./db";
import { decodeAuthHeader, AuthTokenPayload } from "./utils/auth";

const server = new ApolloServer({ schema });

const ready = async () => {
  const { url } = await startStandaloneServer(server, {
    context: async ({ req, res }) => ({
      db: db,
      token:
        req && req.headers.authorization
          ? decodeAuthHeader(req.headers.authorization)
          : null,
    }),
    listen: { port: 4000 },
  });
  console.log(`🚀  Server ready at: ${url}`);
};

ready();
