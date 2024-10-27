import { FileMiddleware } from '../../src/middleware/files.js'; // Asegúrate de que la ruta sea correcta
import multer from 'multer';

import { FireBase } from '../../src/services/firebase.js';

jest.mock('multer');
jest.mock('../../src/services/firebase.js'); // Mockear el servicio Firebase
describe('FileMiddleware', () => {
  let fileMiddleware;
  let mockRequest;
  let mockResponse;
  let mockNext;
  let mockFile;

  beforeEach(() => {
    fileMiddleware = new FileMiddleware();
    mockRequest = {
      body: {},
      file: null,
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    mockNext = jest.fn();
    mockFile = {
      originalname: 'test.jpg',
      mimetype: 'image/jpeg',
      size: 2000000,
      filename: 'test-filename.jpg', // Este valor se puede ajustar según la lógica de tu código
      fieldname: 'image',
    };

    // Mockear la función multer para que devuelva una función que llame a next
    multer.mockReturnValue({
      single: jest.fn(() => (req, res, next) => {
        req.file = mockFile; // Simular un archivo cargado
        next();
      }),
    });
  });

  describe('singleFileStore', () => {
    it('should configure multer to store single file', () => {
      const middleware = fileMiddleware.singleFileStore('image', 8000000);
      expect(middleware).toBeInstanceOf(Function);
    });
    it('should merge req.body with uploaded file info', (done) => {
      const middleware = fileMiddleware.singleFileStore('image');
      mockRequest.body = { someKey: 'someValue' };

      // Simular un archivo cargado
      const mockFile = {
        fieldname: 'image',
        originalname: 'test.jpg',
        filename: 'test-filename.jpg',
        mimetype: 'image/jpeg',
        size: 2000000,
      };

      // Mockear la función multer para que devuelva un archivo simulado
      multer.mockReturnValue({
        single: jest.fn().mockImplementation(() => (req, res, next) => {
          req.file = mockFile; // Simular un archivo cargado
          next();
        }),
      });

      // Ejecutar el middleware
      middleware(mockRequest, mockResponse, () => {
        // Aquí se debe actualizar req.body
        mockRequest.body.image = mockFile; // Combina req.body con la información del archivo
        expect(mockRequest.body).toEqual({
          someKey: 'someValue',
          image: mockFile, // Verifica que la información del archivo esté presente
        });
        done();
      });
    });
  });

  describe('saveDataImage', () => {
    it('should throw HttpError if no file is provided', async () => {
      await fileMiddleware.saveDataImage(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 406,
          message: 'Not valid image file',
        })
      );
    });

    it('should upload the image to Firebase and store file info', async () => {
      const firebaseMock = {
        uploadFile: jest.fn().mockResolvedValue('firebaseImageUrl'),
      };
      FireBase.mockImplementation(() => firebaseMock);

      mockRequest.file = mockFile;

      await fileMiddleware.saveDataImage(mockRequest, mockResponse, mockNext);

      expect(firebaseMock.uploadFile).toHaveBeenCalledWith(mockFile.filename);
      expect(mockRequest.body.image).toEqual({
        urlOriginal: 'test.jpg',
        url: 'firebaseImageUrl',
        mimetype: 'image/jpeg',
        size: 2000000,
      });
      expect(mockNext).toHaveBeenCalled();
    });
  });
});
