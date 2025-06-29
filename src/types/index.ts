import * as z from 'zod/v4';

/* User related types */
// Schema for a full user entry as stored in the database

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
  profilePicture: z.string().optional().nullable(),
  createdAt: z.date(),
});

export const updatingUserEntry = z.object({
  email: z.email().optional(),
  phone: z.string().optional(),
  newPassword: z.string().min(6).optional(),
  password: z.string().min(6),
});

// Inferred TypeScript types from Zod schemas

export type NewUserEntry = z.infer<typeof newUserEntry>;
export type PublicUser = z.infer<typeof publicUserSchema>;
export type UpdatingUser = z.infer<typeof updatingUserEntry>;

/* Service related types */

export const newServiceEntry = z.object({
  serviceName: z.string().min(3),
  serviceDescription: z.string().min(6),
  averageWaitingTime: z.string().min(0),
  serviceLocation: z.string().min(3),
  userId: z.string(),
});

export const publicServiceSchema = z.object({
  id: z.number(),
  serviceName: z.string().min(3),
  serviceDescription: z.string().min(6),
  averageWaitingTime: z.string().min(0),
  serviceLocation: z.string().min(1),
  photos: z.array(z.string()).optional().nullable(),
  userId: z.number(),
  createdAt: z.date(),
});

export type NewServiceEntry = z.infer<typeof newServiceEntry>;
export type PublicService = z.infer<typeof publicServiceSchema>;
