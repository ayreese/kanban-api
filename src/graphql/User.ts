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
      resolve(parent, args, ctx) {
        const { db, token } = ctx;
        console.log("token", token);
        if (!token) {
          return "Sign in is needed";
        } else {
          return db.user.findUnique({
            where: {
              email: args.email!,
            },
            include: {
              boards: true,
            },
          });
        }
      },
    });
    t.list.field("users", {
      type: "User",
      resolve(parent, args, { db, token }) {
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
    t.nonNull.field("createUser", {
      type: "User",
      args: {
        firstName: nonNull(stringArg()),
        lastName: nonNull(stringArg()),
        email: nonNull(stringArg()),
        password: nonNull(stringArg()),
      },
      resolve(parent, args, ctx) {
        const user = {
          firstName: args.firstName,
          lastName: args.lastName,
          email: args.email,
          password: args.password,
        };

        return ctx.db.user.create({
          data: user,
        });
      },
    });
    t.nonNull.field("updateUser", {
      type: "User",
      args: {
        oldEmail: nonNull(stringArg()),
        newEmail: nonNull(stringArg()),
      },
      resolve(parent, args, ctx) {
        const user = {
          oldEmail: args.oldEmail,
          newEmail: args.newEmail,
        };

        return ctx.db.user.update({
          where: { email: args.oldEmail },
          data: {
            email: args.newEmail,
          },
        });
      },
    });
  },
});
