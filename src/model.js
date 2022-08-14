import mongoose from 'mongoose';

const Paciente = mongoose.model('Paciente', new mongoose.Schema({
    dni:            String,
    apellidos:      String,
    nombre:         String,
    departamento:   String,
    provincia:      String,
    distrito:       String,
    direccion:      String,
    telefono:       String,
    fechaNacimiento:String,
    sexo:           String,
    token:          String
}));

mongoose.connect(process.env.DATABASE_URL);

export default Paciente;