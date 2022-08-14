import express from 'express';
import controllers from './controllers.js';
const router = express.Router();

//  Crear paciente
router.post('/create', controllers.createPaciente);

//  Obtener todos los pacientes
router.get('/getAll', controllers.getAllPacientes);

//  Obtener un paciente por id
router.get('/getById', controllers.getPacienteById);

//  Actualizar un paciente por id
router.put('/update', controllers.updatePaciente);

//  Eliminar un paciente por id
router.delete('/delete', controllers.deletePaciente);

//  Solicitar acceso
router.get('/viewToken', controllers.verifyToken);

//  Solicitar acceso
router.post('/giveAccess', controllers.giveAccess);

export default router;