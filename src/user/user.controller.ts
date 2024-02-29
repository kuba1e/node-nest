import {
  Controller,
  Get,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}
  @Get()
  async getByEmail() {
    try {
      const email = 'req.auth.email';

      const user = await this.userService.getUserByEmail(email);
      Logger.log(`Successfully found user: ${user.email}`);

      return {
        data: user,
      };
    } catch (error) {
      const message = `Internal Server Error: ${error.message}`;
      Logger.error(message);
      throw new InternalServerErrorException(message);
    }
  }
}
