import { AuthServices } from '../../src/services/auth.js';
import { hash, compare } from 'bcrypt';
import jwt from 'jsonwebtoken';
import { HttpError } from '../../src/types/http.error.js';
import { secret } from '../../src/config.js'; // Asegúrate de importar el secret

jest.mock('bcrypt'); // Simular bcrypt
jest.mock('jsonwebtoken'); // Simular jsonwebtoken

describe('AuthServices', () => {
  const mockPayload = { userId: 1 };
  const mockToken = 'mockToken';
  const mockHash = 'mockHash';
  const mockValue = 'password';

  describe('createJWT', () => {
    it('should create a JWT token', () => {
      jwt.sign.mockReturnValue(mockToken); // Simula la creación de un token

      const token = AuthServices.createJWT(mockPayload);

      expect(token).toBe(mockToken);
      // Ahora verifica que jwt.sign haya sido llamado con el secret
      expect(jwt.sign).toHaveBeenCalledWith(mockPayload, secret); // Usa el secret real
    });
  });

  describe('verifyJWTGettingPayload', () => {
    it('should return decoded payload for valid token', () => {
      const decodedPayload = { userId: 1 };
      jwt.verify.mockReturnValue(decodedPayload); // Simula la verificación de un token

      const result = AuthServices.verifyJWTGettingPayload(mockToken);

      expect(result).toEqual(decodedPayload);
      // Ahora verifica que jwt.verify haya sido llamado con el secret
      expect(jwt.verify).toHaveBeenCalledWith(mockToken, secret); // Usa el secret real
    });

    it('should throw HttpError for invalid token', () => {
      const errorMessage = 'Token expired';
      jwt.verify.mockImplementation(() => {
        throw new Error(errorMessage); // Simula un error en la verificación
      });

      // Asegúrate de que el mensaje de error sea el correcto
      const error = new HttpError(498, 'Invalid Token', errorMessage);

      expect(() => AuthServices.verifyJWTGettingPayload(mockToken)).toThrow(
        error
      );
    });

    it('should throw HttpError for string result', () => {
      jwt.verify.mockReturnValue('stringResult'); // Simula un retorno inválido

      const error = new HttpError(498, 'Invalid Token', 'stringResult');

      expect(() => AuthServices.verifyJWTGettingPayload(mockToken)).toThrow(
        error
      );
    });
  });

  describe('hash', () => {
    it('should hash a value', async () => {
      hash.mockResolvedValue(mockHash); // Simula la función de hash

      const result = await AuthServices.hash(mockValue);

      expect(result).toBe(mockHash);
      expect(hash).toHaveBeenCalledWith(mockValue, AuthServices.salt);
    });
  });

  describe('compare', () => {
    it('should compare a value with a hash', async () => {
      compare.mockResolvedValue(true); // Simula la comparación exitosa

      const result = await AuthServices.compare(mockValue, mockHash);

      expect(result).toBe(true);
      expect(compare).toHaveBeenCalledWith(mockValue, mockHash);
    });
  });
});
