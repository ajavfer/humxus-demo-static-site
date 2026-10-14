# HumXus Static Site

This is a static site version of the HumXus web application, refactored from Flask to pure HTML/CSS/JavaScript for deployment on Render.com.

## Project Structure

```
humxus_demo_static_site/
├── public/                    # Static files to deploy
│   ├── index.html            # Home page
│   ├── user.html             # User dashboard
│   ├── master.html           # Master dashboard
│   ├── partner.html          # Partner dashboard
│   ├── login.html            # Login page
│   ├── signup.html           # Signup page
│   ├── _header.html          # Shared header (reference only)
│   └── static/               # Static assets
│       ├── css/
│       │   └── style.css
│       ├── js/
│       │   ├── i18n.js
│       │   └── script.js
│       └── images/
│           ├── HumXus_logo.png
│           ├── foodservice.jpg
│           ├── parties.jpg
│           ├── hospitality.jpg
│           ├── companion.jpg
│           ├── assistant.jpg
│           ├── loading_unloading.jpg
│           ├── elderly_care.jpg
│           ├── variety_show.jpg
│           └── general_case.jpg
├── render.yaml               # Render.com configuration
├── _redirects                # URL redirects for clean URLs
├── headers                   # Security headers configuration
└── README.md                 # This file
```

## Deployment to Render.com

### Prerequisites
- A Render.com account (free tier available)
- A GitHub, GitLab, or Bitbucket account
- This repository pushed to your git provider

### Step-by-Step Deployment

1. **Push to Git**
   ```bash
   cd humxus_demo_static_site
   git init
   git add .
   git commit -m "Initial static site commit"
   git branch -M main
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Create Static Site on Render**
   - Go to [Render.com](https://render.com)
   - Click "New +" → "Static Site"
   - Connect your git repository
   - Render will auto-detect the `render.yaml` configuration
   - Click "Create Static Site"

3. **Configuration (if not auto-detected)**
   - **Build Command**: (leave empty - no build needed)
   - **Publish Directory**: `public`
   - **Environment**: `Static`

4. **Deploy**
   - Render will automatically deploy your site
   - You'll get a URL like: `https://humxus-static.onrender.com`

## Configuration Files

### render.yaml
Configures Render.com to serve this as a static site from the `public` directory.

### _redirects
Provides clean URL redirects:
- `/user` → `/user.html`
- `/master` → `/master.html`
- `/partner` → `/partner.html`
- `/login` → `/login.html`
- `/signup` → `/signup.html`

### headers
Sets security headers:
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- X-Content-Type-Options: nosniff
- Content-Security-Policy (allows OpenStreetMap API)
- Cache-Control for static assets (1 year)

## Features Preserved

✅ **Client-side i18n** - Language switching via JavaScript
✅ **Location search** - OpenStreetMap API integration
✅ **Price calculation** - Dynamic pricing calculator
✅ **Mobile responsive** - Full mobile menu support
✅ **Security headers** - CSP and security headers configured
✅ **Caching** - Static assets cached for 1 year

## What Was Changed from Flask Version

### Removed
- Flask backend (`app.py`)
- Jinja2 template engine
- Server-side routing
- Dynamic `active` class logic (now client-side JavaScript)
- Cache-busting query params (now handled by server)

### Converted
- Jinja2 `{{ url_for() }}` → static paths (`/static/...`)
- Jinja2 `{% include %}` → inlined HTML
- Jinja2 conditionals → client-side JavaScript
- Jinja2 loops → hardcoded demo data (for user.html bookings)

### Preserved
- All HTML content and structure
- All CSS styling
- All JavaScript functionality
- All i18n data attributes
- All images and static assets

## Local Testing

To test locally before deploying:

1. **Using Python simple server:**
   ```bash
   cd public
   python -m http.server 8000
   ```
   Then open http://localhost:8000

2. **Using Node.js http-server:**
   ```bash
   npm install -g http-server
   cd public
   http-server -p 8000
   ```

3. **Using PHP:**
   ```bash
   cd public
   php -S localhost:8000
   ```

## Custom Domain (Optional)

To use a custom domain with Render:

1. Go to your static site on Render dashboard
2. Click "Settings" → "Domains & HTTPS"
3. Add your custom domain
4. Update DNS records as instructed by Render
5. Render will automatically provision SSL certificate

## Updates and Maintenance

To update the site:
1. Make changes to files in `public/`
2. Commit and push to git
3. Render will automatically redeploy on push

## Troubleshooting

### Images not loading
- Check image paths are `/static/images/...` (absolute paths)
- Verify images exist in `public/static/images/`

### JavaScript not working
- Check console for errors
- Verify script paths are `/static/js/...`
- Ensure i18n.js loads before script.js

### Navigation not highlighting
- Check the `<script>` tag at the end of each HTML file
- Verify `currentPage` variable matches the page name

### CSP errors
- Check browser console for CSP violations
- The CSP in `headers` allows OpenStreetMap API calls
- Update `headers` file if adding external resources

## License

This is a demo/static site version. Original application code is in the parent `HumXus_web_demo/` directory.
