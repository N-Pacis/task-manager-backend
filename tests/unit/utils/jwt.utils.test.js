import { signToken, verifyToken } from "../../../src/utils/jwt.utils";


describe("Token Utility Functions", () => {
  const mockPayload = {
    id: 1
  };

  describe("signToken", () => {
    test("should sign a token with the correct payload", () => {
      const token = signToken(mockPayload);

      expect(typeof token).toBe("string");

      const decodedToken = verifyToken(token);

      expect(decodedToken.id).toBe(mockPayload.id);

      expect(decodedToken.iat).toBeDefined();
      expect(decodedToken.exp).toBeDefined();
    });
  });

  describe("verifyToken", () => {
    test("should verify a valid token and return the decoded payload", () => {
      const token = signToken(mockPayload);
      const decodedToken = verifyToken(token);

      expect(decodedToken.id).toBe(mockPayload.id);
     
      expect(decodedToken.iat).toBeDefined();
      expect(decodedToken.exp).toBeDefined();
    });

    test("should throw an error for an invalid token", () => {
      const invalidToken = "invalid_token";

      expect(() => verifyToken(invalidToken)).toThrow();
    });
  });
});
