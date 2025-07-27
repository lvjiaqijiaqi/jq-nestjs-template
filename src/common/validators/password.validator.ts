import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments, registerDecorator, ValidationOptions } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@ValidatorConstraint({ name: 'isStrongPassword', async: false })
@Injectable()
export class IsStrongPasswordConstraint implements ValidatorConstraintInterface {
  constructor(private readonly configService: ConfigService) {}

  validate(password: string, args: ValidationArguments): boolean {
    if (!password) return false;

    const config = this.configService.get('security.password');
    const errors: string[] = [];

    // 检查最小长度
    if (password.length < config.minLength) {
      errors.push(`至少${config.minLength}个字符`);
    }

    // 检查大写字母
    if (config.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('至少包含一个大写字母');
    }

    // 检查小写字母
    if (config.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('至少包含一个小写字母');
    }

    // 检查数字
    if (config.requireNumbers && !/\d/.test(password)) {
      errors.push('至少包含一个数字');
    }

    // 检查特殊字符
    if (config.requireSymbols && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('至少包含一个特殊字符');
    }

    // 存储错误信息到args中，供defaultMessage使用
    (args as any).errors = errors;

    return errors.length === 0;
  }

  defaultMessage(args: ValidationArguments): string {
    const errors = (args as any).errors || [];
    return errors.length > 0 
      ? `密码强度不足: ${errors.join(', ')}`
      : '密码强度不足';
  }
}

export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsStrongPasswordConstraint,
    });
  };
} 