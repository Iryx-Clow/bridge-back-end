const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const marcaSchema = new Schema({
    nombre: {
        type: String,
        unique: true,
        required: [true, 'El nombre de la marca es obligatorio']
    },
    pais: {
        type: String,
        required: [true, 'El país de la marca es obligatorio']
    },
    paginaWeb: {
        type: String
    },
    activo: {
        type: Boolean,
        required: [true, 'El campo activo es requerido'],
        default: true
    }
}, {
    versionKey: false
});

marcaSchema.plugin(uniqueValidator, { message: 'El {PATH} de la marca debe ser único' });

module.exports = mongoose.model('Marca', marcaSchema, 'marca');