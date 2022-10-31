import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { NewMessageDto } from './dtos/new-message.dto';
import { MessagesWebsocketsService } from './messages-websockets.service';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@WebSocketGateway({ cors: true })
export class MessagesWebsocketsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() webSocketServer: Server;

  constructor(
    private readonly messagesWebsocketsService: MessagesWebsocketsService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    const token = client.handshake.headers.authentication as string;
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify(token);
      await this.messagesWebsocketsService.registerClient(client, payload.id);
      // console.log(payload);
    } catch (error) {
      client.disconnect();
      return;
    }

    this.webSocketServer.emit(
      'clients-updated',
      this.messagesWebsocketsService.getConnectedClients(),
    );
  }

  handleDisconnect(client: Socket) {
    this.messagesWebsocketsService.removeClient(client.id);
  }

  //message-from-client
  @SubscribeMessage('message-from-client')
  handleMessageFromClient(client: Socket, payload: NewMessageDto) {
    console.log(client.id, payload);

    //! Emite unicamente al cliente
    // client.emit('message-from-server', {
    //   fullName: 'Soy yo!',
    //   message: payload.message || 'no-message',
    // });

    //~Emitir a todos Menos al cliente
    // client.broadcast.emit('message-from-server', {
    //   fullName: this.messagesWebsocketsService.getUserFullName(client.id),
    //   message: payload.message || 'no-message',
    // });
    this.webSocketServer.emit('message-from-server', {
      fullName: this.messagesWebsocketsService.getUserFullName(client.id),
      message: payload.message || 'no-message',
    });
  }
}
