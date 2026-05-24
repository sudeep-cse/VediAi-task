import { Router } from 'express';
import {
  getPaper,
  getPaperStatus,
  regeneratePaper,
  downloadPaperPdf,
} from '../controllers/paper.controller';
import { asyncHandler } from '../middleware';

const router = Router();

router.get('/:id', asyncHandler(getPaper));
router.get('/:id/status', asyncHandler(getPaperStatus));
router.post('/:id/regenerate', asyncHandler(regeneratePaper));
router.get('/:id/pdf', asyncHandler(downloadPaperPdf));

export default router;
