import * as z from 'zod/v4';

// Schema for a full user entry as stored in the database
export const newUserEntryToDb = z.object({
  id: z.number(),
  email: z.email(),
  phone: z.string(),
  username: z.string().min(3),
  hashedPassword: z.string(),
});

// Schema for user input when registering (no id, no hashedPassword yet).
export const newUserEntry = z.object({
  email: z.email(),
  phone: z.string(),
  username: z.string().min(3),
  password: z.string().min(6),
});

export const publicUserSchema = z.object({
  id: z.number(),
  email: z.email(),
  username: z.string().min(3),
  phone: z.string(),
  createdAt: z.date(),
});

export const updatingUserEntry = z
  .object({
    email: z.email().optional(),
    phone: z.string().optional(),
    newPassword: z.string().min(6).optional(),
    password: z.string().min(6),
  })
  .refine(
    (data) =>
      data.email !== undefined ||
      data.phone !== undefined ||
      data.newPassword !== undefined,

    {
      error: 'At least one field must be provided to update',
    },
  );

// Inferred TypeScript types from Zod schemas
export type UserFromDb = z.infer<typeof newUserEntryToDb>;
export type NewUserEntry = z.infer<typeof newUserEntry>;
export type PublicUser = z.infer<typeof publicUserSchema>;
export type UpdatingUser = z.infer<typeof updatingUserEntry>;
