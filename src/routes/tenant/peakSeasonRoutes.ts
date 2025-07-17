import { Router } from "express";
import {
  getPeakSeasonRatesHandler,
  createPeakSeasonRateHandler,
  updatePeakSeasonRateHandler,
  deletePeakSeasonRateHandler,
} from "../../controllers/peakSeasonController";
import {
  authenticateUser,
  requireTenantRole,
} from "../../middleware/authMiddleware";

const router = Router();

router.use(authenticateUser, requireTenantRole);

router.get("/", getPeakSeasonRatesHandler);
router.post("/", createPeakSeasonRateHandler);
router.put("/:id", updatePeakSeasonRateHandler);
router.delete("/:id", deletePeakSeasonRateHandler);

export default router;
