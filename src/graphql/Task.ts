import { objectType, extendType, nonNull, stringArg } from "nexus";

export const Task = objectType({
  name: "Task",
  definition(t) {
    t.string("id");
    t.string("name");
    t.string("body");
    t.string("columnId");
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
      type: "Column",
      args: {
        columnId: stringArg(),
        name: stringArg(),
        body: stringArg(),
      },
      resolve(_, args, { db }) {
        const task = {
          name: args.name!,
          body: args.body!,
        };
        return db.column.update({
          where: {
            id: args.columnId,
          },
          data: {
            tasks: {
              create: {
                name: args.name,
                body: args.body,
              },
            },
          },
          include: {
            tasks: {
              where: {
                name: args.name,
              },
            },
          },
        });
      },
    });
    t.field("updateTask", {
      type: "Task",
      args: {
        taskId: stringArg(),
        name: stringArg(),
        body: stringArg(),
      },
      resolve(_, { taskId, name, body }, { db }) {
        return db.task.update({
          where: {
            id: taskId,
          },
          data: {
            name: name,
            body: body,
          },
        });
      },
    });
    t.field("deleteTask", {
      type: "Task",
      args: {
        id: nonNull(stringArg()),
      },
      resolve(_, { id }, { db }) {
        return db.task.delete({
          where: {
            id: id,
          },
        });
      },
    });
  },
});
