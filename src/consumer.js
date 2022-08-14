import Paciente from "./model.js";
import jwt from "jsonwebtoken";
import amqplib from 'amqplib';
const queue = 'solicitudes';

//  Listener de rabbitmq
const connection = async () => {
    const conn = await amqplib.connect(process.env.QUEUE_KEY);
    const ch = await conn.createChannel();
    await ch.assertQueue(queue);

    //  Escuchar a la cola
    ch.consume(queue, async (msg) => {
        if (msg !== null) {
            const { pacienteDni, medicoId, institucionId } = JSON.parse(msg.content.toString());
            //  Generar token
            const token = jwt.sign(
                { institucionId: institucionId, medicoId: medicoId },
                process.env.JWT_SECRET,
                { expiresIn: "2m" }
            );
            //  Buscar paciente para actualizarlo con el token
            const paciente = await Paciente.findOneAndUpdate({ dni: pacienteDni }, { token });
            if (!paciente) {
                console.log('Paciente no encontrado');
            } else {
                console.log("Paciente actualizado")
            }
            ch.ack(msg);
        } else {
            console.log("No hay mensajes");
        }
    });
};

export default connection;