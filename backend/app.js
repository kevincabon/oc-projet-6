const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');

const saucesRoutes = require('./routes/sauces');
const userRoutes = require('./routes/user');

mongoose.connect('mongodb+srv://so_pekocko_admin:rzWDfxNGxBFRdx7Y7PkcRvekskkTKa_6YAQbHN8aRjJ.x2U2K8UE-rWX8dx@cluster0-a7mgy.mongodb.net/projet6?retryWrites=true&w=majority', 
    {   useNewUrlParser: true,
        useUnifieldTopology: true})
        .then(() => console.log('Connection à MongoDB réussie !'))
        .catch(() => console.log('Connection à MongoDB échouée !'));

const app = express();

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use(bodyParser.json());

app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/api/sauces', saucesRoutes);
app.use('/api/auth', userRoutes);

module.exports = app;