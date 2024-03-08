'use strict'

import productoModel from '../productos/productos.model.js'
import facturalModel from '../facturas/facturas.model.js'
import { generarJwt } from '../utils/jwt.js'
import { encriptar, verificarActualizacion, verificarContraseña } from '../utils/validator.js'
import userModel from './user.model.js'
import moment from 'moment';

export const agregarUsuario = async (req, res) => {
    try {
        let datos = req.body
        datos.contraseña = await encriptar(datos.contraseña)
        datos.rol = 'CLIENTE'
        let user = new userModel(datos)
        await user.save()
        return res.send({ message: `${user.rol} , ${user.nombre} registrado exitosamente. ` })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'No se pudo agregar al usuario.' })
    }
}


export const loginUsuario = async (req, res) => {
    try {
        let { email, usuario, contraseña } = req.body
        let user = await userModel.findOne({
            $or: [
                { usuario: usuario },
                { email: email }
            ]
        })
        let facturas = await facturalModel.find({ usuario: user.id, estado: false })
        let totalFactura = 0
        let facturasPorFecha = {}
        for (let factura of facturas) {
            let producto = await productoModel.findOne({ _id: factura.producto })
            let totalPorProducto = factura.cantidadProducto * producto.precio
            // OBTENEMOS LA FECHA.
            const fechaFactura = moment(factura.fecha, 'DD/MM/YYYY, HH:mm:ss')
            const fechaFormateada = fechaFactura.format('DD-MM-YYYY')
            // ORGANIZAMOS LAS FACTURAS POR FECHAS.
            if (!facturasPorFecha[fechaFormateada]) {
                facturasPorFecha[fechaFormateada] = {
                    detalles: [],
                    total: 0
                }
            }
            facturasPorFecha[fechaFormateada].detalles.push({
                nombreProducto: producto.nombreProducto,
                cantidad: factura.cantidadProducto,
                precio: producto.precio,
                subtotal: totalPorProducto.toFixed(2)
            })
            facturasPorFecha[fechaFormateada].total += totalPorProducto;
            totalFactura += totalPorProducto;
        }
        if (user && await verificarContraseña(contraseña, user.contraseña)) {
            let usuarioLogeado = {
                uid: user._id,
                usuario: user.usuario,
                nombre: user.nombre,
                rol: user.rol,
            }
            let token = await generarJwt(usuarioLogeado)
            return res.send({
                message: `Hola, Bienvenido ${user.nombre} `,
                usuarioLogeado,
                token,
                facturasPorFecha
            })
        }
        return res.status(404).send({ message: 'La contraseña o usuario es incorrecto.' })
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error al iniciar sesion. Intentelo de nuevo.' })
    }
}



export const actulizarUsuario = async (req, res) => {
    try {
        let { rol, id } = req.user
        let { uid } = req.params
        let datos = req.body
        if (rol === 'ADMIN') {
            let actualizarDatos = await userModel.findOneAndUpdate(
                { _id: uid },
                datos,
                { new: true }
            )
            if (!actualizarDatos) return res.status(401).send({ message: 'El usurio no se pudo actualizar.' })
            return res.send({ message: 'Usuario actualizado.', actualizarDatos })
        }
        if (rol === 'CLIENTE') {
            if (id === uid) {

                let actualizar = verificarActualizacion(datos, id)
                if (!actualizar) return res.status(400).send({ message: 'Algunos datos no se pueden acutalizar.' })
                let actualizarDatos = await userModel.findOneAndUpdate(
                    { _id: uid },
                    datos,
                    { new: true }
                )
                if (!actualizarDatos) return res.status(401).send({ message: 'El usuario no se pudo actualizar.' })
                return res.send({ message: 'Usuario Actualizado', actualizarDatos })
            } else {
                return res.status(400).send({ message: 'ADVERTENCIA!! No tiene permiso de actualizar.' })
            }

        }


    } catch (err) {
        console.error(err)
        if (err.keyValue.usuario) return res.status(400).send({ message: `El usuario ${err.keyValue.usuario} ya existe. ` })
        return res.status(500).send({ message: 'Error al actualizar usuario' })

    }
}

export const eliminarUsuario = async (req, res) => {
    try {
        let { rol, id } = req.user

        let { uid } = req.params
        console.log(id)
        console.log(uid)
        if (rol === 'ADMIN') {
            let eliminarUsuario = await userModel.findOneAndDelete({ _id: uid })
            return res.send({ message: `Se elimino el usuario ${eliminarUsuario.usuario} exitosamente` })
        }
        if (rol === 'CLIENTE') {

            if (uid === id) {
                let eliminarUsuario = await userModel.findOneAndDelete({ _id: uid })
                return res.send({ message: `Se elimino el usuario ${eliminarUsuario.usuario} exitosamente` })
            } else {
                return res.status(400).send({ message: 'No puedes eliminar una cuenta que no es tuya' })
            }
        }

    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error al eliminarlo ' })

    }

}

export const DefectoAdmin = async () => {
    try {
        let buscarUser = await userModel.findOne({ usuario: 'Jnoj' })
        if (!buscarUser) {
            let datos = {
                nombre: 'Maldony',
                apellido: 'Chuquiej',
                email: 'mchuquiej@kinal.edu.gt',
                usuario: 'mchuquiej',
                contraseña: await encriptar('32047174'),
                telefono: '32471587',
                rol: 'ADMIN'
            }
            let user = new userModel(datos)
            await user.save()
            return console.log('Se agrego el usuario mchuquiej.')
        }
        return console.log('El usuario mchuquiej ya existe.')
    } catch (err) {
    }
}