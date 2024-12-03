const express = require('express');
const pool = require('../config/database');

const router = express.Router();

// Obtener todos los trabajos
router.get('/', async (req, res) => {
    try {
        const [trabajos] = await pool.query('SELECT * FROM Trabajos');
        res.render('trabajos', { titulo: 'Trabajos Realizados', trabajos });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al obtener los trabajos');
    }
});

// Agregar un nuevo trabajo
router.post('/', async (req, res) => {
    const { titulo, descripcion, empresa, tecnologias } = req.body;
    try {
        // Insertar el trabajo
        const [result] = await pool.query(
            'INSERT INTO Trabajos (titulo, descripcion, empresa) VALUES (?, ?, ?)',
            [titulo, descripcion, empresa]
        );
        const trabajoId = result.insertId;

        // Asociar tecnologías con el trabajo
        for (const tech of tecnologias) {
            const [tecnologia] = await pool.query('SELECT id FROM Tecnologias WHERE nombre = ?', [tech.nombre]);
            const tecnologiaId = tecnologia.length ? tecnologia[0].id : (await pool.query('INSERT INTO Tecnologias (nombre) VALUES (?)', [tech.nombre]))[0].insertId;

            await pool.query('INSERT INTO TrabajosTecnologias (trabajo_id, tecnologia_id) VALUES (?, ?)', [
                trabajoId,
                tecnologiaId
            ]);
        }

        res.redirect('/trabajos');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al agregar el trabajo');
    }
});

module.exports = router;
