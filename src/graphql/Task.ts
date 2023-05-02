import {
  objectType,
  extendType,
  nonNull,
  list,
  stringArg,
  inputObjectType,
} from "nexus";
import { StatusEnum } from "./Subtask";

export const Task = objectType({
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

export const SubtaskInputs = inputObjectType({
  name: "SubtaskInputType",
  definition(t) {
    t.string("id");
    t.string("body");
    t.field("status", { type: StatusEnum });
  },
});

export const TaskQuery = extendType({
  type: "Query",
  definition(t) {
    t.field("task", {
      type: "Task",
      args: {
        id: nonNull(stringArg()),
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

export const TaskMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.nonNull.field("createTask", {
      type: "Board",
      args: {
        boardId: stringArg(),
        columnId: stringArg(),
        name: stringArg(),
        body: stringArg(),
        subtasks: list(SubtaskInputs),
      },
      resolve(_, { boardId, columnId, name, body, subtasks }, { db, token }) {
        if (!token.userId) {
          return "sign up or login";
        } else {
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
        boardId: stringArg(),
        columnId: stringArg(),
        taskId: stringArg(),
        name: stringArg(),
        body: stringArg(),
        subtasks: list(SubtaskInputs),
      },
      resolve(_, { boardId, columnId, taskId, name, body, subtasks }, { db }) {
        const updateSubtasks: any = [];
        const createSubtasks: any = [];

        const subtasksToUpdate = subtasks?.map((subtask) => {
          if (subtask?.id) {
            const newObj = {
              where: { id: subtask.id },
              data: {
                body: subtask.body,
                // status: subtask.status,
              },
            };
            updateSubtasks.push(newObj);
          } else createSubtasks.push(subtask);
        });
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
        boardId: stringArg(),
        columnId: stringArg(),
        taskId: nonNull(stringArg()),
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
