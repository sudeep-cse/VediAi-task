import { Router } from 'express';
import {
  createAssignment,
  createAssignmentSchema,
  listAssignments,
  getAssignment,
  deleteAssignment,
} from '../controllers/assignment.controller';
import { validateBody, asyncHandler } from '../middleware';

const router = Router();

router.post('/', validateBody(createAssignmentSchema), asyncHandler(createAssignment));
router.get('/', asyncHandler(listAssignments));
router.get('/:id', asyncHandler(getAssignment));
router.delete('/:id', asyncHandler(deleteAssignment));

export default router;
