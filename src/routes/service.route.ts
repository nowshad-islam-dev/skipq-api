import express from 'express';
import { upload } from '../middlewares/multer';
import {
  createService,
  getAllServices,
  getOneService,
} from '../controllers/service.controller';

const router = express.Router();

router.get('/all', getAllServices);

router.get('/:id', getOneService);

router.post('/', upload.array('photos', 4), createService);

export default router;
