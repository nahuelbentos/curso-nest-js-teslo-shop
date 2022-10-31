import { Test, TestingModule } from '@nestjs/testing';
import { MessagesWebsocketsService } from './messages-websockets.service';

describe('MessagesWebsocketsService', () => {
  let service: MessagesWebsocketsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MessagesWebsocketsService],
    }).compile();

    service = module.get<MessagesWebsocketsService>(MessagesWebsocketsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
