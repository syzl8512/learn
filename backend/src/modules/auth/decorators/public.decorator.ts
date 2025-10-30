import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * 标记接口为公开接口，不需要 JWT 认证
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
