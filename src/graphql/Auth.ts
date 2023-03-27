import { objectType, extendType, nonNull, stringArg } from "nexus";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { APP_SECRET } from "../utils/auth";

export const AuthPayload = objectType({
  name: "AuthPayload",
  definition(t) {
    t.nonNull.string("token");
    t.nonNull.field("user", {
      type: "User",
    });
  },
});

export const AuthMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.nonNull.field("login", {
      type: "AuthPayload",
      args: {
        email: nonNull(stringArg()),
        password: nonNull(stringArg()),
      },
      async resolve(parent, { email, password }, { db }) {
        const user = await db.user.findUnique({
          where: { email: email },
        });
        if (!user) {
          throw new Error("No such user found");
        }
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
          throw new Error("Invalid password");
        }
        const token = jwt.sign({ userId: user.id }, APP_SECRET);
        return {
          token,
          user,
        };
      },
    });
    t.nonNull.field("signUp", {
      type: "AuthPayload",
      args: {
        email: nonNull(stringArg()),
        password: nonNull(stringArg()),
        firstName: nonNull(stringArg()),
        lastName: nonNull(stringArg()),
      },
      async resolve(_, { email, password, firstName, lastName }, { db }) {
        const encryptedPassword = await bcrypt.hash(password, 10);
        const user = await db.user.create({
          data: { firstName, lastName, email, password: encryptedPassword },
        });
        const token = jwt.sign({ userId: user.id }, APP_SECRET);
        return {
          token,
          user,
        };
      },
    });
  },
});
