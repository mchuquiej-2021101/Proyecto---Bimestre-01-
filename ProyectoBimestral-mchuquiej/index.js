import { initServer } from './configs/app.js'
import { connect } from './configs/mongo.js'
import { DefectoAdmin } from './src/user/user.controller.js'
import { agregarPorDefecto } from './src/categorias/categorias.controller.js'
initServer()
connect()
agregarPorDefecto()
DefectoAdmin()