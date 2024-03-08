'use strict'
import { Router } from "express"
import { actulizarUsuario, agregarUsuario, eliminarUsuario, loginUsuario } from "../user/user.controller.js"
import { validateJwt } from "../middlewares/validate-jwt.js"

const api = Router()

api.post('/agregarUsuario', agregarUsuario)
api.post('/loginUsuario', loginUsuario)
api.put('/actulizarUsuario/:uid', [validateJwt], actulizarUsuario)
api.delete('/eliminarUsuario/:uid', [validateJwt], eliminarUsuario)


export default api