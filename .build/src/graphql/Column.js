"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColumnMutation = exports.ColumnQuery = exports.Column = void 0;
const nexus_1 = require("nexus");
exports.Column = (0, nexus_1.objectType)({
    name: "Column",
    definition(t) {
        t.string("id");
        t.string("name");
        t.string("boardId");
        t.string("color");
        t.list.field("tasks", {
            type: "Task",
        });
    },
});
exports.ColumnQuery = (0, nexus_1.extendType)({
    type: "Query",
    definition(t) {
        t.field("column", {
            type: "Column",
            args: {
                id: (0, nexus_1.stringArg)(),
            },
            resolve(_root, args, { db }) {
                return db.column.findUnique({
                    where: {
                        id: args.id,
                    },
                    include: {
                        tasks: true,
                    },
                });
            },
        });
        t.list.nonNull.field("columns", {
            type: "Column",
            resolve(_root, _args, { db }) {
                return db.column.findMany({});
            },
        });
    },
});
exports.ColumnMutation = (0, nexus_1.extendType)({
    type: "Mutation",
    definition(t) {
        t.field("createColumn", {
            type: "Board",
            args: {
                boardId: (0, nexus_1.stringArg)(),
                name: (0, nexus_1.nonNull)((0, nexus_1.stringArg)()),
                color: (0, nexus_1.nonNull)((0, nexus_1.stringArg)()),
            },
            resolve(_, { boardId, name, color }, { db, token }) {
                if (!token.userId) {
                    return "sign up or login";
                }
                else {
                    return db.board.update({
                        where: {
                            id: boardId,
                        },
                        data: {
                            columns: {
                                create: {
                                    name: name,
                                    color: color,
                                },
                            },
                        },
                        include: {
                            columns: {
                                include: {
                                    tasks: true,
                                },
                            },
                        },
                    });
                }
            },
        });
        // t.field("createColumn", {
        //   type: "Column",
        //   args: {
        //     boardId: stringArg(),
        //     name: nonNull(stringArg()),
        //     color: nonNull(stringArg()),
        //   },
        //   resolve(_, { boardId, name, color }, { db, token }) {
        //     if (!token.userId) {
        //       return "sign up or login";
        //     } else {
        //       return db.column.create({
        //         data: {
        //           name: name,
        //           color: color,
        //           board: {
        //             connect: {
        //               id: boardId,
        //             },
        //           },
        //         },
        //         include: {
        //           tasks: true,
        //         },
        //       });
        //     }
        //   },
        // });
        t.field("updateColumn", {
            type: "Column",
            args: {
                columnId: (0, nexus_1.nonNull)((0, nexus_1.stringArg)()),
                newName: (0, nexus_1.nonNull)((0, nexus_1.stringArg)()),
            },
            resolve(_, { columnId, newName }, { db }) {
                return db.column.update({
                    where: { id: columnId },
                    data: {
                        name: newName,
                    },
                });
            },
        });
        t.field("deleteColumn", {
            type: "Board",
            args: {
                boardId: (0, nexus_1.stringArg)(),
                columnId: (0, nexus_1.stringArg)(),
            },
            resolve(_, { boardId, columnId }, { db }, __) {
                return db.board.update({
                    where: {
                        id: boardId,
                    },
                    data: {
                        columns: {
                            delete: {
                                id: columnId,
                            },
                        },
                    },
                    include: {
                        columns: {
                            include: {
                                tasks: {
                                    include: {
                                        subtasks: true,
                                    },
                                },
                            },
                        },
                    },
                });
            },
        });
    },
});
//# sourceMappingURL=Column.js.map