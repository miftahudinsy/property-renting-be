import { Router } from "express";
import {
  getUserOwnedProperties,
  createNewProperty,
  getOwnedPropertyDetailById,
  getPropertyForEditForm,
  updatePropertyById,
  deletePropertyById,
} from "../../controllers/tenant/propertyController";
import {
  authenticateUser,
  requireTenantRole,
} from "../../middleware/authMiddleware";

const router = Router();

router.use(authenticateUser, requireTenantRole);

router.get("/", getUserOwnedProperties);
router.post("/", createNewProperty);
router.get("/:property_id", getOwnedPropertyDetailById);
router.get("/:property_id/edit", getPropertyForEditForm);
router.put("/:property_id", updatePropertyById);
router.delete("/:property_id", deletePropertyById);

export default router;
