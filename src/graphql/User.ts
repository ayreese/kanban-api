import { objectType, extendType, nonNull, stringArg } from "nexus";
import * as bcrypt from "bcryptjs";
import { requireUser } from "../utils/guards";
import { fullBoard } from "./includes";

// The password hash is deliberately not exposed as a field.
export const User = objectType({
  name: "User",
  definition(t) {
    t.string("id");
    t.string("firstName");
    t.string("lastName");
    t.string("email");
    t.list.field("boards", {
      type: "Board",
    });
  },
});

export const UserQuery = extendType({
  type: "Query",
  definition(t) {
    // Returns the signed-in user. The email argument is kept for schema
    // compatibility but ignored: you can only look up yourself.
    t.field("user", {
      type: "User",
      args: {
        email: stringArg(),
      },
      resolve(_, __, { db, token }) {
        const userId = requireUser(token);
        return db.user.findUnique({
          where: { id: userId },
          include: { boards: { include: fullBoard } },
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
      async resolve(_, { email, password }, { db, token }) {
        const userId = requireUser(token);
        return db.user.update({
          where: { id: userId },
          data: {
            email: email.trim().toLowerCase(),
            password: await bcrypt.hash(password, 10),
          },
        });
      },
    });
  },
});
