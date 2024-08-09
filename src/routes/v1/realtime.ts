import { WebSocket, WebSocketServer } from 'ws';
import { server } from '../..';
import { IncomingMessage, request } from 'http';
import log, { Scope } from '../../utils/logger';
import { getSession } from '../../middleware/auth';

const wss = new WebSocketServer({ server, path: "v1/realtime" });

const clients = new Map<string, WebSocket[]>();

wss.on('connection', (ws) => {
    ws.on('error', (error) => {
        log(`Error: ${error}`, Scope.REALTIME);
    })

    ws.on('close', () => {
        clients.forEach((clientList, groupId) => {
            clients.set(groupId, clientList.filter(client => client !== ws));
        });
    })
})

server.on('upgrade', (request, socket, head) => {
    socket.on('error', onSocketError)

    authenticate(request, (err, groupId) => {
        if (err || !groupId) {
            socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
            socket.destroy();
            return;
        }

        socket.removeListener('error', onSocketError);

        wss.handleUpgrade(request, socket, head, (ws) => {
            clients.set(groupId, [...(clients.get(groupId) ?? []), ws]);
            wss.emit('connection', ws)
        })
    })
})

export function broadcast(groupId: string, message: string) {
    const groupClients = clients.get(groupId);

    if (groupClients) {
        groupClients.forEach(client => {
            client.send(message);
        });
    }
}

function onSocketError(error: Error) {
    log(`Error: ${error}`, Scope.REALTIME);
}

async function authenticate(request: IncomingMessage, callback: (err?: Error, groupId?: string) => void) {
    try {
        const token = request.headers.authorization!.split(" ")[1];

        const session = await getSession(token);

        if (session) {
            callback(undefined, session.group.id);
        } else {
            callback(new Error('Unauthorized'));
        }
    } catch {
        callback(new Error('Unauthorized'));
    }
}