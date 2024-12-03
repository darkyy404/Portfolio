const express = require('express');
const pool = require('../config/database');

const router = express.Router();

// Obtener todos los miembros con sus tecnologías e idiomas
router.get('/', async (req, res) => {
    try {
        const [miembros] = await pool.query('SELECT * FROM MiembrosEquipo');
        for (const miembro of miembros) {
            const [tecnologias] = await pool.query(
                `SELECT t.nombre, mt.nivel 
                 FROM Tecnologias t 
                 JOIN MiembrosTecnologias mt ON t.id = mt.tecnologia_id 
                 WHERE mt.miembro_id = ?`,
                [miembro.id]
            );
            miembro.tecnologias = tecnologias;

            const [idiomas] = await pool.query(
                `SELECT i.nombre, mi.nivel 
                 FROM Idiomas i 
                 JOIN MiembrosIdiomas mi ON i.id = mi.idioma_id 
                 WHERE mi.miembro_id = ?`,
                [miembro.id]
            );
            miembro.idiomas = idiomas;
        }
        res.render('miembros', { titulo: 'Miembros del Equipo', miembros });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al obtener los miembros');
    }
});

// Agregar un nuevo miembro
router.post('/', async (req, res) => {
    const { nombre, apellidos, titulacion, proyectos_personales, tecnologias, idiomas } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO MiembrosEquipo (nombre, apellidos, titulacion, proyectos_personales) VALUES (?, ?, ?, ?)',
            [nombre, apellidos, titulacion, proyectos_personales]
        );
        const miembroId = result.insertId;

        for (const tech of tecnologias) {
            const [tecnologia] = await pool.query('SELECT id FROM Tecnologias WHERE nombre = ?', [tech.nombre]);
            const tecnologiaId = tecnologia.length ? tecnologia[0].id : (await pool.query('INSERT INTO Tecnologias (nombre) VALUES (?)', [tech.nombre]))[0].insertId;
            await pool.query('INSERT INTO MiembrosTecnologias (miembro_id, tecnologia_id, nivel) VALUES (?, ?, ?)', [
                miembroId,
                tecnologiaId,
                tech.nivel
            ]);
        }

        for (const lang of idiomas) {
            const [idioma] = await pool.query('SELECT id FROM Idiomas WHERE nombre = ?', [lang.nombre]);
            const idiomaId = idioma.length ? idioma[0].id : (await pool.query('INSERT INTO Idiomas (nombre) VALUES (?)', [lang.nombre]))[0].insertId;
            await pool.query('INSERT INTO MiembrosIdiomas (miembro_id, idioma_id, nivel) VALUES (?, ?, ?)', [
                miembroId,
                idiomaId,
                lang.nivel
            ]);
        }

        res.redirect('/miembros');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al agregar el miembro');
    }
});

module.exports = router;
