import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import path from 'path';


const fullPath = path.resolve("./utils/config/.env")
dotenv.config({ path: fullPath });

export const sendEmail = async ({ to, subject, html }) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    })
    const info = await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        html
    })
} 