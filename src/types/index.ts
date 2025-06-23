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

// Inferred TypeScript types from Zod schemas
export type UserFromDb = z.infer<typeof newUserEntryToDb>;
export type NewUserEntry = z.infer<typeof newUserEntry>;
export type PublicUser = z.infer<typeof publicUserSchema>;
