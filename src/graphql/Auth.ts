import { objectType, extendType, nonNull, stringArg } from "nexus";
import { GraphQLError } from "graphql";
import * as bcrypt from "bcryptjs";
import { signToken } from "../utils/auth";

export const AuthPayload = objectType({
  name: "AuthPayload",
  definition(t) {
    t.nonNull.string("token");
    t.nonNull.field("user", {
      type: "User",
    });
  },
});

const invalidLogin = () =>
  new GraphQLError("Invalid email or password", {
    extensions: { code: "BAD_USER_INPUT" },
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
      async resolve(_, { email, password }, { db }) {
        // Case-insensitive so accounts created before emails were
        // normalised (possibly with capitals) can still log in.
        const user = await db.user.findFirst({
          where: { email: { equals: email.trim(), mode: "insensitive" } },
        });
        // One message for both cases so the form doesn't reveal which
        // emails have accounts.
        if (!user) throw invalidLogin();
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) throw invalidLogin();
        return { token: signToken(user.id), user };
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
        const normalisedEmail = email.trim().toLowerCase();
        const existing = await db.user.findFirst({
          where: { email: { equals: normalisedEmail, mode: "insensitive" } },
          select: { id: true },
        });
        if (existing) {
          throw new GraphQLError("An account with that email already exists", {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }
        if (password.length < 8) {
          throw new GraphQLError("Password must be at least 8 characters", {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }
        const encryptedPassword = await bcrypt.hash(password, 10);
        const user = await db.user.create({
          data: {
            firstName,
            lastName,
            email: normalisedEmail,
            password: encryptedPassword,
          },
        });
        return { token: signToken(user.id), user };
      },
    });
  },
});
