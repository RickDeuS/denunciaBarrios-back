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
 *               palabraSecreta:
 *                 type: string
 *                 description: Palabra secreta del administrador que solicita el registro.
 *             example:
 *               nombreCompleto: Administrador Nuevo
 *               email: adminnuevo@example.com
 *               password: password123
 *               palabraSecreta: miPalabraSecreta
 *     responses:
 *       200:
 *         description: Administrador añadido exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Administrador añadido exitosamente.
 *       400:
 *         description: Ya existe un administrador con ese correo electrónico o los datos son inválidos.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Ya existe un administrador con ese correo electrónico.
 *       403:
 *         description: Palabra secreta incorrecta o acceso no autorizado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Palabra secreta incorrecta o acceso no autorizado.
 *       500:
 *         description: Error del servidor al agregar un administrador.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Error del servidor al agregar un administrador.
 */

router.post('/', async (req, res) => {
    const { nombreCompleto, email, password, palabraSecreta } = req.body;
    // const adminId = req.admin.id;
    try {

        if (!nombreCompleto || !email || !password || !palabraSecreta) {
            return res.status(400).json({ error: 'Por favor, ingrese todos los campos.' });
        }
        
        const adminExistente = await Admin.findOne({ email });
        if (adminExistente) {
            return res.status(400).json({ error: 'Ya existe un administrador con ese correo electrónico.' });
        }

        const nuevoAdmin = new Admin({
            nombreCompleto,
            email,
            password,
            palabraSecreta,
        });

        const salt = await bcrypt.genSalt(10);
        nuevoAdmin.password = await bcrypt.hash(password, salt);

        await nuevoAdmin.save();

        return res.json({ message: 'Administrador añadido exitosamente.' });
    } catch (error) {
        console.error('Error al agregar un administrador:', error);
        return res.status(500).json({ error: 'Error del servidor al agregar un administrador.' });
    }
});

module.exports = router;