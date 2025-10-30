import { HttpException, HttpStatus } from '@nestjs/common';

export class BusinessException extends HttpException {
  constructor(message: string, statusCode: HttpStatus = HttpStatus.BAD_REQUEST) {
    super(
      {
        success: false,
        message,
        statusCode,
      },
      statusCode,
    );
  }
}

export class UnauthorizedException extends BusinessException {
  constructor(message = '未授权访问') {
    super(message, HttpStatus.UNAUTHORIZED);
  }
}

export class ForbiddenException extends BusinessException {
  constructor(message = '无权限访问') {
    super(message, HttpStatus.FORBIDDEN);
  }
}

export class NotFoundException extends BusinessException {
  constructor(message = '资源不存在') {
    super(message, HttpStatus.NOT_FOUND);
  }
}

export class ValidationException extends BusinessException {
  constructor(message = '数据验证失败', errors?: any) {
    super(message, HttpStatus.BAD_REQUEST);
    if (errors) {
      (this as any).errors = errors;
    }
  }
}
