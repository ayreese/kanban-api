import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { schema } from "./schema";
import { db } from "./db";
import { Context, getToken } from "./context";
import { PrismaClient } from "@prisma/client";
import { decodeAuthHeader, AuthTokenPayload } from "./utils/auth";
import { Request } from "express";
import { Token } from "graphql";

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
