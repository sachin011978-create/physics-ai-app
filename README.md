# Physics AI Application

A comprehensive, dual-stack Pedagogy Application designed for Gen Z physics students. Features robust Dark Mode Concept Whiteboard layouts, explicit PDF memory syncing, and interactive Gemini APIs.

## 🚀 Deployment Instructions

This repository contains both the React standard frontend and Node.js backend. Follow these instructions precisely to deploy the structure identically mimicking a monorepo setup using free Vercel and Render/Railway tiers!

### Step 1: Push to GitHub
Open your terminal in `c:\Users\DELL\physics-ai-app` and commit to a new public repository:
```bash
git init
git add .
git commit -m "Final Production Build Release"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/physics-ai-app.git
git push -u origin main
```

### Step 2: Deploy Backend to Render or Railway
1. Log into [Render](https://render.com) or [Railway](https://railway.app).
2. Create a new **Web Service** and connect your GitHub repository.
3. Configure your Build Process:
   - **Root Directory**: `backend` *(Critical: Tell Render to look exclusively in the `backend/` folder!)*
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add Environment Variables:
   - Key: `GEMINI_API_KEY`
   - Value: `<Your Google Gemini Key>`
5. Click **Deploy** and **copy your newly generated Backend URL** (e.g., `https://physics-backend.onrender.com`).

### Step 3: Deploy Frontend to Netlify
1. Log into [Netlify](https://netlify.com).
2. Click **Add new site** -> **Import an existing project** from GitHub.
3. Keep the configuration exact defaults:
   - **Build Command**: `npm run build`
   - **Publish directory**: `dist`
4. Click **Show advanced** to Add Environment Variables:
   - Key: `VITE_API_URL`
   - Value: `<Paste the Backend URL you copied from Step 2>` *(e.g., `https://physics-backend.onrender.com`)*
5. Click **Deploy Site**. Netlify will build your SPA and flawlessly route physics queries mapping strictly to the `netlify.toml` settings!

## 🎉 Final Run
Once the backend boots successfully on Render and Netlify completes the React build, everything will snap into place securely via standard global CORS protocols. Happy studying!
