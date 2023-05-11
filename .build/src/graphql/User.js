"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserMutation = exports.UserQuery = exports.User = void 0;
const nexus_1 = require("nexus");
exports.User = (0, nexus_1.objectType)({
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
exports.UserQuery = (0, nexus_1.extendType)({
    type: "Query",
    definition(t) {
        t.field("user", {
            type: "User",
            args: {
                email: (0, nexus_1.stringArg)(),
            },
            resolve(_, { email }, { db, token }) {
                if (!token) {
                    return "Sign in is needed";
                }
                else {
                    return db.user.findUnique({
                        where: {
                            id: token.userId,
                        },
                        include: {
                            boards: {
                                include: {
                                    columns: {
                                        include: {
                                            tasks: {
                                                subtasks: true,
                                            },
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
exports.UserMutation = (0, nexus_1.extendType)({
    type: "Mutation",
    definition(t) {
        t.nonNull.field("updateUser", {
            type: "User",
            args: {
                email: (0, nexus_1.nonNull)((0, nexus_1.stringArg)()),
                password: (0, nexus_1.nonNull)((0, nexus_1.stringArg)()),
            },
            resolve(_, { email, password }, { db, token }) {
                if (!token.id) {
                    return "please log in";
                }
                else {
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
//# sourceMappingURL=User.js.map