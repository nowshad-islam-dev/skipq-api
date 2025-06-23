import express from 'express';

const router = express.Router();
import {
  getAllUsers,
  getOneUser,
  createUser,
  loginUser,
} from '../controllers/user.controller';

router.get('/all', getAllUsers);

router.get('/:id', getOneUser);

router.post('/', createUser);

router.post('/login', loginUser);

export default router;
