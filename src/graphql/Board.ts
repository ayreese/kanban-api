import {
  objectType,
  extendType,
  nonNull,
  stringArg,
  inputObjectType,
  list,
} from "nexus";

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
      resolve(_, { id }, { db }) {
        return db.board.findUnique({
          where: {
            id: id!,
          },
          include: {
            columns: true,
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
    t.list.nonNull.field("userBoards", {
      type: "Board",
      resolve(_, __, { db, token }) {
        return db.board.findMany({
          where: {
            authorId: token.userId,
          },
          include: {
            columns: true,
          },
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
        if (!token.userId) {
          return "sign up or login";
        } else {
          return db.board.create({
            data: {
              name: name,
              columns: {
                createMany: {
                  data: columns,
                },
              },
              author: {
                connect: {
                  id: token.userId,
                },
              },
            },
            include: {
              columns: true,
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
