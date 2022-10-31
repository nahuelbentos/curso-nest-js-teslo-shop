import { Repository } from 'typeorm';
import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginDto, CreateUserDto } from './dto';
import { User } from './entities/user.entity';
import { JwtPayload } from './interfaces';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto;

      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });
      await this.userRepository.save(user);
      delete user.password;
      return {
        ...user,
        token: this.getJwtToken({ email: user.email, id: user.id }),
      };
    } catch (error) {
      console.log(error);
      this.handleDBErrors(error);
    }
  }

  async login(loginDto: LoginDto) {
    const { password, email } = loginDto;
    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true, id: true },
    });

    if (!user) throw new UnauthorizedException(' Not valid credentials (mail)');

    if (!bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException(' Not valid credentials (password)');
    return {
      ...user,
      token: this.getJwtToken({ email: user.email, id: user.id }),
    };

    // try {
    // } catch (error) {
    //   this.handleDBErrors(error);
    // }
  }

  checkAuthStatus(user: User) {
    return {
      ...user,
      token: this.getJwtToken({ email: user.email, id: user.id }),
    };
  }

  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }

  private handleDBErrors(error: any): never {
    if (error.code === '23505') throw new BadRequestException(error.detail);
    console.log(error);
    throw new InternalServerErrorException('Check  server logs');
  }
}
