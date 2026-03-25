
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const USERS_FILE = path.join(__dirname, 'users.txt');
const INSIGHTS_FILE = path.join(__dirname, 'insights.json');

// Initialize Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

app.use(cors());
app.use(express.json());

// Helper to read users
const readUsers = () => {
  if (!fs.existsSync(USERS_FILE)) {
    return [];
  }
  const content = fs.readFileSync(USERS_FILE, 'utf-8');
  return content.split('\n').filter(line => line.trim()).map(line => {
    const [email, password] = line.split(':');
    return { email: email?.trim(), password: password?.trim() };
  });
};

// Helper to read insights
const readInsights = () => {
  if (!fs.existsSync(INSIGHTS_FILE)) {
    return [];
  }
  const content = fs.readFileSync(INSIGHTS_FILE, 'utf-8');
  try {
    return JSON.parse(content);
  } catch (e) {
    return [];
  }
};

// Helper to write insights
const writeInsight = (insight) => {
  const insights = readInsights();
  insights.push({ ...insight, id: Date.now().toString(), created_at: new Date().toISOString() });
  fs.writeFileSync(INSIGHTS_FILE, JSON.stringify(insights, null, 2));
};

// Helper to write user
const writeUser = (email, password) => {
  const line = `${email}:${password}\n`;
  fs.appendFileSync(USERS_FILE, line);
};

app.post('/api/signup', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }

  const users = readUsers();
  if (users.find(u => u.email === email)) {
    return res.status(409).json({ message: 'User already exists' });
  }

  writeUser(email, password);
  res.status(201).json({ message: 'User created' });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const users = readUsers();
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  res.json({ message: 'Logged in successfully' });
});

app.post('/api/forgot-password', (req, res) => {
  const { email } = req.body;
  const users = readUsers();
  const user = users.find(u => u.email === email);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // In a real app, send email. Here, return it as requested for "txt file verification" (simulation)
  res.json({ password: user.password });
});

app.get('/api/insights', (req, res) => {
  const insights = readInsights();
  res.json(insights);
});

app.post('/api/insights', (req, res) => {
  const insight = req.body;
  if (!insight) {
    return res.status(400).json({ message: 'Insight data required' });
  }
  writeInsight(insight);
  res.status(201).json({ message: 'Insight saved' });
});

app.post('/api/send-email', async (req, res) => {
  try {
    const { productName, platform, reviewText, sentiment, sentimentScore, insights } = req.body;
    
    // Hardcoded recipient as requested
    const recipient = "gunjansaxena1810@gmail.com";
    
    console.log(`Sending email to ${recipient} via local server...`);

    if (!process.env.RESEND_API_KEY) {
       console.error("RESEND_API_KEY is missing in .env");
       return res.status(500).json({ error: "Server configuration error: Missing API Key" });
    }

    const sentimentColor = sentiment === 'positive' ? '#10b981' : sentiment === 'negative' ? '#ef4444' : '#f59e0b';
    const sentimentEmoji = sentiment === 'positive' ? '😊' : sentiment === 'negative' ? '😞' : '😐';

    // Build insights HTML
    const insightsHtml = insights && insights.length > 0 ? insights.map(insight => `
      <div style="background: #f8fafc; border-left: 4px solid ${
        insight.priority === 'high' ? '#ef4444' : insight.priority === 'medium' ? '#f59e0b' : '#3b82f6'
      }; padding: 16px; margin-bottom: 12px; border-radius: 0 8px 8px 0;">
        <h3 style="margin: 0 0 8px 0; color: #1e293b; font-size: 16px;">${insight.title}</h3>
        <p style="margin: 0 0 12px 0; color: #64748b; font-size: 14px;">${insight.description}</p>
        <div style="background: #e0f2fe; padding: 12px; border-radius: 6px;">
          <strong style="color: #0284c7; font-size: 12px;">💡 Recommended Action:</strong>
          <p style="margin: 4px 0 0 0; color: #0369a1; font-size: 14px;">${insight.recommendation}</p>
        </div>
      </div>
    `).join('') : '<p style="color: #64748b;">No specific insights generated for this feedback.</p>';

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>New Customer Feedback Alert</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f1f5f9; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 32px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">📊 New Feedback Received</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0;">Customer Feedback Analysis Report</p>
            </div>
            
            <!-- Product Info -->
            <div style="padding: 24px; border-bottom: 1px solid #e2e8f0;">
              <h2 style="margin: 0; color: #1e293b; font-size: 18px;">${productName}</h2>
              <p style="margin: 4px 0 0 0; color: #64748b; font-size: 14px;">Platform: ${platform}</p>
            </div>

             <!-- Sentiment Score -->
            <div style="padding: 24px; border-bottom: 1px solid #e2e8f0; text-align: center;">
               <div style="display: inline-block; padding: 8px 16px; background: ${sentimentColor}20; border-radius: 20px; color: ${sentimentColor}; font-weight: bold; font-size: 16px;">
                ${sentimentEmoji} ${sentiment.toUpperCase()} (${(sentimentScore * 10).toFixed(1)}/10)
              </div>
            </div>
            
            <!-- Review Text -->
             <div style="padding: 24px; border-bottom: 1px solid #e2e8f0;">
              <h3 style="margin: 0 0 16px 0; color: #1e293b; font-size: 16px;">💬 Customer Review</h3>
              <p style="margin: 0; color: #334155; font-size: 14px; line-height: 1.6; font-style: italic;">"${reviewText}"</p>
            </div>

            <!-- Insights -->
            <div style="padding: 24px;">
              <h3 style="margin: 0 0 16px 0; color: #1e293b; font-size: 16px;">🎯 Actionable Insights</h3>
              ${insightsHtml}
            </div>
            
            <!-- Footer -->
            <div style="background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                This email was generated by your CFIS Platform
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const mailOptions = {
      from: `Feedback Alert <${process.env.GMAIL_USER}>`,
      to: recipient,
      subject: `${sentimentEmoji} New ${sentiment} feedback: ${productName}`,
      html: emailHtml,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
    res.json({ success: true, messageId: info.messageId });

  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Auth server running on http://localhost:${PORT}`);
});
