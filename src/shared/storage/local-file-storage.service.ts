import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { FileStorageService } from './file-storage.service';

const UPLOADS_ROOT = path.join(process.cwd(), 'uploads');

@Injectable()
export class LocalFileStorageService extends FileStorageService {
  private readonly logger = new Logger(LocalFileStorageService.name);

  async upload(file: Express.Multer.File, folder: string): Promise<string> {
    const folderPath = path.join(UPLOADS_ROOT, folder);
    fs.mkdirSync(folderPath, { recursive: true });

    const extension = path.extname(file.originalname).toLowerCase();
    const fileName = `${uuidv4()}${extension}`;
    const filePath = path.join(folderPath, fileName);

    fs.writeFileSync(filePath, file.buffer);
    this.logger.log(`File saved: ${filePath}`);

    return `uploads/${folder}/${fileName}`;
  }

  async delete(fileUrl: string): Promise<void> {
    const filePath = path.join(process.cwd(), fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      this.logger.log(`File deleted: ${filePath}`);
    }
  }
}
