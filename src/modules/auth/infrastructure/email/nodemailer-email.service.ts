import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { EmailPort, PasswordResetEmailData } from '../../application/ports/email.port';

@Injectable()
export class NodemailerEmailService extends EmailPort {
  private readonly transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    super();
    this.transporter = this.createTransporter();
  }

  async sendPasswordResetEmail(data: PasswordResetEmailData): Promise<void> {
    await this.transporter.sendMail({
      from: this.configService.get<string>('smtp.from'),
      to: data.to,
      subject: 'Recuperación de contraseña — SharedRoute',
      html: this.buildResetEmailHtml(data.userName, data.token),
    });
  }

  private createTransporter(): nodemailer.Transporter {
    return nodemailer.createTransport({
      host: this.configService.get<string>('smtp.host'),
      port: this.configService.get<number>('smtp.port'),
      secure: this.configService.get<boolean>('smtp.secure'),
      auth: {
        user: this.configService.get<string>('smtp.user'),
        pass: this.configService.get<string>('smtp.password'),
      },
    });
  }

  private buildResetEmailHtml(userName: string, token: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2>Hola, ${userName} 👋</h2>
        <p>Recibiste este correo porque solicitaste restablecer tu contraseña en <strong>SharedRoute</strong>.</p>
        <p>Usa el siguiente código de recuperación en la aplicación:</p>
        <div style="background: #f4f4f4; padding: 16px; border-radius: 8px; text-align: center;">
          <code style="font-size: 18px; letter-spacing: 2px;">${token}</code>
        </div>
        <p>Este código expira en <strong>15 minutos</strong>.</p>
        <p style="color: #888;">Si no solicitaste este cambio, ignora este correo.</p>
      </div>
    `;
  }
}
