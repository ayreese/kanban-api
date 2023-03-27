import { objectType, extendType, nonNull, stringArg } from "nexus";

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

export const BoardQuery = extendType({
  type: "Query",
  definition(t) {
    t.field("board", {
      type: "Board",
      args: {
        id: stringArg(),
      },
      resolve(_, { id }, { db }) {
        return db.board.findUnique({
          where: {
            id: id!,
          },
        });
      },
    });
    t.list.nonNull.field("boards", {
      type: "Board",
      resolve(_, __, { db }) {
        return db.board.findMany({ include: { columns: true } });
      },
    });
  },
});

export const BoardMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.field("createBoard", {
      type: "User",
      args: {
        name: stringArg(),
      },
      resolve(_, { name }, { db, token }) {
        if (!token.userId) {
          return "sign up or login";
        } else {
          return db.user.update({
            where: {
              id: token.userId,
            },
            data: {
              boards: {
                create: {
                  name: name,
                },
              },
            },
            include: {
              boards: {
                where: {
                  name: name,
                },
              },
            },
          });
        }
      },
    });
    t.field("updateBoard", {
      type: "Board",
      args: {
        boardId: nonNull(stringArg()),
        newName: nonNull(stringArg()),
      },
      resolve(_, { boardId, newName }, { db }) {
        return db.board.update({
          where: { id: boardId },
          data: {
            name: newName,
          },
        });
      },
    });
    t.field("deleteBoard", {
      type: "Board",
      args: {
        boardId: nonNull(stringArg()),
      },
      resolve(_, { boardId }, { db }) {
        return db.board.delete({
          where: { id: boardId },
          include: { columns: true },
        });
      },
    });
  },
});
