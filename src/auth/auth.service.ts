import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Token } from 'src/user/token.entity';
import { Settings } from 'src/user/settings.entity';
import { DEFAULT_CHAT_SETTINGS } from 'src/constants/chat';
import { JwtService } from '@nestjs/jwt';
import { TokenPayload } from 'src/types/token';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Token)
    private tokenRepository: Repository<Token>,
    @InjectRepository(Settings)
    private settingsRepository: Repository<Settings>,
    private jwtService: JwtService,
  ) {}

  async saveSettings() {
    return await this.settingsRepository.save({
      chatSetting: DEFAULT_CHAT_SETTINGS,
    });
  }

  async upsertToken(refreshToken: string, accessToken: string, userId: string) {
    return await this.tokenRepository.upsert(
      {
        refreshToken,
        accessToken,
        userId,
      },
      ['userId'],
    );
  }

  generateToken(payload: TokenPayload) {
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '2d',
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '30d',
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
