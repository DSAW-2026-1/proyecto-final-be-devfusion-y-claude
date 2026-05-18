const router = require("express").Router();
const { obtenerOCrearConversacion, misConversaciones, obtenerMensajes, enviarMensaje } = require("../controllers/chatController");
const { authMiddleware } = require("../middleware/auth");

router.get("/", authMiddleware, misConversaciones);
router.get("/producto/:productoId", authMiddleware, obtenerOCrearConversacion);
router.get("/:convId/mensajes", authMiddleware, obtenerMensajes);
router.post("/:convId/mensajes", authMiddleware, enviarMensaje);

module.exports = router;
