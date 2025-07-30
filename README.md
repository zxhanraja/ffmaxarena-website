# FFMaxArena - Run and Deploy

This contains everything you need to run your app locally and deploy it.

## Run Locally

**Prerequisites:**
*   Node.js
*   Vercel Account (for deployment)
*   Git provider account (GitHub, GitLab, etc.)

### 1. Install Dependencies
Install project dependencies from `package.json`:
```bash
npm install
```

### 2. Setup Environment Variables
This project requires environment variables to connect to backend services. Create a file named `.env.local` in the root of your project.

Copy the following into `.env.local` and add your actual keys:

```
# Get these from your Supabase project settings -> API
VITE_SUPABASE_URL=https://fvlltddhgewuinskencu.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Get this from your Web3Forms account
VITE_WEB3FORMS_ACCESS_KEY=your_web3forms_access_key_here
```
**Important:** Your Supabase keys are sensitive. Do not commit the `.env.local` file to Git.

### 3. Run the App
Start the local development server:
```bash
npm run dev
```
Your application should now be running locally at `http://localhost:5173` (or another port if 5173 is busy).

## Deployment to Vercel

This project is configured for easy deployment to [Vercel](https://vercel.com).

### 1. Push to Git
Make sure your project code is pushed to a Git repository (e.g., GitHub, GitLab, Bitbucket).

### 2. Import Project on Vercel
1.  Log in to your Vercel account.
2.  Click **Add New...** -> **Project**.
3.  Click **Continue with Git** and select the repository for this project.

### 3. Configure Project
Vercel should automatically detect that this is a **Vite** project. The default settings are correct:
*   **Framework Preset:** Vite
*   **Build Command:** `vite build`
*   **Output Directory:** `dist`
*   **Install Command:** `npm install`

### 4. Add Environment Variables
This is the most important step.
1.  In the project configuration screen, expand the **Environment Variables** section.
2.  Add the following variables with the same values you used in your `.env.local` file:

| Name                      | Value                          |
| ------------------------- | ------------------------------ |
| `VITE_SUPABASE_URL`       | Your Supabase Project URL      |
| `VITE_SUPABASE_ANON_KEY`  | Your Supabase Anon Key         |
| `VITE_WEB3FORMS_ACCESS_KEY`| Your Web3Forms Access Key     |

### 5. Deploy
Click the **Deploy** button. Vercel will build and deploy your site. Once finished, you'll be given a public URL.

---
## Building for Production Manually

If you wish to host the site elsewhere, you can create a production build. This process will:
*   **Bundle** all your code into a few highly optimized files.
*   **Minify** the code, removing all comments, spaces, and unnecessary characters.
*   Prepare the assets for hosting.

To create a production build, run:
```bash
npm run build
```
This command will create a new `dist` directory. You can deploy the contents of this `dist` folder to any static web hosting provider. Note that your provider must support SPA routing (i.e., redirect all requests to `index.html`).
