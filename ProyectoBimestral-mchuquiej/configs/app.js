import Express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { config } from 'dotenv'


const app = Express()
config()
const port = process.env.PORT || 3200

app.use(Express.urlencoded({extended: false}))
app.use(Express.json())
app.use(cors())
app.use(helmet())
app.use(morgan('dev'))



export const initServer = () => {
    app.listen(port)
    console.log(`HTTP esta en el puerto ${port}`)
}

