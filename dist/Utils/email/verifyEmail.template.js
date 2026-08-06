"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const template = (code, firstName, subject) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>

  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      background-color: #f4f7fa;
      font-family: Arial, Helvetica, sans-serif;
      color: #333;
      padding: 40px 20px;
    }

    .container {
      max-width: 600px;
      margin: auto;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
    }

    .header {
      background: #2563eb;
      color: white;
      text-align: center;
      padding: 30px 20px;
    }

    .header h1 {
      font-size: 28px;
    }

    .content {
      padding: 40px 30px;
    }

    .content h2 {
      margin-bottom: 15px;
      color: #111827;
    }

    .content p {
      margin-bottom: 16px;
      line-height: 1.7;
      color: #4b5563;
      font-size: 16px;
    }

    .otp-box {
      margin: 30px 0;
      text-align: center;
    }

    .otp {
      display: inline-block;
      background: #f3f4f6;
      color: #2563eb;
      font-size: 34px;
      font-weight: bold;
      letter-spacing: 8px;
      padding: 16px 40px;
      border-radius: 10px;
      border: 2px dashed #2563eb;
    }

    .footer {
      text-align: center;
      background: #f9fafb;
      color: #6b7280;
      padding: 20px;
      font-size: 14px;
      border-top: 1px solid #e5e7eb;
    }

    @media (max-width: 600px) {
      .content {
        padding: 30px 20px;
      }

      .otp {
        font-size: 28px;
        letter-spacing: 5px;
        padding: 14px 24px;
      }
    }
  </style>
</head>

<body>

  <div class="container">

    <div class="header">
      <h1>${subject}</h1>
    </div>

    <div class="content">

      <h2>Hello ${firstName}, 👋</h2>

      <p>
        We received a request related to your account.
      </p>

      <p>
        Please use the verification code below to continue:
      </p>

      <div class="otp-box">
        <span class="otp">${code}</span>
      </div>

      <p>
        This code will expire in <strong>5 minutes</strong>.
      </p>

      <p>
        If you didn't request this code, you can safely ignore this email.
      </p>

      <p>
        Thank you,<br>
        <strong>Your Team</strong>
      </p>

    </div>

    <div class="footer">
      © 2026 Your Company. All rights reserved.
    </div>

  </div>

</body>
</html>`;
exports.default = template;
