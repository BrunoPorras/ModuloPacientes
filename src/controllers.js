import Paciente from "./model.js";
import jwt from "jsonwebtoken";
import amqplib from 'amqplib';
const queue = 'accesos';

// Objeto con todas las funciones
const controllers = {};

// Para crear un nuevo paciente
controllers.createPaciente = async (req, res) => {
    try {
        const {
            dni,
            apellidos,
            nombre,
            departamento,
            provincia,
            distrito,
            direccion,
            telefono,
            fechaNacimiento,
            sexo
        } = req.body;

        const paciente = await Paciente.create({
            dni,
            apellidos,
            nombre,
            departamento,
            provincia,
            distrito,
            direccion,
            telefono,
            fechaNacimiento,
            sexo
        });
        res.json({ message: "Success", paciente });
    }  catch (error) {
        res.json({ message: "Fail", error });
    }
};

//  Para obtener todos los pacientes
controllers.getAllPacientes = async (req, res) => {
    try {
        const pacientes = await Paciente.find();
        res.json({ message: "Success", pacientes });
    } catch (error) {
        res.json({ message: "Fail", error });
    }
};

//  Para obtener un paciente por id
controllers.getPacienteById = async (req, res) => {
    try {
        const { dni } = req.query;
        const paciente = await Paciente.findOne({ dni })
        res.json({ message: "Success", paciente });
    } catch (error) {
        res.json({ message: "Fail", error });
    }
};

//  Para actualizar un paciente por id
controllers.updatePaciente = async (req, res) => {
    try {
        const {
            dni,
            apellidos,
            nombre,
            departamento,
            provincia,
            distrito,
            direccion,
            telefono,
            fechaNacimiento,
            sexo
        } = req.body;
        const paciente = await Paciente.findOneAndUpdate(
            { dni },
            {
                apellidos,
                nombre,
                departamento,
                provincia,
                distrito,
                direccion,
                telefono,
                fechaNacimiento,
                sexo
            }
        );
        res.json({ message: "Success", paciente });
    } catch (error) {
        res.json({ message: "Fail", error });
    }
};

//  Para eliminar un paciente por id
controllers.deletePaciente = async (req, res) => {
    try {
        const { dni } = req.query;
        const paciente = await Paciente.findOneAndDelete({ dni });
        res.json({ message: "Success", paciente });
    } catch (error) {
        res.json({ message: "Fail", error });
    }
};

//  Para verificar el token de solicitud de acceso
controllers.verifyToken = async (req, res) => {
    try {
        const { dni } = req.query;
        const paciente = await Paciente.findOne({ dni });
        jwt.verify(paciente.token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.json({ message: "Fail", err });
            }
            res.json({ message: "Success", institucionId: decoded.institucionId, medicoId: decoded.medicoId });
        });
    } catch (e) {
        res.json({ message: "Fail", e });
    }
};

//  Para dar acceso al historial de un paciente
controllers.giveAccess = async (req, res) => {
    try {
        const { dni } = req.query;
        const paciente = await Paciente.findOne({ dni });
        jwt.verify(paciente.token, process.env.JWT_SECRET, async (err, decoded) => {
            if (err) {
                return res.json({ message: "Fail", err });
            }
            //  Se envía un mensaje al módulo de historial autorizando el acceso de este paciente
            const {
                institucionId,
                medicoId
            } = decoded;
            const conn = await amqplib.connect(process.env.QUEUE_KEY);

            const ch = await conn.createChannel();
            await ch.assertQueue(queue);

            await ch.sendToQueue(queue, Buffer.from(JSON.stringify({
                institucionId,
                medicoId,
                pacienteDni: dni
            })));
            res.json({ message: "Success", detail: "Actualizando acceso a historial" });
        });
    } catch (e) {
        res.json({ message: "Fail", e });
    }
};

export default controllers;