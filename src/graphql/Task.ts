// import { objectType, extendType, nonNull, stringArg } from "nexus";

// export const Task = objectType({
//   name: "Task",
//   definition(t) {
//     t.string("id");
//     t.string("name");
//     t.string("body");
//     t.field("status", {
//       type: "Column",
//       resolve(parent, args, ctx) {
//         return ctx.db.column.findUnique({
//           where: {
//             id: parent.id!,
//           },
//         });
//       },
//     });
//   },
// });

// export const TaskQuery = extendType({
//   type: "Query",
//   definition(t) {
//     t.field("task", {
//       type: "Task",
//       args: {
//         id: nonNull(stringArg()),
//       },
//       resolve(_root, args, ctx) {
//         return ctx.db.task.findUnique({
//           where: {
//             id: args.id,
//           },
//         });
//       },
//     });
//     t.list.nonNull.field("tasks", {
//       type: "Task",
//       resolve(_root, _args, ctx) {
//         return ctx.db.task.findMany({});
//       },
//     });
//   },
// });

// export const TaskMutation = extendType({
//   type: "Mutation",
//   definition(t) {
//     t.nonNull.field("createTask", {
//       type: "Task",
//       args: {
//         name: stringArg(),
//         body: stringArg(),
//       },
//       resolve(parent, args, ctx) {
//         const task = {
//           name: args.name!,
//           body: args.body!,
//         };

//         return ctx.db.task.create({ data: task });
//       },
//     });
//     t.field("deleteTask", {
//       type: "Task",
//       args: {
//         id: nonNull(stringArg()),
//       },
//       resolve(_, { id }, { db }) {
//         return db.task.delete({
//           where: {
//             id: id,
//           },
//         });
//       },
//     });
//   },
// });
