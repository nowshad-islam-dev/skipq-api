import { RequestHandler } from 'express';
import prisma from '../prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { newUserEntry, publicUserSchema, updatingUserEntry } from '../types';
import uploadToCloudinary from '../utils/cloudinary';

// Safe user
const safeUserSelect = {
  id: true,
  email: true,
  username: true,
  phone: true,
  profilePicture: true,
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
      OR: [{ email }, { phone }, { username }],
    },
  });

  if (existingUser) {
    return res
      .status(400)
      .json({ error: 'Email/phone/username already exists' });
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

// Update a user
export const updateUser: RequestHandler = async (
  req,
  res,
): Promise<void | any> => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID format' });

  const parseResult = updatingUserEntry.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.format() });
  }

  const validatedData = parseResult.data;

  // Check if all the fields are empty ( including req.file)
  const noUpdatesProvided =
    !validatedData.email &&
    !validatedData.newPassword &&
    validatedData.phone &&
    !req.file;
  if (noUpdatesProvided) {
    return res
      .status(400)
      .json({ error: 'At least one field must be provided to update' });
  }

  const existingUser = await prisma.user.findFirst({
    where: { id },
  });

  if (!existingUser) {
    return res
      .status(400)
      .json({ error: 'User with this email/phone does not exist' });
  }

  const passwordMatches = await bcrypt.compare(
    validatedData.password,
    existingUser.hashedPassword,
  );

  if (!passwordMatches) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  let newProfilePicUrl: string | undefined = undefined;

  if (req.file) {
    try {
      const uploadResult: any = await uploadToCloudinary(
        req.file.buffer,
        'profile_pictures',
      );
      newProfilePicUrl = uploadResult.secure_url;
    } catch (error) {
      return res.status(500).json({ error: 'Profile picture upload failed' });
    }
  }

  try {
    const newPasswordHash =
      validatedData.newPassword &&
      (await bcrypt.hash(validatedData.newPassword, 10));

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        email: validatedData.email ?? existingUser.email,
        phone: validatedData.phone ?? existingUser.phone,
        hashedPassword: newPasswordHash ?? existingUser.hashedPassword,
        profilePicture: newProfilePicUrl ?? existingUser.profilePicture,
      },
      select: safeUserSelect,
    });
    const token = jwt.sign(
      {
        userId: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '30d' },
    );

    res.json({ token, updatedUser });
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

// Logout a user
export const logoutUser: RequestHandler = () => {};
