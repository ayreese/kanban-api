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
      resolve(_root, args, { db }) {
        return db.board.findUnique({
          where: {
            id: args.id!,
          },
        });
      },
    });
    t.list.nonNull.field("boards", {
      type: "Board",
      resolve(_root, _args, { db }) {
        return db.board.findMany({});
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
      resolve(_, args, { db, token }) {
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
                  name: args.name,
                },
              },
            },
            include: {
              boards: {
                where: {
                  name: args.name,
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
        id: nonNull(stringArg()),
        newName: nonNull(stringArg()),
      },
      resolve(parent, args, { db }) {
        return db.board.update({
          where: { id: args.id },
          data: {
            name: args.newName,
          },
        });
      },
    });
    t.field("deleteBoard", {
      type: "Board",
      args: {
        id: nonNull(stringArg()),
      },
      resolve(parent, args, { db }) {
        return db.board.delete({
          where: { id: args.id },
        });
      },
    });
  },
});
