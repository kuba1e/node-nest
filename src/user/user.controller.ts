import {
  Controller,
  Get,
  InternalServerErrorException,
  Logger,
  Request,
} from '@nestjs/common';
import { UserService } from './user.service';

@Controller('/secure/user')
export class UserController {
  constructor(private userService: UserService) {}
  @Get()
  async getByEmail(@Request() req) {
    try {
      const email = req.user.email;

      const user = await this.userService.getUserByEmail({
        where: {
          email,
        },
        relations: {
          settings: true,
        },
      });
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
