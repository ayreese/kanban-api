import {
  objectType,
  extendType,
  nonNull,
  stringArg,
  enumType,
  arg,
} from "nexus";
import { requireUser, assertBoardOwner, assertTaskOwner } from "../utils/guards";
import { fullBoard } from "./includes";

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

const ownedBy = (userId: string) => ({
  task: { column: { board: { authorId: userId } } },
});

export const SubtaskQuery = extendType({
  type: "Query",
  definition(t) {
    t.field("subtask", {
      type: "Subtask",
      args: {
        id: nonNull(stringArg()),
      },
      resolve(_root, { id }, { db, token }) {
        const userId = requireUser(token);
        return db.subtask.findFirst({ where: { id, ...ownedBy(userId) } });
      },
    });
    t.list.nonNull.field("subtasks", {
      type: "Subtask",
      args: {
        taskId: nonNull(stringArg()),
      },
      resolve(_root, { taskId }, { db, token }) {
        const userId = requireUser(token);
        return db.subtask.findMany({ where: { taskId, ...ownedBy(userId) } });
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
      async resolve(_, { taskId, body, status }, { db, token }) {
        const userId = requireUser(token);
        await assertTaskOwner(db, taskId, userId);
        return db.subtask.create({
          data: {
            body: body ?? "",
            status: status ?? "incomplete",
            task: { connect: { id: taskId! } },
          },
        });
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
      async resolve(
        _,
        { boardId, columnId, taskId, subtaskId, status },
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
                    update: {
                      where: { id: taskId! },
                      data: {
                        subtasks: {
                          update: {
                            where: { id: subtaskId! },
                            data: { status: status ?? undefined },
                          },
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
    t.field("deleteSubtask", {
      type: "Board",
      args: {
        boardId: stringArg(),
        columnId: stringArg(),
        taskId: stringArg(),
        subtaskId: stringArg(),
      },
      async resolve(
        _,
        { boardId, columnId, taskId, subtaskId },
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
                    update: {
                      where: { id: taskId! },
                      data: {
                        subtasks: { delete: { id: subtaskId! } },
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
  },
});
