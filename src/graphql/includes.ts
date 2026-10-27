/** Prisma include used whenever a full board is returned to the client. */
export const fullBoard = {
  columns: {
    include: {
      tasks: {
        include: {
          subtasks: true,
        },
      },
    },
  },
} as const;

type SubtaskInput = {
  id?: string | null;
  body?: string | null;
  status?: string | null;
} | null;

/** Normalises subtask inputs for creation: drops blanks, defaults status. */
export function newSubtasks(subtasks: SubtaskInput[] | null | undefined) {
  return (subtasks ?? [])
    .filter((s): s is NonNullable<SubtaskInput> => !!s)
    .map((s) => ({
      body: s.body ?? "",
      status: s.status ?? "incomplete",
    }));
}
