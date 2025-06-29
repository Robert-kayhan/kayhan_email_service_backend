import express from "express";
import {
  createTemplate,
  getAllTemplates,
  getTemplateById,
  deleteTemplate,
  updateTemplate,
} from "../controllers/template.controller";
const router = express.Router();

router.route("/").post(createTemplate).get(getAllTemplates);

router
  .route("/:id")
  .get(getTemplateById)
  .put(updateTemplate)
  .delete(deleteTemplate);

export default router;
