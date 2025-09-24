# Smart Patient Monitoring

This repository contains the source code for the "Smart Patient Monitoring" application, a single-page web app built with React, TypeScript, and Supabase. It allows patients to track their health vitals and symptoms, and provides a dashboard for admins (doctors/nurses) to monitor patient data.

## Tech Stack

- **Frontend:** React, TypeScript, Vite, TailwindCSS
- **Backend:** Supabase (Auth, Postgres DB, Edge Functions)
- **Deployment:** Vercel (Frontend), Supabase (Backend)

## Features

### Patient Features
- **Authentication:** Secure sign-up and login.
- **Profile Management:** Create and update personal health profile (name, age, weight, etc.).
- **Vitals Tracking:** Log key vitals like blood oxygen, blood pressure, and heart rate.
- **Symptom Logger:** Record symptoms with a severity score and notes.
- **Data History:** View a history of previously logged vitals and symptoms.

### Admin Features
- **Patient List:** View a list of all registered patients.
- **Patient Detail View:** Click on a patient to see their detailed profile and health history.
- **Role-Based Access:** Admins have a distinct view and permissions enabled by Supabase RLS.

### AI & Advanced Features (Placeholders)
- **Symptom Checker:** A placeholder Edge Function (`symptom-checker`) is implemented to return mock AI-driven suggestions.
- **Admin Chatbot:** A placeholder Edge Function (`chatbot-gateway`) is implemented to return mock patient summaries.

---

## Project Setup

### 1. Set up Supabase
1. Go to [supabase.com](https://supabase.com) and create a new project.
2. **Database:** Navigate to the `SQL Editor` in your Supabase project dashboard.
3. Copy the entire content of `supabase/migrations/20231027_initial_schema.sql` and run it. This will create all the necessary tables, roles, and RLS policies.
4. **Project Credentials:** Go to `Project Settings` > `API`. You will need the `Project URL` and the `anon` `public` key for the next step.

### 2. Configure Frontend
1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```
2. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```
3. **Create Environment File:**
   - In the `frontend` directory, copy the example environment file:
     ```bash
     cp .env.example .env
     ```
   - Open the new `.env` file and add your Supabase project credentials:
     ```
     VITE_SUPABASE_URL="YOUR_SUPABASE_URL"
     VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
     ```
4. **Run the application:**
   ```bash
   npm run dev
   ```
   The application should now be running on `http://localhost:5173`.

### 3. Set up an Admin User
To access the admin dashboard, you need to assign the 'admin' role to a user.
1. Sign up a new user in the application as you normally would.
2. In your Supabase project dashboard, go to `Authentication` > `Users` and find the new user.
3. Manually edit the `user_metadata` for that user and add the role:
   ```json
   {
     "role": "admin"
   }
   ```
   The next time this user logs in, they will have access to the admin dashboard.

---

## Deployment

### Deploying Frontend to Vercel
1. Push your code to a Git repository (e.g., GitHub).
2. Go to [vercel.com](https://vercel.com) and create a new project, importing your repository.
3. Vercel should automatically detect that it is a Vite project.
4. **Environment Variables:** In the project settings on Vercel, add your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` environment variables.
5. Deploy.

### Deploying Supabase Edge Functions
1. **Install the Supabase CLI:** Follow the instructions at [supabase.com/docs/guides/cli](https://supabase.com/docs/guides/cli).
2. **Link your project:**
   ```bash
   supabase login
   supabase link --project-ref <your-project-id>
   ```
3. **Deploy the functions:**
   ```bash
   supabase functions deploy
   ```
4. **Set Secrets (for real AI integration):**
   ```bash
   supabase secrets set AI_API_KEY=your_openai_key
   ```

---

## Known Limitations & Next Steps

This MVP was built with some constraints, leading to the following limitations:

- **No Charting Library:** The patient dashboard has a placeholder for a vitals chart. A library like `Chart.js` or `Recharts` needs to be installed and configured to render the chart.
  - **Next Step:** Run `npm install recharts` and implement the chart component.
- **No Frontend Unit Tests:** The environment used for development did not allow for the installation of a test runner like `vitest`.
  - **Next Step:** Run `npm install -D vitest jsdom @testing-library/react` and create test files for key components.
- **Mocked AI Responses:** The AI-powered Edge Functions (`symptom-checker` and `chatbot-gateway`) currently return hardcoded mock data.
  - **Next Step:** Integrate a real AI provider (e.g., OpenAI) by making `fetch` calls from the Edge Functions and using an API key stored as a Supabase secret.
- **No Real-time Messaging:** The messaging tables exist, but the real-time chat UI is not implemented.
  - **Next Step:** Use Supabase Realtime to subscribe to changes in the `messages` table and build out a chat interface.
