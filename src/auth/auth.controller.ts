import {
  Body,
  Controller,
  HttpCode,
  InternalServerErrorException,
  Logger,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { User } from 'src/user/user.entity';
import { validate } from 'class-validator';
import { UserService } from 'src/user/user.service';
import { Public } from 'src/utils/isPublic';

const saltRounds = Number(process.env.SALT_ROUNDS || 10);

@Controller('/public/auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}
  @Public()
  @Post('/signin')
  async login(@Body() body: { email: string; password: string }) {
    try {
      const { email, password: providedPassword } = body;

      const user = await this.userService.getExtendedUserByEmail(email);

      if (!user) {
        throw new UnauthorizedException();
      }

      const passwordMatched = await bcrypt.compare(
        providedPassword,
        user.password,
      );

      if (!passwordMatched) {
        Logger.log(
          `User ${user.email} provided wrong password: ${providedPassword}`,
        );
        throw new UnauthorizedException();
      }

      const tokens = this.authService.generateToken({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      });

      await this.authService.upsertToken(
        tokens.refreshToken,
        tokens.accessToken,
        user.id,
      );

      const userResponse = await this.userService.getUserByEmail({
        where: {
          email,
        },
        relations: {
          settings: true,
        },
      });

      Logger.log(`Successfully found user: ${user.email}`);

      return {
        accessToken: tokens.accessToken,
        data: userResponse,
      };
    } catch (error) {
      const message = `Internal Server Error: ${error.message}`;
      Logger.error(message);
      throw new InternalServerErrorException(message);
    }
  }

  @Public()
  @Post('/signup')
  async registration(@Body() body: Partial<User>) {
    try {
      const {
        email,
        nickname,
        password,
        firstName,
        lastName,
        phoneNumber,
        avatar,
      } = body;

      const settings = await this.authService.saveSettings();

      const passwordHash = await bcrypt.hash(password, saltRounds);

      const newUser = {
        email,
        firstName,
        lastName,
        nickname,
        phoneNumber,
        avatar,
        settings,
        password: passwordHash,
      };

      const errors = await validate(newUser);

      if (errors.length > 0) {
        throw new UnauthorizedException(
          `Validation failed! Errors: ${errors.join(' ')}`,
        );
      }

      await this.userService.saveNewUser(newUser);

      const user = await this.userService.getUserByEmail({
        where: {
          email,
        },
        relations: {
          settings: true,
        },
      });

      const tokens = this.authService.generateToken({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      });

      await this.authService.upsertToken(
        tokens.refreshToken,
        tokens.accessToken,
        user.id,
      );

      Logger.log(`Successfully created user with id: ${user.id}`);

      return {
        accessToken: tokens.accessToken,
        data: user,
      };
    } catch (error) {
      const message = `Internal Server Error: ${error.message}`;
      Logger.error(message);
      throw new InternalServerErrorException(message);
    }
  }
}
