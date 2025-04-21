import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUrl, MinLength } from 'class-validator';

export class CreateEmployerRegistrationDTO {
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @IsString()
  @IsNotEmpty()
  companyAddress: string;

  @IsUrl({ protocols: ['http', 'https'], require_protocol: true }, { message: 'Website phải là URL hợp lệ, bao gồm cả http:// hoặc https://' })
  @IsOptional()
  website?: string;

  @IsString()
  @IsNotEmpty()
  contactPerson: string;

  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty()
  contactEmail: string;

  @IsString()
  @IsNotEmpty()
  contactPhone: string;

  @IsString()
  @IsOptional()
  @MinLength(100, { message: 'Mô tả công ty cần ít nhất 100 ký tự' })
  companyDescription?: string;

  @IsString()
  @IsOptional()
  industry?: string;

  @IsString()
  @IsOptional()
  companySize?: string;

  @IsString()
  @IsOptional()
  notes?: string; // Ghi chú bổ sung từ người đăng ký
}
