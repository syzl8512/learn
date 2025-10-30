/**
 * JWT Service Mock
 */

export const mockJwtService = {
  sign: jest.fn((payload: any) => `mocked-jwt-token-${payload.sub}`),
  verify: jest.fn((token: string) => ({
    sub: 'user-id',
    email: 'test@example.com',
    iat: Date.now(),
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
  })),
  decode: jest.fn(),
};

/**
 * 重置 JWT Mock
 */
export function resetJwtServiceMock() {
  Object.keys(mockJwtService).forEach((key) => {
    if (jest.isMockFunction(mockJwtService[key])) {
      mockJwtService[key].mockReset();
    }
  });
}
