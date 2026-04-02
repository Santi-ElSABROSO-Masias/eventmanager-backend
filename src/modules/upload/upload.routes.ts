import { Router } from 'express';
import multer from 'multer';
import { UploadController } from './upload.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/roles.middleware';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB máximo para PDFs
});

const router = Router();
const controller = new UploadController();

// POST /api/upload/pdf
router.post(
  '/pdf', 
  authenticate, 
  authorize('super_super_admin', 'admin_contratista'), 
  upload.single('file'), 
  (req, res) => controller.uploadPdf(req, res)
);

export default router;
