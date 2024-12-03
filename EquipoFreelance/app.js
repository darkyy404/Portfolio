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
app.get('/', (req, res) => {
    res.render('home', { titulo: 'Inicio - Equipo Freelance' });
});

// Iniciar el servidor
app.listen(3000, () => console.log('Servidor corriendo en el puerto 3000'));
