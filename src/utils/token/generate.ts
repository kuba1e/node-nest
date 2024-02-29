import { JwtService } from '@nestjs/jwt';
import { TokenPayload } from '../../types/token';

const jwtAccessSecretKey = process.env.ACCESS_SECRET_KEY;
const jwtRefreshSecretKey = process.env.REFRESH_SECRET_KEY;

// export const generateToken = (payload: TokenPayload) => {
//   JwtService;
//   const accessToken = JwtService(payload, jwtAccessSecretKey, {
//     expiresIn: '2d',
//   });

//   const refreshToken = JwtService.sign(payload, jwtRefreshSecretKey, {
//     expiresIn: '30d',
//   });

//   return {
//     accessToken,
//     refreshToken,
//   };
// };
