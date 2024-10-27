import { FireBase } from '../../src/services/firebase.js';
import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { readFile } from 'fs/promises';
import { firebaseConfig } from '../../src/config.js';

jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
}));

jest.mock('firebase/storage', () => ({
  getStorage: jest.fn(),
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn(),
}));

jest.mock('fs/promises', () => ({
  readFile: jest.fn(),
}));

describe('FireBase', () => {
  let firebase;

  beforeEach(() => {
    firebase = new FireBase();
  });

  it('should initialize Firebase app and storage', () => {
    expect(initializeApp).toHaveBeenCalledWith(firebaseConfig);
    expect(getStorage).toHaveBeenCalledWith(firebase.app);
  });

  describe('uploadFile', () => {
    it('should upload file and return download URL', async () => {
      const mockFileName = 'test-file.jpg';
      const mockFileBuffer = Buffer.from('file content'); // Simulamos un buffer de archivo
      const mockDownloadURL = 'https://example.com/test-file.jpg';

      // Mockear el comportamiento de las funciones
      readFile.mockResolvedValue(mockFileBuffer);
      getDownloadURL.mockResolvedValue(mockDownloadURL);
      ref.mockReturnValue('mockFileRef'); // Simula la referencia del archivo

      const result = await firebase.uploadFile(mockFileName);

      expect(readFile).toHaveBeenCalledWith(`public/uploads/${mockFileName}`);
      expect(ref).toHaveBeenCalledWith(
        firebase.storage,
        `public/uploads/${mockFileName}`
      );
      expect(uploadBytes).toHaveBeenCalledWith('mockFileRef', mockFileBuffer);
      expect(getDownloadURL).toHaveBeenCalledWith('mockFileRef');
      expect(result).toBe(mockDownloadURL);
    });

    it('should throw an error if readFile fails', async () => {
      const mockFileName = 'test-file.jpg';
      const mockError = new Error('File not found');

      // Mockear el comportamiento de readFile para que falle
      readFile.mockRejectedValue(mockError);

      await expect(firebase.uploadFile(mockFileName)).rejects.toThrow(
        'File not found'
      );
    });

    it('should throw an error if uploadBytes fails', async () => {
      const mockFileName = 'test-file.jpg';
      const mockFileBuffer = Buffer.from('file content');
      const mockError = new Error('Upload failed');

      // Mockear el comportamiento
      readFile.mockResolvedValue(mockFileBuffer);
      getDownloadURL.mockResolvedValue('https://example.com/test-file.jpg');
      ref.mockReturnValue('mockFileRef');
      uploadBytes.mockRejectedValue(mockError);

      await expect(firebase.uploadFile(mockFileName)).rejects.toThrow(
        'Upload failed'
      );
    });

    it('should throw an error if getDownloadURL fails', async () => {
      const mockFileName = 'test-file.jpg';
      const mockFileBuffer = Buffer.from('file content');
      const mockError = new Error('Failed to get download URL');

      // Mockear el comportamiento
      readFile.mockResolvedValue(mockFileBuffer);
      ref.mockReturnValue('mockFileRef');
      uploadBytes.mockResolvedValue(undefined); // Simulamos que la carga fue exitosa
      getDownloadURL.mockRejectedValue(mockError);

      await expect(firebase.uploadFile(mockFileName)).rejects.toThrow(
        'Failed to get download URL'
      );
    });
  });
});
