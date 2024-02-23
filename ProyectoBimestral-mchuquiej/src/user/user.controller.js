'user strict'

import User from './user.model.js'
import { encrypt, checkPassword, checkUpdate } from '../utils/validator.js'
import { generateJwt } from '../utils/jwt.js'

//REGISTRAR USUARIO 
export const register = async (req, res) => {
    try {
        let data = req.body
        data.password = await encrypt(data.password)
        data.role = 'CLIENT'
        let user = new User(data)
        await user.save()
        return res.send({ message: 'Usuario registrado correctamente' })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error al registrar usuario', err })
    }
}


//LOGUEAR USUARIO
export const login = async (req, res) => {
    try {
        //Informacion(body)
        let { username, password } = req.body
        //Validamos si el usuario existe
        let user = await User.findOne({ username })
        //Vemos si la contrasena es igual 
        if (user && await checkPassword(password, user.password)) {
            let loggedUser = {
                uid: user._id,
                username: user.username,
                name: user.name,
                role: user.role
            }
            let token = await generateJwt(loggedUser)
            //Damos acceso 
            return res.send(
                {
                    message: `Bienvenido ${user.name}`,
                    loggedUser,
                    token
                }
            )
        }
        return res.status(404).send({ message: 'Credenciales no válidas' })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error al iniciar sesión' })
    }
}


//ACTUALIZAR USUARIO
export const update = async (req, res) => {
    try {
        //ID del usuario que vamos a actualizar
        let { id } = req.params
        //Datos que vamos a actualizar
        let data = req.body
        //Validar si trae los datos para actualizar
        let update = checkUpdate(data, id)
        if (!update) return res.status(400).send({ message: 'Algunos datos no se pueden actualizar o faltan datos' })
        //Actualizar en la Base de Datos
        let updatedUser = await User.findOneUpdate(
            { _id: id }, data, { new: true }
        )
        //Validar si se actualizó
        if (!updatedUser) return res.status(401).send({ message: 'Usuario no encontrado' })
        //Respondemos con el dato actualizado
        return res.send({ message: 'Usuario Actualizado', updatedUser })
    } catch (err) {
        console.error(err)
        if(err.keyValue.username) return res.status(400).send({message: `El nombre de usuario ${err.keyValue.username} ya existe`})
        return res.status(500).send({message: 'Error al actualizar la cuenta'})
    }
}

//ELIMINAR USUARIO
export const deleteU = async(req, res)=>{
    try{
        //Obtener el id
        let { id } = req.params
        //Eliminar (deleteOne (Solo elimina y no devuelve el documento) / findOneAndDelete (Devuelve el documento eliminado))
        let deletedUser = await User.findOneAndDelete({_id: id})
        //Verificar que se eliminó
        if(!deletedUser) return res.status(404).send({message: 'Cuenta no encontrada'})
        //Responder
        return res.send({message: `Cuenta con nombre de usuario ${deletedUser.username} eliminado con éxito`})
    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error al eliminar la cuenta'})
    }
}
