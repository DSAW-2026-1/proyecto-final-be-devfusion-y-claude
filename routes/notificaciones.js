const router = require("express").Router();
const { misNotificaciones, marcarLeida, marcarTodasLeidas, contarNoLeidas } = require("../controllers/notificacionController");
const { authMiddleware } = require("../middleware/auth");

router.get("/", authMiddleware, misNotificaciones);
router.get("/count", authMiddleware, contarNoLeidas);
router.put("/todas-leidas", authMiddleware, marcarTodasLeidas);
router.put("/:id/leer", authMiddleware, marcarLeida);

module.exports = router;
