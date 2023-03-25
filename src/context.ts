import { db } from "./db";
import { PrismaClient } from "@prisma/client";
import { decodeAuthHeader, AuthTokenPayload } from "./utils/auth";
import { Request } from "express";

export interface Context {
  db: PrismaClient;
  userId?: string;
}

export const getToken = ({ req }: { req?: Request }): Context => {
  const token =
    req && req.headers.authorization
      ? decodeAuthHeader(req.headers.authorization)
      : null;
  return {
    db,
    userId: token?.userId,
  };
};

// export const context = {
//   db,
// };
