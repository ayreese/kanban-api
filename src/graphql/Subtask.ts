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
      type: "Subtask",
      args: {
        subtaskId: stringArg(),
        status: StatusEnum,
      },
      resolve(_, { subtaskId, status }, { db }) {
        return db.subtask.update({
          where: {
            id: subtaskId,
          },
          data: {
            status: status,
          },
        });
      },
    });
  },
});
