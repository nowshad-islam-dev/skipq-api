import { RequestHandler } from 'express';
import prisma from '../prisma';
import uploadToCloudinary from '../utils/cloudinary';
import { newServiceEntry, publicServiceSchema } from '../types';

const safeServicSelect = {
  id: true,
  serviceName: true,
  serviceDescription: true,
  averageWaitingTime: true,
  serviceLocation: true,
  userId: true,
  photos: true,
  createdAt: true,
};

// Get all services
export const getAllServices: RequestHandler = async (_req, res) => {
  try {
    const services = await prisma.service.findMany({
      select: safeServicSelect,
    });

    const safeServices = services
      .map((s) => publicServiceSchema.safeParse(s))
      .filter((result) => result.success)
      .map((result) => result.data);

    res.json(safeServices);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch services' });
  }
};

// Get one service
export const getOneService: RequestHandler = async (
  req,
  res,
): Promise<void | any> => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID format' });

  const service = await prisma.service.findFirst({
    where: { id },
    select: safeServicSelect,
  });
  if (!service) return res.status(404).json({ error: 'Service not found' });

  const safeService = publicServiceSchema.parse(service);
  res.json(safeService);
  try {
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch service' });
  }
};

// Create a service
export const createService: RequestHandler = async (
  req,
  res,
): Promise<void | any> => {
  const parseResult = newServiceEntry.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.format() });
  }

  const {
    serviceName,
    serviceDescription,
    averageWaitingTime,
    serviceLocation,
    userId,
  } = parseResult.data;

  try {
    const numericUserId = Number(userId);
    if (isNaN(numericUserId)) {
      res.status(400).json({ error: 'User ID is invalid' });
    }

    console.log(numericUserId, typeof numericUserId); // Remove later

    const files = req.files as Express.Multer.File[]; // Ts guard

    // Upload all files to cloudinary
    const uploadPromises = files.map((file) =>
      uploadToCloudinary(file.buffer, 'services_pictures'),
    );

    const uploadResults = await Promise.all(uploadPromises);
    const photoUrls = uploadResults.map((result: any) => result.secure_url);

    const createdService = await prisma.service.create({
      data: {
        serviceName,
        serviceDescription,
        serviceLocation,
        averageWaitingTime,
        photos: photoUrls,
        user: { connect: { id: numericUserId } },
      },
    });

    const safeService = publicServiceSchema.parse(createdService);
    res.json(safeService);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create service' });
  }
};
