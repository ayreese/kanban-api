"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoardMutation = exports.BoardQuery = exports.ColumnInputs = exports.Board = void 0;
const nexus_1 = require("nexus");
exports.Board = (0, nexus_1.objectType)({
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
exports.ColumnInputs = (0, nexus_1.inputObjectType)({
    name: "ColumnInputType",
    definition(t) {
        t.string("id");
        t.string("name");
        t.string("color");
    },
});
exports.BoardQuery = (0, nexus_1.extendType)({
    type: "Query",
    definition(t) {
        t.field("board", {
            type: "Board",
            args: {
                id: (0, nexus_1.stringArg)(),
            },
            resolve(_, { id }, { db }) {
                return db.board.findUnique({
                    where: {
                        id: id,
                    },
                    include: {
                        columns: true,
                    },
                });
            },
        });
        t.list.nonNull.field("boards", {
            type: "Board",
            resolve(_, __, { db }) {
                return db.board.findMany({ include: { columns: true } });
            },
        });
        t.list.nonNull.field("userBoards", {
            type: "Board",
            resolve(_, __, { db, token }) {
                return db.board.findMany({
                    where: {
                        authorId: token.userId,
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
exports.BoardMutation = (0, nexus_1.extendType)({
    type: "Mutation",
    definition(t) {
        t.field("createBoard", {
            type: "Board",
            args: {
                name: (0, nexus_1.stringArg)(),
                columns: (0, nexus_1.list)(exports.ColumnInputs),
            },
            resolve(_, { name, columns }, { db, token }) {
                if (!token.userId) {
                    return "sign up or login";
                }
                else {
                    return db.board.create({
                        data: {
                            name: name,
                            columns: {
                                createMany: {
                                    data: columns,
                                },
                            },
                            author: {
                                connect: {
                                    id: token.userId,
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
        t.field("updateBoard", {
            type: "Board",
            args: {
                boardId: (0, nexus_1.nonNull)((0, nexus_1.stringArg)()),
                newName: (0, nexus_1.nonNull)((0, nexus_1.stringArg)()),
                columns: (0, nexus_1.list)(exports.ColumnInputs),
            },
            resolve(_, { boardId, newName, columns }, { db }) {
                const updateColumns = [];
                const createColumns = [];
                const columnsToUpdate = columns === null || columns === void 0 ? void 0 : columns.forEach((column) => {
                    if (column === null || column === void 0 ? void 0 : column.id) {
                        const newObj = {
                            where: { id: column.id },
                            data: {
                                name: column.name,
                                color: column.color,
                            },
                        };
                        updateColumns.push(newObj);
                    }
                    else
                        createColumns.push(column);
                });
                return db.board.update({
                    where: { id: boardId },
                    data: {
                        name: newName,
                        columns: {
                            create: createColumns,
                            update: updateColumns,
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
        t.field("deleteBoard", {
            type: "Board",
            args: {
                boardId: (0, nexus_1.nonNull)((0, nexus_1.stringArg)()),
            },
            resolve(_, { boardId }, { db }) {
                return db.board.delete({
                    where: { id: boardId },
                    include: { columns: true },
                });
            },
        });
    },
});
//# sourceMappingURL=Board.js.map