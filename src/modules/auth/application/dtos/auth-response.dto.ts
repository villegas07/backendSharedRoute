import { UserResponseDto } from '../../../users/application/dtos/user-response.dto';

export class AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: UserResponseDto;
}
