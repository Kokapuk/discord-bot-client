import type z from 'zod';

export type StructuredZodIssues = Record<string, string[]>;

const structureZodIssues = (error: z.ZodError) => {
  const issues: StructuredZodIssues = {};

  error.issues.forEach((issue) => {
    const path = issue.path.join('/');

    if (!issues[path]) {
      issues[path] = [];
    }

    issues[path].push(issue.message);
  });

  return issues;
};

export default structureZodIssues;
