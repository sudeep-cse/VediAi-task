import { Router } from 'express';
import assignmentRoutes from './assignment.routes';
import paperRoutes from './paper.routes';

const router = Router();

router.get('/health', (_req, res) => res.json({ ok: true, ts: Date.now() }));
router.use('/assignments', assignmentRoutes);
router.use('/papers', paperRoutes);

export default router;
