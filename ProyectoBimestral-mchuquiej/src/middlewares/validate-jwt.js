'use strict'

import jwt from 'jsonwebtoken'
import User from '../user/user.model.js'

export const validateJwt = async(req, res, next)=>{
    try{
        //Obtener la llave de acceso al token
        let secretKey = process.env.SECRET_KEY
        //Obtener el token de los headers
        let { token } = req.headers
        //Verificar si viene el token
        if(!token) return res.status(401).send({message: 'Sin autorización'})
        //obtener el uid que envió el token
        let { uid } = jwt.verify(token, secretKey)
        //Validar si el usuario aún existe en la BD
        let user = await User.findOne({_id: uid})
        if(!user) return res.status(404).send({message: 'Usuario no encontrado - No autorizado'})
        //Ok del Middleware
        req.user = user
        next()
    }catch(err){
        console.error(err)
        return res.status(401).send({message: 'Token no válido o vencido'})
    }
}

export const isAdmin = async(req, res, next)=>{
    try{
        let { role, username } = req.user
        if(!role || role !== 'ADMIN') return res.status(403).send({message: `Sin acceso | username ${username}`})
        next()
    }catch(err){
        console.error(err)
        return res.status(401).send({message: 'Rol no autorizado'})
    }
}