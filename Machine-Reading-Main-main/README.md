Machine Reading - Sentiment Analysis Platform
A powerful AI-driven platform for analyzing customer feedback, extracting sentiment from text and audio reviews, generating actionable business insights, and automating email notifications.
👥 Author - Gunjan Saxena

🚀 Key Features

Sentiment analysis of text and audio reviews (Positive, Negative, Neutral)
AI-powered generation of actionable business insights
Interactive visualizations: sentiment trends and keyword clouds
Automatic email notifications with detailed analysis summaries
Secure user authentication (Signup/Login)

🛠️ Tech Stack

Frontend: React, Vite, Tailwind CSS
Backend: Node.js, Express
Database: Supabase
AI Model: Google Gemini API
Email Service: Nodemailer (Gmail) or Resend (optional)

📋 Prerequisites

Node.js (v16 or higher recommended)
npm (included with Node.js)

📥 Installation

Clone the repository (replace with your actual repo URL if available):Bashgit clone https://github.com/your-username/machinereading-main.git
cd machinereading-main
Install dependencies:Bashnpm install

⚙️ Configuration
Create a .env file in the root directory with the following variables:
env# Supabase Configuration
VITE_SUPABASE_PROJECT_ID=your_supabase_project_id
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
VITE_SUPABASE_URL=your_supabase_url

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key

# Email Configuration (choose one)

# Option 1: Gmail (via Nodemailer)
GMAIL_USER=your_gmail_address@example.com
GMAIL_APP_PASSWORD=your_16-digit_app_password

# Option 2: Resend (recommended for production)
# RESEND_API_KEY=re_your_resend_api_key
Security Tips:
Add .env to your .gitignore file — never commit secrets.
For Gmail: Enable 2-Factor Authentication and generate an App Password.
Resend is recommended for better deliverability and to avoid Gmail restrictions.

🏃 Running the Application
Run both backend and frontend in separate terminals.
1. Start the Backend Server
Handles authentication and email notifications.
Bashnode server.js
→ Available at http://localhost:3000
2. Start the Frontend
Bashnpm run dev
→ Available at http://localhost:8080 (or the port shown in the console)
Open your browser and navigate to the frontend URL.
🧪 How to Use

Sign Up / Log In
Create a new account or log in with existing credentials.
Analyze Reviews
Go to the "Analyze" tab → Enter product details → Submit text review or record audio.
View Results
Instantly see:
Sentiment score and classification
Keyword cloud
Sentiment trends
AI-generated actionable insights

Email Notifications
A comprehensive summary email is automatically sent after each analysis.

📸 Screenshots
(Optional: Add screenshots here for login page, analysis form, results dashboard, etc.)
🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to fork and submit pull requests.
📄 License
This project is open source. (Consider adding an MIT or similar license file.)
