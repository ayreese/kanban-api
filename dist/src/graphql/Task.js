"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskMutation = exports.TaskQuery = exports.SubtaskInputs = exports.Task = void 0;
const nexus_1 = require("nexus");
const Subtask_1 = require("./Subtask");
exports.Task = (0, nexus_1.objectType)({
    name: "Task",
    definition(t) {
        t.string("id");
        t.string("name");
        t.string("body");
        t.string("columnId");
        t.list.field("subtasks", {
            type: "Subtask",
        });
    },
});
exports.SubtaskInputs = (0, nexus_1.inputObjectType)({
    name: "SubtaskInputType",
    definition(t) {
        t.string("id");
        t.string("body");
        t.field("status", { type: Subtask_1.StatusEnum });
    },
});
exports.TaskQuery = (0, nexus_1.extendType)({
    type: "Query",
    definition(t) {
        t.field("task", {
            type: "Task",
            args: {
                id: (0, nexus_1.nonNull)((0, nexus_1.stringArg)()),
            },
            resolve(_root, args, { db }) {
                return db.task.findUnique({
                    where: {
                        id: args.id,
                    },
                });
            },
        });
        t.list.nonNull.field("tasks", {
            type: "Task",
            resolve(_root, _args, { db }) {
                return db.task.findMany({});
            },
        });
    },
});
exports.TaskMutation = (0, nexus_1.extendType)({
    type: "Mutation",
    definition(t) {
        t.nonNull.field("createTask", {
            type: "Board",
            args: {
                boardId: (0, nexus_1.stringArg)(),
                columnId: (0, nexus_1.stringArg)(),
                name: (0, nexus_1.stringArg)(),
                body: (0, nexus_1.stringArg)(),
                subtasks: (0, nexus_1.list)(exports.SubtaskInputs),
            },
            resolve(_, { boardId, columnId, name, body, subtasks }, { db, token }) {
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
                                update: {
                                    where: {
                                        id: columnId,
                                    },
                                    data: {
                                        tasks: {
                                            create: {
                                                name: name,
                                                body: body,
                                                subtasks: {
                                                    createMany: {
                                                        data: subtasks,
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
                }
            },
        });
        t.field("updateTask", {
            type: "Board",
            args: {
                boardId: (0, nexus_1.stringArg)(),
                columnId: (0, nexus_1.stringArg)(),
                taskId: (0, nexus_1.stringArg)(),
                name: (0, nexus_1.stringArg)(),
                body: (0, nexus_1.stringArg)(),
                subtasks: (0, nexus_1.list)(exports.SubtaskInputs),
            },
            async resolve(_, { boardId, columnId, taskId, name, body, subtasks }, { db }) {
                const updateSubtasks = [];
                const createSubtasks = [];
                const subtasksToUpdate = subtasks === null || subtasks === void 0 ? void 0 : subtasks.map((subtask) => {
                    if (subtask === null || subtask === void 0 ? void 0 : subtask.id) {
                        const newObj = {
                            where: { id: subtask.id },
                            data: {
                                body: subtask.body,
                                // status: subtask.status,
                            },
                        };
                        updateSubtasks.push(newObj);
                    }
                    else
                        createSubtasks.push(subtask);
                });
                await db.column.update({
                    where: {
                        id: columnId,
                    },
                    data: {
                        tasks: {
                            connect: {
                                id: taskId,
                            },
                        },
                    },
                });
                return await db.board.update({
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
                                                name: name,
                                                body: body,
                                                subtasks: {
                                                    create: createSubtasks,
                                                    update: updateSubtasks,
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
        t.field("deleteTask", {
            type: "Board",
            args: {
                boardId: (0, nexus_1.stringArg)(),
                columnId: (0, nexus_1.stringArg)(),
                taskId: (0, nexus_1.nonNull)((0, nexus_1.stringArg)()),
            },
            resolve(_, { boardId, columnId, taskId }, { db }) {
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
                                        delete: {
                                            id: taskId,
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
//# sourceMappingURL=Task.js.map