import {
  objectType,
  extendType,
  nonNull,
  list,
  stringArg,
  inputObjectType,
} from "nexus";
import { StatusEnum } from "./Subtask";
import {
  requireUser,
  assertBoardOwner,
  assertColumnOwner,
  assertTaskOwner,
} from "../utils/guards";
import { fullBoard, newSubtasks } from "./includes";

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
      resolve(_root, { id }, { db, token }) {
        const userId = requireUser(token);
        return db.task.findFirst({
          where: { id, column: { board: { authorId: userId } } },
          include: { subtasks: true },
        });
      },
    });
    t.list.nonNull.field("tasks", {
      type: "Task",
      resolve(_root, _args, { db, token }) {
        const userId = requireUser(token);
        return db.task.findMany({
          where: { column: { board: { authorId: userId } } },
        });
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
      async resolve(
        _,
        { boardId, columnId, name, body, subtasks },
        { db, token },
      ) {
        const userId = requireUser(token);
        await assertBoardOwner(db, boardId, userId);
        return db.board.update({
          where: { id: boardId! },
          data: {
            columns: {
              update: {
                where: { id: columnId! },
                data: {
                  tasks: {
                    create: {
                      name: name ?? "",
                      body: body ?? "",
                      subtasks: {
                        createMany: { data: newSubtasks(subtasks) },
                      },
                    },
                  },
                },
              },
            },
          },
          include: fullBoard,
        });
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
      async resolve(
        _,
        { boardId, columnId, taskId, name, body, subtasks },
        { db, token },
      ) {
        const userId = requireUser(token);
        await assertBoardOwner(db, boardId, userId);
        // The task and its destination column must both be on this board.
        await assertTaskOwner(db, taskId, userId, boardId);
        await assertColumnOwner(db, columnId, userId, boardId);

        const updateSubtasks: any[] = [];
        subtasks?.forEach((subtask) => {
          if (subtask?.id) {
            updateSubtasks.push({
              where: { id: subtask.id },
              data: { body: subtask.body },
            });
          }
        });
        const createSubtasks = newSubtasks(subtasks?.filter((s) => !s?.id));

        // Move the task to the chosen column (status change in the UI).
        await db.column.update({
          where: { id: columnId! },
          data: { tasks: { connect: { id: taskId! } } },
        });
        return db.board.update({
          where: { id: boardId! },
          data: {
            columns: {
              update: {
                where: { id: columnId! },
                data: {
                  tasks: {
                    update: {
                      where: { id: taskId! },
                      data: {
                        name: name ?? undefined,
                        body: body ?? undefined,
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
          include: fullBoard,
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
      async resolve(_, { boardId, columnId, taskId }, { db, token }) {
        const userId = requireUser(token);
        await assertBoardOwner(db, boardId, userId);
        return db.board.update({
          where: { id: boardId! },
          data: {
            columns: {
              update: {
                where: { id: columnId! },
                data: {
                  tasks: { delete: { id: taskId } },
                },
              },
            },
          },
          include: fullBoard,
        });
      },
    });
  },
});
