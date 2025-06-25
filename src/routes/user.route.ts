import express from 'express';

const router = express.Router();
import {
  getAllUsers,
  getOneUser,
  createUser,
  loginUser,
  updateUser,
} from '../controllers/user.controller';

router.get('/all', getAllUsers);

router.post('/', createUser);

router.get('/:id', getOneUser);

router.post('/:id', updateUser);

router.post('/login', loginUser);

export default router;
