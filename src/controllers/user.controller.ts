import { RequestHandler } from 'express';
import prisma from '../prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { newUserEntry, publicUserSchema } from '../types';

// Safe user
const safeUserSelect = {
  id: true,
  email: true,
  username: true,
  phone: true,
  createdAt: true,
};

// Get all users
export const getAllUsers: RequestHandler = async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: safeUserSelect,
    });

    // Handle is if one/some users fail schema
    const safeUsers = users
      .map((u) => publicUserSchema.safeParse(u))
      .filter((result) => result.success)
      .map((result) => result.data);

    res.json(safeUsers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Get a user by id
export const getOneUser: RequestHandler = async (
  req,
  res,
): Promise<void | any> => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID format' });

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: safeUserSelect,
    });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Validate and sanitize query with zod
    const safeUser = publicUserSchema.parse(user);

    res.json(safeUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

// Create a user
export const createUser: RequestHandler = async (
  req,
  res,
): Promise<void | any> => {
  const parseResult = newUserEntry.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.format() });
  }

  const { username, email, phone, password } = parseResult.data;

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { phone }],
    },
  });

  if (existingUser) {
    return res
      .status(400)
      .json({ error: 'User with this email/phone already exists' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const createdUser = await prisma.user.create({
      data: {
        username,
        email,
        phone,
        hashedPassword,
      },
      select: safeUserSelect,
    });

    const safeUser = publicUserSchema.parse(createdUser);

    res.status(201).json(safeUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
};

export const updateUser: RequestHandler = async (
  req,
  res,
): Promise<void | any> => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID format' });

  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: req.body,
    });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
};

export const deleteUser: RequestHandler = async (
  req,
  res,
): Promise<void | any> => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID format' });

  try {
    await prisma.user.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

// Login a user
export const loginUser: RequestHandler = async (
  req,
  res,
): Promise<void | any> => {
  const { emailOrPhone, password } = req.body;
  if (!emailOrPhone || !password) {
    return res
      .status(400)
      .json({ error: 'Email/Phone and password are required' });
  }
  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: emailOrPhone }, { phone: emailOrPhone }],
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const passwordMatches = await bcrypt.compare(password, user.hashedPassword);

    if (!passwordMatches) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const safeUser = publicUserSchema.parse(user);

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        username: user.username,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '30d' },
    );

    res.json({
      token,
      safeUser,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
