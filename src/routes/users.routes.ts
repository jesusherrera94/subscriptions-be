import { Router, Request, Response, NextFunction } from 'express';
import { createUser, getUserById } from '../controllers/user.controller';

const router = Router();

const asyncHandler = (fn: any) => (req: Request, res: Response, next: NextFunction) =>
  Promise.resolve(fn(req, res, next)).catch(next);

router.post('/users', asyncHandler(createUser));
router.get('/users/:uid', asyncHandler(getUserById));

export default router;