const jwt = require('jsonwebtoken');
const SHA256 = require('crypto-js/sha256');
const Usuario = require('../models/usuario');
const Auto = require('../models/auto');
const Tarjeta = require('../models/tarjeta');
const ProveedorDeEnvio = require('../models/proveedor-de-envio');

const verificarToken = (req, res, next) => {
    const token = req.get('Authorization');
    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no valido'
                }
            });
        }
        const condiciones = {
            email: decoded.email,
            activo: true
        };
        Usuario.findOne(condiciones, (err, usuario) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            if (!usuario || (String(SHA256(usuario._id)) !== decoded._id)) {
                return res.status(401).json({
                    ok: false,
                    err: {
                        message: 'Token no valido'
                    }
                });
            }
            req.usuario = usuario;
            next();
        });
    });
}

const verificarAuto = (req, res, next) => {
    const { usuario } = req;
    const { id } = req.params;
    Auto.findById(id, (err, autoDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        if (!autoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'No se encontró ningún auto con el id especificado'
                }
            });
        }
        if (!autoDB.usuario.equals(usuario._id)) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'El auto especificado no le pertenece al usuario que realiza la petición'
                }
            });
        }
        req.auto = autoDB;
        next();
    });
}

const verificarImagen = (req, res, next) => {
    if (!req.files) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'No se ha seleccionado ninguna imagen'
            }
        });
    }
    const { imagen } = req.files;
    const formatosValidos = ['png', 'gif', 'jpg', 'jpeg'];
    let nombreImagen = imagen.name;
    nombreImagen = nombreImagen.split('.');
    const formatoImagen = nombreImagen[nombreImagen.length - 1];
    if (formatosValidos.indexOf(formatoImagen) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Los formatos para imagen permitidos son ' + formatosValidos.join(', ')
            }
        });
    }
    req.formatoImagen = formatoImagen;
    next();
}

const verificarRol = (req, res, next) => {
    if (!req.usuario.isAdmin) {
        return res.status(401).json({
            ok: false,
            err: {
                message: 'El usuario tiene permiso para realizar esta acción'
            }
        });
    }
    next();
}

const verificarAutoDisponible = (req, res, next) => {
    Auto.findOne({ _id: req.body.auto, autoVendido: false }, (err, autoDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        if (!autoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El auto especificado no se encuentra disponible para vender'
                }
            });
        }
        req.auto = autoDB;
        next();
    });
}

const verificarTarjeta = (req, res, next) => {
    Tarjeta.findOne({ _id: req.body.tarjeta, usuario: req.usuario._id }, (err, tarjetaDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        if (!tarjetaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'La tarjeta especificada no esta asociada con el usuario'
                }
            });
        }
        next();
    });
}

const verificarProveedor = (req, res, next) => {
    if (req.body.proveedorDeEnvio) {
        ProveedorDeEnvio.findById(req.body.proveedorDeEnvio, (err, proveedorDeEnvio) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            if (!proveedorDeEnvio) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'El proveedor especificado no existe'
                    }
                });
            }
            req.proveedorDeEnvio = proveedorDeEnvio;
            next();
        });
    } else {
        next();
    }
}

module.exports = {
    verificarToken,
    verificarAuto,
    verificarImagen,
    verificarRol,
    verificarAutoDisponible,
    verificarTarjeta,
    verificarProveedor
}