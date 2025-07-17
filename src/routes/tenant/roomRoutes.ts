import { Router } from "express";
import {
  createNewRoom,
  getOwnedRoomsList,
  getRoomForEditForm,
  updateRoomById,
  deleteRoomById,
} from "../../controllers/tenant/roomController";
import {
  authenticateUser,
  requireTenantRole,
} from "../../middleware/authMiddleware";

const router = Router();

router.use(authenticateUser, requireTenantRole);

router.post("/", createNewRoom);
router.get("/", getOwnedRoomsList);
router.get("/:room_id/edit", getRoomForEditForm);
router.put("/:room_id", updateRoomById);
router.delete("/:room_id", deleteRoomById);

export default router;
