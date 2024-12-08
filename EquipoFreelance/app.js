const express = require('express');
const { engine } = require('express-handlebars');
const pool = require('./config/database');

const trabajosRoutes = require('./routes/trabajos');
const miembrosRoutes = require('./routes/miembros');
const contactosRoutes = require('./routes/contactos');

const app = express();

// Configuración de Handlebars
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Archivos estáticos
app.use('/public', express.static('public'));

// Rutas
app.use('/trabajos', trabajosRoutes);
app.use('/miembros', miembrosRoutes);
app.use('/contacto', contactosRoutes);

// Página principal
app.get('/', async (req, res) => {
    try {
        // Consultar los miembros del equipo
        const [miembros] = await pool.query('SELECT * FROM MiembrosEquipo');

        // Agregar detalles adicionales a cada miembro (tecnologías e idiomas)
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

        // Consultar los trabajos realizados
        const [trabajos] = await pool.query('SELECT * FROM Trabajos');

        // Renderizar la página con los datos obtenidos
        res.render('home', { titulo: 'Inicio - Equipo Freelance', miembros, trabajos });
    } catch (err) {
        console.error('Error al cargar la página principal:', err);
        res.status(500).send('Error al cargar la página principal');
    }
});


// Iniciar el servidor
app.listen(3000, () => console.log('Servidor corriendo en el puerto 3000'));
