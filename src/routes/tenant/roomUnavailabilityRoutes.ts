import { Router } from "express";
import {
  getUnavailabilitiesHandler,
  listRoomUnavailabilitiesHandler,
  createUnavailabilityHandler,
  deleteUnavailabilityHandler,
} from "../../controllers/roomUnavailabilityController";
import {
  authenticateUser,
  requireTenantRole,
} from "../../middleware/authMiddleware";

const router = Router();

router.use(authenticateUser, requireTenantRole);

router.get("/", getUnavailabilitiesHandler);
router.get("/list", listRoomUnavailabilitiesHandler);
router.post("/", createUnavailabilityHandler);
router.delete("/:id", deleteUnavailabilityHandler);

export default router;
