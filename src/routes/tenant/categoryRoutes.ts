import { Router } from "express";
import {
  getPropertyCategoriesByTenant,
  createNewCategory,
  updateCategoryById,
  deleteCategoryById,
} from "../../controllers/tenant/propertyController";
import {
  authenticateUser,
  requireTenantRole,
} from "../../middleware/authMiddleware";

const router = Router();

router.get("/", getPropertyCategoriesByTenant);

router.use(authenticateUser, requireTenantRole);

router.post("/", createNewCategory);
router.put("/:category_id", updateCategoryById);
router.delete("/:category_id", deleteCategoryById);

export default router;
