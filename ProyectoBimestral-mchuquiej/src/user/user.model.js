import mongoose from 'mongoose'

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    surname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    username: {
        type: String,
        unique: true, //Solo un único registro puede existir
        lowercase: true,
        required: true
    },
    password: {
        type: String,
        minLength: [8, 'La contraseña debe tener 8 caracteres'],
        required: true
    },
    phone: {
        type: String,
        minLength: 8,
        maxLength: 8,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    role: {
        type: String,
        uppercase: true,
        enum: ['ADMIN', 'CLIENT'], //Solo los datos que estén en el arreglo son válido
        required: true
    }
})

export default mongoose.model('user', userSchema)