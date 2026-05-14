import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class RegisterDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  surname: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({ default: 'yourmail@yandex.ru' })
  @IsNotEmpty()
  @IsEmail({}, { message: 'Не верный email' })
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  password: string;
}

export class LoginDto {
  @ApiProperty({ default: 'yourmail@yandex.ru' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  password: string;
}

export class ResetPasswordDto {
  @ApiProperty({ default: 'yourmail@yandex.ru' })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class ChangePasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  oldPassword: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  newPassword: string;
}
