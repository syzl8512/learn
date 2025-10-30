/**
 * HTTP 客户端 Mock (用于外部 API 调用)
 */

import { of } from 'rxjs';

export const mockHttpService = {
  get: jest.fn(() => of({ data: {} })),
  post: jest.fn(() => of({ data: {} })),
  put: jest.fn(() => of({ data: {} })),
  delete: jest.fn(() => of({ data: {} })),
  patch: jest.fn(() => of({ data: {} })),
};

/**
 * Mock 微信登录 API 响应
 */
export function mockWechatLoginResponse(openid: string = 'test-openid') {
  return of({
    data: {
      openid,
      session_key: 'test-session-key',
      unionid: 'test-unionid',
      errcode: 0,
      errmsg: 'ok',
    },
  });
}

/**
 * Mock DeepSeek API 响应
 */
export function mockDeepSeekResponse(content: string) {
  return of({
    data: {
      choices: [
        {
          message: {
            role: 'assistant',
            content,
          },
        },
      ],
    },
  });
}

/**
 * Mock 有道词典 API 响应
 */
export function mockYoudaoResponse(word: string) {
  return of({
    data: {
      query: word,
      translation: ['测试翻译'],
      basic: {
        phonetic: 'test',
        explains: ['n. 测试', 'v. 测试'],
      },
      web: [
        {
          key: word,
          value: ['测试', '试验'],
        },
      ],
    },
  });
}

/**
 * 重置 HTTP Mock
 */
export function resetHttpServiceMock() {
  Object.keys(mockHttpService).forEach((key) => {
    if (jest.isMockFunction(mockHttpService[key])) {
      mockHttpService[key].mockReset();
    }
  });
}
