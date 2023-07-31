const router = require('express').Router();
const Admin = require('../../Models/admin');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/**
 * @swagger
 * tags:
 *   name: Administrador
 *   description: Endpoints para administradores
 */

/**
 * @swagger
 * /admin/login:
 *   post:
 *     summary: Inicia sesión como administrador.
 *     tags: [Administrador]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Dirección de correo electrónico del administrador.
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Contraseña del administrador.
 *             example:
 *               email: admin@example.com
 *               password: password123
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso. Se proporciona el token de autenticación.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Token de autenticación del administrador.
 *       401:
 *         description: Credenciales inválidas.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Credenciales inválidas.
 *       500:
 *         description: Error del servidor al autenticar al administrador.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Error del servidor al autenticar al administrador.
 */

router.post('/', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Buscar al administrador por correo electrónico en la base de datos
        const admin = await Admin.findOne({ email });

        // Si no se encuentra el administrador, es inválido o no existe
        if (!admin) {
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        // Comprobar que la contraseña proporcionada coincide con la almacenada en la base de datos
        const isPasswordValid = await bcrypt.compare(password, admin.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        // Generar un token de autenticación
        const token = jwt.sign({ adminId: admin._id }, 'secreto', { expiresIn: '1h' });

        return res.json({ token });
    } catch (error) {
        console.error('Error al autenticar al administrador:', error);
        return res.status(500).json({ error: 'Error del servidor al autenticar al administrador.' });
    }
});

module.exports = router;

