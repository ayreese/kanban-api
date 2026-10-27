import { GraphQLError } from "graphql";
import { PrismaClient } from "@prisma/client";
import { AuthTokenPayload } from "./auth";

/** Returns the signed-in user's id, or throws an UNAUTHENTICATED error. */
export function requireUser(token: AuthTokenPayload | null | undefined): string {
  if (!token?.userId) {
    throw new GraphQLError("Sign up or log in to continue", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }
  return token.userId;
}

function notFound(): never {
  // Same error whether the record is missing or owned by someone else,
  // so ids can't be probed.
  throw new GraphQLError("Not found", { extensions: { code: "NOT_FOUND" } });
}

function required(value: string | null | undefined): string {
  if (!value) notFound();
  return value;
}

export async function assertBoardOwner(
  db: PrismaClient,
  boardId: string | null | undefined,
  userId: string,
) {
  const board = await db.board.findFirst({
    where: { id: required(boardId), authorId: userId },
    select: { id: true },
  });
  if (!board) notFound();
}

export async function assertColumnOwner(
  db: PrismaClient,
  columnId: string | null | undefined,
  userId: string,
  boardId?: string | null,
) {
  const column = await db.column.findFirst({
    where: {
      id: required(columnId),
      board: { authorId: userId },
      ...(boardId ? { boardId } : {}),
    },
    select: { id: true },
  });
  if (!column) notFound();
}

export async function assertTaskOwner(
  db: PrismaClient,
  taskId: string | null | undefined,
  userId: string,
  boardId?: string | null,
) {
  const task = await db.task.findFirst({
    where: {
      id: required(taskId),
      column: {
        board: { authorId: userId },
        ...(boardId ? { boardId } : {}),
      },
    },
    select: { id: true },
  });
  if (!task) notFound();
}
