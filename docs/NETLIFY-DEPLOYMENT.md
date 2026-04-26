# Netlify Deployment Steps

1. Push this project to GitHub.
2. Log in to Netlify and click `Add new site`.
3. Import the GitHub repository.
4. Set build settings:
   - Publish directory: `.`
   - Functions directory: `netlify/functions`
5. Add environment variables in Netlify:
   - `MONGODB_URI`
   - `MONGODB_DB_NAME`
   - `JWT_SECRET`
   - `ADMIN_NAME`
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
6. Deploy the site.
7. Netlify will use `netlify.toml` to redirect `/api/*` requests to the serverless function.
8. After deployment, test:
   - User registration and login
   - Admin login
   - Dashboard loading
   - CRUD operations
   - Progress saving and history display

If the app does not work after deployment, check:
- Netlify function logs
- MongoDB Atlas IP/network access
- Environment variable values
- API redirect configuration in `netlify.toml`
