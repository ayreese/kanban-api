import {
  objectType,
  extendType,
  nonNull,
  stringArg,
  inputObjectType,
  list,
} from "nexus";
import { requireUser, assertBoardOwner } from "../utils/guards";
import { fullBoard } from "./includes";

export const Board = objectType({
  name: "Board",
  definition(t) {
    t.string("id");
    t.string("name");
    t.string("authorId");
    t.list.field("columns", {
      type: "Column",
    });
  },
});

export const ColumnInputs = inputObjectType({
  name: "ColumnInputType",
  definition(t) {
    t.string("id");
    t.string("name");
    t.string("color");
  },
});

export const BoardQuery = extendType({
  type: "Query",
  definition(t) {
    t.field("board", {
      type: "Board",
      args: {
        id: stringArg(),
      },
      resolve(_, { id }, { db, token }) {
        const userId = requireUser(token);
        return db.board.findFirst({
          where: { id: id ?? undefined, authorId: userId },
          include: fullBoard,
        });
      },
    });
    // Kept for schema compatibility; now returns only your own boards.
    t.list.nonNull.field("boards", {
      type: "Board",
      resolve(_, __, { db, token }) {
        const userId = requireUser(token);
        return db.board.findMany({
          where: { authorId: userId },
          include: fullBoard,
        });
      },
    });
    t.list.nonNull.field("userBoards", {
      type: "Board",
      resolve(_, __, { db, token }) {
        const userId = requireUser(token);
        return db.board.findMany({
          where: { authorId: userId },
          include: fullBoard,
        });
      },
    });
  },
});

export const BoardMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.field("createBoard", {
      type: "Board",
      args: {
        name: stringArg(),
        columns: list(ColumnInputs),
      },
      resolve(_, { name, columns }, { db, token }) {
        const userId = requireUser(token);
        return db.board.create({
          data: {
            name: name ?? "Untitled board",
            columns: {
              createMany: {
                data: (columns ?? [])
                  .filter((c): c is NonNullable<typeof c> => !!c)
                  .map((c) => ({ name: c.name ?? "", color: c.color ?? "" })),
              },
            },
            author: { connect: { id: userId } },
          },
          include: fullBoard,
        });
      },
    });
    t.field("updateBoard", {
      type: "Board",
      args: {
        boardId: nonNull(stringArg()),
        newName: nonNull(stringArg()),
        columns: list(ColumnInputs),
      },
      async resolve(_, { boardId, newName, columns }, { db, token }) {
        const userId = requireUser(token);
        await assertBoardOwner(db, boardId, userId);

        const updateColumns: any[] = [];
        const createColumns: any[] = [];
        columns?.forEach((column) => {
          if (!column) return;
          if (column.id) {
            // Nested update is scoped to this board, so a column id from
            // another board is rejected by Prisma.
            updateColumns.push({
              where: { id: column.id },
              data: { name: column.name, color: column.color },
            });
          } else {
            createColumns.push({
              name: column.name ?? "",
              color: column.color ?? "",
            });
          }
        });

        return db.board.update({
          where: { id: boardId },
          data: {
            name: newName,
            columns: {
              create: createColumns,
              update: updateColumns,
            },
          },
          include: fullBoard,
        });
      },
    });
    t.field("deleteBoard", {
      type: "Board",
      args: {
        boardId: nonNull(stringArg()),
      },
      async resolve(_, { boardId }, { db, token }) {
        const userId = requireUser(token);
        await assertBoardOwner(db, boardId, userId);
        return db.board.delete({
          where: { id: boardId },
          include: { columns: true },
        });
      },
    });
  },
});
