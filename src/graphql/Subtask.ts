import {
  objectType,
  extendType,
  nonNull,
  stringArg,
  enumType,
  arg,
} from "nexus";

export const StatusEnum = enumType({
  name: "Status",
  members: {
    INCOMPLETE: "incomplete",
    COMPLETE: "complete",
  },
  description: "Current status for subtask",
});

export const Subtask = objectType({
  name: "Subtask",
  description: "Additional task for task field",
  definition(t) {
    t.string("id");
    t.string("body");
    t.field("status", { type: StatusEnum });
    t.string("taskId");
  },
});

export const SubtaskQuery = extendType({
  type: "Query",
  definition(t) {
    t.field("subtask", {
      type: "Subtask",
      args: {
        id: nonNull(stringArg()),
      },
      resolve(_root, args, { db, token }) {
        if (!token.userId) {
          return "sign up or login";
        } else {
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
        taskId: nonNull(stringArg()),
      },
      resolve(_root, { taskId }, { db, token }) {
        if (!token.userId) {
          return "sign up or login";
        } else {
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

export const subTaskMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.nonNull.field("createSubtask", {
      type: "Subtask",
      args: {
        taskId: stringArg(),
        body: stringArg(),
        status: arg({ type: StatusEnum }),
      },
      resolve(_, { taskId, body }, { db, token }) {
        if (!token.userId) {
          return "sign up or login";
        } else {
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
        boardId: stringArg(),
        columnId: stringArg(),
        taskId: stringArg(),
        subtaskId: stringArg(),
        status: StatusEnum,
      },
      resolve: async (
        _,
        { boardId, columnId, taskId, subtaskId, status },
        { db },
      ) => {
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
        boardId: stringArg(),
        columnId: stringArg(),
        taskId: stringArg(),
        subtaskId: stringArg(),
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
