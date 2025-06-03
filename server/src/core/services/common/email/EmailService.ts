import nodemailer from 'nodemailer';
import { IUser } from '../../../../data/models/User';
import config from '../../../../config';

export interface IEmailService {
  sendVerificationEmail(user: IUser, verificationUrl: string): Promise<void>;
}

export class EmailService implements IEmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass
      }
    });
  }

  async sendVerificationEmail(user: IUser, verificationUrl: string): Promise<void> {
    const mailOptions = {
      from: config.smtp.from,
      to: user.email,
      subject: 'Verify Your Email Address',
      html: `
        <h1>Welcome to Job Portal!</h1>
        <p>Hello ${user.name},</p>
        <p>Thank you for registering with us. Please verify your email address by clicking the button below:</p>
        <p>
          <a href="${verificationUrl}" style="
            background-color: #4CAF50;
            border: none;
            color: white;
            padding: 15px 32px;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            font-size: 16px;
            margin: 4px 2px;
            cursor: pointer;
            border-radius: 4px;
          ">
            Verify Email
          </a>
        </p>
        <p>If the button doesn't work, you can also click this link:</p>
        <p><a href="${verificationUrl}">${verificationUrl}</a></p>
        <p>This verification link will expire in 24 hours.</p>
        <p>If you didn't create an account, please ignore this email.</p>
      `
    };

    try {
      console.log('Sending email with options:', mailOptions);
      await this.transporter.sendMail(mailOptions);
      console.log('Sending email with options:', mailOptions);
      console.log('SMTP config in EmailService:', config.smtp);
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }
}

export const emailService = new EmailService(); 