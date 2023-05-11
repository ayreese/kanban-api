"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subTaskMutation = exports.SubtaskQuery = exports.Subtask = exports.StatusEnum = void 0;
const nexus_1 = require("nexus");
exports.StatusEnum = (0, nexus_1.enumType)({
    name: "Status",
    members: {
        INCOMPLETE: "incomplete",
        COMPLETE: "complete",
    },
    description: "Current status for subtask",
});
exports.Subtask = (0, nexus_1.objectType)({
    name: "Subtask",
    description: "Additional task for task field",
    definition(t) {
        t.string("id");
        t.string("body");
        t.field("status", { type: exports.StatusEnum });
        t.string("taskId");
    },
});
exports.SubtaskQuery = (0, nexus_1.extendType)({
    type: "Query",
    definition(t) {
        t.field("subtask", {
            type: "Subtask",
            args: {
                id: (0, nexus_1.nonNull)((0, nexus_1.stringArg)()),
            },
            resolve(_root, args, { db, token }) {
                if (!token.userId) {
                    return "sign up or login";
                }
                else {
                    return db.subtask.findUnique({
                        where: {
                            id: args.id,
                        },
                    });
                }
            },
        });
        t.list.nonNull.field("subtasks", {
            type: "Subtask",
            args: {
                taskId: (0, nexus_1.nonNull)((0, nexus_1.stringArg)()),
            },
            resolve(_root, { taskId }, { db, token }) {
                if (!token.userId) {
                    return "sign up or login";
                }
                else {
                    return db.subtask.findMany({
                        where: {
                            taskId: taskId,
                        },
                    });
                }
            },
        });
    },
});
exports.subTaskMutation = (0, nexus_1.extendType)({
    type: "Mutation",
    definition(t) {
        t.nonNull.field("createSubtask", {
            type: "Subtask",
            args: {
                taskId: (0, nexus_1.stringArg)(),
                body: (0, nexus_1.stringArg)(),
                status: (0, nexus_1.arg)({ type: exports.StatusEnum }),
            },
            resolve(_, { taskId, body }, { db, token }) {
                if (!token.userId) {
                    return "sign up or login";
                }
                else {
                    return db.subtask.create({
                        data: {
                            body: body,
                            status: "incomplete",
                            task: {
                                connect: {
                                    id: taskId,
                                },
                            },
                        },
                    });
                }
            },
        });
        t.field("updateSubtask", {
            type: "Board",
            args: {
                boardId: (0, nexus_1.stringArg)(),
                columnId: (0, nexus_1.stringArg)(),
                taskId: (0, nexus_1.stringArg)(),
                subtaskId: (0, nexus_1.stringArg)(),
                status: exports.StatusEnum,
            },
            resolve: async (_, { boardId, columnId, taskId, subtaskId, status }, { db }) => {
                const updatedBoard = await db.board.update({
                    where: { id: boardId },
                    data: {
                        columns: {
                            update: {
                                where: { id: columnId },
                                data: {
                                    tasks: {
                                        update: {
                                            where: { id: taskId },
                                            data: {
                                                subtasks: {
                                                    update: {
                                                        where: { id: subtaskId },
                                                        data: { status },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
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
                return updatedBoard;
            },
        });
        // t.field("updateSubtask", {
        //   type: "Board",
        //   args: {
        //     boardId: stringArg(),
        //     columnId: stringArg(),
        //     taskId: stringArg(),
        //     subtaskId: stringArg(),
        //     status: StatusEnum,
        //   },
        //   resolve(_, { boardId, columnId, taskId, subtaskId, status }, { db }) {
        //     return db.board.update({
        //       where: { id: boardId },
        //       data: {
        //         columns: {
        //           update: {
        //             where: {
        //               id: columnId,
        //             },
        //             data: {
        //               tasks: {
        //                 update: {
        //                   where: {
        //                     id: taskId,
        //                   },
        //                   subtasks: {
        //                     where: {
        //                       id: subtaskId,
        //                     },
        //                     data: {
        //                       status: status,
        //                     },
        //                   },
        //                 },
        //               },
        //             },
        //           },
        //         },
        //       },
        //       include: {
        //         columns: {
        //           include: {
        //             tasks: {
        //               include: {
        //                 subtasks: true,
        //               },
        //             },
        //           },
        //         },
        //       },
        //     });
        //   },
        // });
        t.field("deleteSubtask", {
            type: "Board",
            args: {
                boardId: (0, nexus_1.stringArg)(),
                columnId: (0, nexus_1.stringArg)(),
                taskId: (0, nexus_1.stringArg)(),
                subtaskId: (0, nexus_1.stringArg)(),
            },
            resolve(_, { boardId, columnId, taskId, subtaskId }, { db }) {
                return db.board.update({
                    where: { id: boardId },
                    data: {
                        columns: {
                            update: {
                                where: {
                                    id: columnId,
                                },
                                data: {
                                    tasks: {
                                        update: {
                                            where: {
                                                id: taskId,
                                            },
                                            data: {
                                                subtasks: {
                                                    delete: {
                                                        id: subtaskId,
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
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
//# sourceMappingURL=Subtask.js.map