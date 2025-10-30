export const mockJwtService = {
  sign: jest.fn(),
  verify: jest.fn(),
  decode: jest.fn(),
};

export function resetJwtServiceMock() {
  mockJwtService.sign.mockClear();
  mockJwtService.verify.mockClear();
  mockJwtService.decode.mockClear();
}
