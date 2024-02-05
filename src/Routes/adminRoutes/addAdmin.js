const router = require('express').Router();
const Admin = require('../../Models/admin');
const bcrypt = require('bcrypt');
const verifyAdminToken = require('../../Middleware/verifyAdminToken');

/**
 * @swagger
 * tags:
 *   name: Administrador
 *   description: Endpoints para administradores
 */

/**
 * @swagger
 * /admin/addAdmin:
 *   post:
 *     summary: Añade un nuevo administrador.
 *     tags: [Administrador]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombreCompleto:
 *                 type: string
 *                 description: Nombre completo del administrador.
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Dirección de correo electrónico del administrador.
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Contraseña del administrador.
 *             example:
 *               nombreCompleto: Administrador Nuevo
 *               email: adminnuevo@example.com
 *               password: password123
 *     responses:
 *       200:
 *         description: Administrador añadido exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Administrador añadido exitosamente."
 *                 data:
 *                   type: object
 *                   properties:
 *                     adminId:
 *                       type: string
 *                       example: "6123456789abcdef12345678"
 *       400:
 *         description: Solicitud incorrecta, ya sea por datos faltantes o administrador existente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 400
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Ya existe un administrador con ese correo electrónico."
 *                 data:
 *                   type: object
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 500
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Error del servidor al agregar un administrador."
 *                 data:
 *                   type: object
 */

router.post('/', verifyAdminToken, async (req, res) => {
    const { nombreCompleto, email, password } = req.body;

    try {
        if (!nombreCompleto || !email || !password ) {
            return res.status(400).json({
                code: 400,
                status: 'error',
                message: 'Por favor, ingrese todos los campos requeridos.',
                data: {}
            });
        }

        const adminExistente = await Admin.findOne({ email });
        if (adminExistente) {
            return res.status(400).json({
                code: 400,
                status: 'error',
                message: 'Ya existe un administrador con ese correo electrónico.',
                data: {}
            });
        }

        const nuevoAdmin = new Admin({
            nombreCompleto,
            email,
            password
        });

        const salt = await bcrypt.genSalt(10);
        nuevoAdmin.password = await bcrypt.hash(password, salt);

        const savedAdmin = await nuevoAdmin.save();

        return res.status(200).json({
            code: 200,
            status: 'success',
            message: 'Administrador añadido exitosamente.',
            data: { adminId: savedAdmin._id }
        });
    } catch (error) {
        console.error('Error al agregar un administrador:', error);
        return res.status(500).json({
            code: 500,
            status: 'error',
            message: 'Error del servidor al agregar un administrador.',
            data: {}
        });
    }
});

module.exports = router;
