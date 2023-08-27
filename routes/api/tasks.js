const express = require("express");
const router = express.Router();
const ctrl = require("../../controllers/controllersTask");
const { schemas } = require("../../models/task");

const { validateBody, isValidId, authenticate } = require("../../middlewares");

router.get("/", authenticate, ctrl.getAll);

router.post("/", authenticate, validateBody(schemas.addTaskSchema), ctrl.add);

router.delete("/:id", authenticate, isValidId, ctrl.deleteTask);

router.patch("/:id", authenticate, isValidId, ctrl.update);

module.exports = router;
