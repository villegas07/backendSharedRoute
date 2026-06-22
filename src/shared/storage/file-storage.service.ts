export abstract class FileStorageService {
  abstract upload(file: Express.Multer.File, folder: string): Promise<string>;
  abstract delete(fileUrl: string): Promise<void>;
}
