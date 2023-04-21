import { objectType, extendType, nonNull, stringArg } from "nexus";

export const User = objectType({
  name: "User",
  definition(t) {
    t.string("id");
    t.string("firstName");
    t.string("lastName");
    t.string("email");
    t.string("password");
    t.list.field("boards", {
      type: "Board",
    });
  },
});

export const UserQuery = extendType({
  type: "Query",
  definition(t) {
    t.field("user", {
      type: "User",
      args: {
        email: stringArg(),
      },
      resolve(_, { email }, { db, token }) {
        if (!token) {
          return "Sign in is needed";
        } else {
          return db.user.findUnique({
            where: {
              id: token.userId!,
            },
            include: {
              boards: {
                include: {
                  columns: {
                    include: {
                      tasks: true,
                    },
                  },
                },
              },
            },
          });
        }
      },
    });
    t.list.field("users", {
      type: "User",
      resolve(_, __, { db }) {
        return db.user.findMany({
          include: {
            boards: true,
          },
        });
      },
    });
  },
});

export const UserMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.nonNull.field("updateUser", {
      type: "User",
      args: {
        email: nonNull(stringArg()),
        password: nonNull(stringArg()),
      },
      resolve(_, { email, password }, { db, token }) {
        if (!token.id) {
          return "please log in";
        } else {
          return db.user.update({
            where: { id: token.id },
            data: {
              email: email,
              password: password,
            },
          });
        }
      },
    });
  },
});
