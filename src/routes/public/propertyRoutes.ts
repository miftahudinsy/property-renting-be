import { Router } from "express";
import {
  searchProperties,
  getPropertyDetailById,
  getPropertyCalendar,
} from "../../controllers/public/propertyController";

const router = Router();

router.get("/search", searchProperties);
router.get("/detail", getPropertyDetailById);
router.get("/:propertyId/calendar", getPropertyCalendar);

export default router;
