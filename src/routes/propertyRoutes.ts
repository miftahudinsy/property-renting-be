import { Router } from "express";
import {
  searchProperties,
  getPropertyDetailById,
} from "../controllers/propertyController";

const router = Router();

router.get("/search", searchProperties);
router.get("/detail", getPropertyDetailById);

export default router;
