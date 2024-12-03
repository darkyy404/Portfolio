const fs = require('fs');
const path = require('path');

// Ruta base del proyecto
const basePath = path.join(__dirname, 'EquipoFreelance');

// Estructura de carpetas
const folders = [
    'config',
    'routes',
    'views/layouts',
    'public/css',
    'public/js'
];

// Archivos básicos con contenido inicial
const files = [
    {
        path: path.join(basePath, 'app.js'),
        content: `
// Archivo principal de configuración del servidor
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

// Rutas
app.use('/trabajos', trabajosRoutes);
app.use('/miembros', miembrosRoutes);
app.use('/contacto', contactosRoutes);

// Página principal
app.get('/', (req, res) => {
    res.render('home');
});

// Iniciar el servidor
app.listen(3000, () => console.log('Servidor corriendo en el puerto 3000'));
`
    },
    {
        path: path.join(basePath, 'config', 'database.js'),
        content: `
// Configuración de la base de datos
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'equipoFreelance'
});

module.exports = pool;
`
    },
    {
        path: path.join(basePath, '.env'),
        content: `
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=equipoFreelance
`
    },
    {
        path: path.join(basePath, 'views', 'layouts', 'main.handlebars'),
        content: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{titulo}}</title>
    <link rel="stylesheet" href="/public/css/style.css">
</head>
<body>
    {{{body}}}
</body>
</html>
`
    },
    {
        path: path.join(basePath, 'views', 'home.handlebars'),
        content: `
<h1>Bienvenido al Equipo Freelance</h1>
<p>Explora los trabajos realizados y conoce a nuestro equipo.</p>
`
    }
];

// Función para crear carpetas
const createFolders = () => {
    folders.forEach(folder => {
        const folderPath = path.join(basePath, folder);
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
            console.log(`Carpeta creada: ${folderPath}`);
        } else {
            console.log(`La carpeta ya existe: ${folderPath}`);
        }
    });
};

// Función para crear archivos
const createFiles = () => {
    files.forEach(file => {
        if (!fs.existsSync(file.path)) {
            fs.writeFileSync(file.path, file.content);
            console.log(`Archivo creado: ${file.path}`);
        } else {
            console.log(`El archivo ya existe: ${file.path}`);
        }
    });
};

// Crear estructura del proyecto
const createProjectStructure = () => {
    if (!fs.existsSync(basePath)) {
        fs.mkdirSync(basePath);
        console.log(`Directorio base creado: ${basePath}`);
    }
    createFolders();
    createFiles();
};

createProjectStructure();
