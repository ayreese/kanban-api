import { objectType, extendType, nonNull, stringArg } from "nexus";
import {
  requireUser,
  assertBoardOwner,
  assertColumnOwner,
} from "../utils/guards";
import { fullBoard } from "./includes";

export const Column = objectType({
  name: "Column",
  definition(t) {
    t.string("id");
    t.string("name");
    t.string("boardId");
    t.string("color");
    t.list.field("tasks", {
      type: "Task",
    });
  },
});

export const ColumnQuery = extendType({
  type: "Query",
  definition(t) {
    t.field("column", {
      type: "Column",
      args: {
        id: stringArg(),
      },
      resolve(_root, { id }, { db, token }) {
        const userId = requireUser(token);
        return db.column.findFirst({
          where: { id: id ?? undefined, board: { authorId: userId } },
          include: { tasks: { include: { subtasks: true } } },
        });
      },
    });
    t.list.nonNull.field("columns", {
      type: "Column",
      resolve(_root, _args, { db, token }) {
        const userId = requireUser(token);
        return db.column.findMany({
          where: { board: { authorId: userId } },
        });
      },
    });
  },
});

export const ColumnMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.field("createColumn", {
      type: "Board",
      args: {
        boardId: stringArg(),
        name: nonNull(stringArg()),
        color: nonNull(stringArg()),
      },
      async resolve(_, { boardId, name, color }, { db, token }) {
        const userId = requireUser(token);
        await assertBoardOwner(db, boardId, userId);
        return db.board.update({
          where: { id: boardId! },
          data: {
            columns: {
              create: { name, color },
            },
          },
          include: fullBoard,
        });
      },
    });
    t.field("updateColumn", {
      type: "Column",
      args: {
        columnId: nonNull(stringArg()),
        newName: nonNull(stringArg()),
      },
      async resolve(_, { columnId, newName }, { db, token }) {
        const userId = requireUser(token);
        await assertColumnOwner(db, columnId, userId);
        return db.column.update({
          where: { id: columnId },
          data: { name: newName },
        });
      },
    });
    t.field("deleteColumn", {
      type: "Board",
      args: {
        boardId: stringArg(),
        columnId: stringArg(),
      },
      async resolve(_, { boardId, columnId }, { db, token }) {
        const userId = requireUser(token);
        await assertBoardOwner(db, boardId, userId);
        return db.board.update({
          where: { id: boardId! },
          data: {
            columns: {
              delete: { id: columnId! },
            },
          },
          include: fullBoard,
        });
      },
    });
  },
});
