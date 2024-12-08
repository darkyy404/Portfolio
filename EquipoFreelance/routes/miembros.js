const express = require('express');
const pool = require('../config/database');

const router = express.Router();

// Obtener todos los miembros con sus tecnologías, idiomas y redes sociales
router.get('/', async (req, res) => {
    try {
        const [miembros] = await pool.query('SELECT * FROM MiembrosEquipo');

        for (const miembro of miembros) {
            try {
                // Obtener tecnologías del miembro
                const [tecnologias] = await pool.query(
                    `SELECT t.nombre, mt.nivel 
                     FROM Tecnologias t 
                     JOIN MiembrosTecnologias mt ON t.id = mt.tecnologia_id 
                     WHERE mt.miembro_id = ?`,
                    [miembro.id]
                );
                miembro.tecnologias = tecnologias;

                // Obtener idiomas del miembro
                const [idiomas] = await pool.query(
                    `SELECT i.nombre, mi.nivel 
                     FROM Idiomas i 
                     JOIN MiembrosIdiomas mi ON i.id = mi.idioma_id 
                     WHERE mi.miembro_id = ?`,
                    [miembro.id]
                );
                miembro.idiomas = idiomas;

                // Obtener redes sociales del miembro
                const [redesSociales] = await pool.query(
                    `SELECT nombre, url, icono 
                     FROM redes_sociales 
                     WHERE miembro_id = ?`,
                    [miembro.id]
                );
                miembro.redesSociales = redesSociales;
            } catch (err) {
                console.error(`Error al obtener detalles del miembro con ID ${miembro.id}:`, err.message);
                miembro.tecnologias = [];
                miembro.idiomas = [];
                miembro.redesSociales = [];
            }
        }

        res.render('miembros', { titulo: 'Miembros del Equipo', miembros });
    } catch (err) {
        console.error('Error al obtener los miembros:', err.message);
        res.status(500).send('Error al obtener los miembros');
    }
});

// Agregar un nuevo miembro con tecnologías, idiomas y redes sociales
router.post('/', async (req, res) => {
    const { nombre, apellidos, titulacion, proyectos_personales, tecnologias, idiomas, redesSociales } = req.body;

    try {
        // Insertar el nuevo miembro en la tabla MiembrosEquipo
        const [result] = await pool.query(
            'INSERT INTO MiembrosEquipo (nombre, apellidos, titulacion, proyectos_personales) VALUES (?, ?, ?, ?)',
            [nombre, apellidos, titulacion, proyectos_personales]
        );
        const miembroId = result.insertId;

        // Insertar las tecnologías relacionadas
        if (tecnologias && tecnologias.length > 0) {
            for (const tech of tecnologias) {
                const [tecnologia] = await pool.query('SELECT id FROM Tecnologias WHERE nombre = ?', [tech.nombre]);
                const tecnologiaId = tecnologia.length
                    ? tecnologia[0].id
                    : (await pool.query('INSERT INTO Tecnologias (nombre) VALUES (?)', [tech.nombre]))[0].insertId;
                await pool.query(
                    'INSERT INTO MiembrosTecnologias (miembro_id, tecnologia_id, nivel) VALUES (?, ?, ?)',
                    [miembroId, tecnologiaId, tech.nivel]
                );
            }
        }

        // Insertar los idiomas relacionados
        if (idiomas && idiomas.length > 0) {
            for (const lang of idiomas) {
                const [idioma] = await pool.query('SELECT id FROM Idiomas WHERE nombre = ?', [lang.nombre]);
                const idiomaId = idioma.length
                    ? idioma[0].id
                    : (await pool.query('INSERT INTO Idiomas (nombre) VALUES (?)', [lang.nombre]))[0].insertId;
                await pool.query(
                    'INSERT INTO MiembrosIdiomas (miembro_id, idioma_id, nivel) VALUES (?, ?, ?)',
                    [miembroId, idiomaId, lang.nivel]
                );
            }
        }

        // Insertar las redes sociales relacionadas
        if (redesSociales && redesSociales.length > 0) {
            for (const red of redesSociales) {
                await pool.query(
                    'INSERT INTO redes_sociales (miembro_id, nombre, url, icono) VALUES (?, ?, ?, ?)',
                    [miembroId, red.nombre, red.url, red.icono]
                );
            }
        }

        res.redirect('/miembros');
    } catch (err) {
        console.error('Error al agregar el miembro:', err.message);
        res.status(500).send('Error al agregar el miembro');
    }
});

module.exports = router;
