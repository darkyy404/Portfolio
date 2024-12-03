const express = require('express');
const pool = require('../config/database');

const router = express.Router();

// Obtener todos los contactos
router.get('/', async (req, res) => {
    try {
        const [contactos] = await pool.query('SELECT * FROM Contactos');
        res.render('contacto', { titulo: 'Datos de Contacto', contactos });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al obtener los contactos');
    }
});

// Agregar un nuevo contacto
router.post('/', async (req, res) => {
    const { email, telefono, redes_sociales } = req.body;
    try {
        await pool.query(
            'INSERT INTO Contactos (email, telefono, redes_sociales) VALUES (?, ?, ?)',
            [email, telefono, redes_sociales]
        );
        res.redirect('/contacto');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al agregar el contacto');
    }
});

module.exports = router;
