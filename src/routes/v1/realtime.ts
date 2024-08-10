import { WebSocket, WebSocketServer } from 'ws';
import { IncomingMessage, request, Server } from 'http';
import { getSession } from '../../middleware/auth';
import { logger } from '../../utils/logger';

const clients = new Map<string, WebSocket[]>();

export function initWebsocket(server: Server) {
    const wss = new WebSocketServer({ server, path: "v1/realtime" })

    logger.success('Websocket server successfully initialized');

    wss.on('connection', (ws) => {
        logger.debug('New websocket connection successfully established');

        ws.on('error', (error) => {
            logger.error(error);
        })

        ws.on('close', () => {
            clients.forEach((clientList, groupId) => {
                clients.set(groupId, clientList.filter(client => client !== ws));
            });
        })
    })

    server.on('upgrade', (request, socket, head) => {
        logger.debug('Handling new websocket connection');

        socket.on('error', onSocketError)

        authenticate(request, (err, groupId) => {
            if (err || !groupId) {
                socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
                socket.destroy();
                if (err) {
                    logger.error(err);
                }
                return;
            }

            logger.debug('Authenticated new websocket connection');

            socket.removeListener('error', onSocketError);

            wss.handleUpgrade(request, socket, head, (ws) => {
                logger.debug('Handling new websocket connection upgrade');
                clients.set(groupId, [...(clients.get(groupId) ?? []), ws]);
                wss.emit('connection', ws, request)
            })
        })
    })
}

export function broadcast(groupId: string, message: string) {
    const groupClients = clients.get(groupId);

    if (groupClients) {
        groupClients.forEach(client => {
            client.send(message);
        });
    }
}

function onSocketError(error: Error) {
    logger.error(error);
}

async function authenticate(request: IncomingMessage, callback: (err?: Error, groupId?: string) => void) {
    try {
        const token = request.url?.split('token=')[1];

        const session = await getSession(token);

        if (session) {
            callback(undefined, session.group.id);
        } else {
            callback(new Error('Unauthorized websocket connection attempt'));
        }
    } catch {
        callback(new Error('Error while authenticating a new websocket connection'));
    }
}