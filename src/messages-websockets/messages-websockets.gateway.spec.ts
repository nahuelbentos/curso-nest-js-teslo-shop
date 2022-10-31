import { Test, TestingModule } from '@nestjs/testing';
import { MessagesWebsocketsGateway } from './messages-websockets.gateway';
import { MessagesWebsocketsService } from './messages-websockets.service';

describe('MessagesWebsocketsGateway', () => {
  let gateway: MessagesWebsocketsGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MessagesWebsocketsGateway, MessagesWebsocketsService],
    }).compile();

    gateway = module.get<MessagesWebsocketsGateway>(MessagesWebsocketsGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
