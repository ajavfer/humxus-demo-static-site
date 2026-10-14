#!/bin/bash

# HumXus Static Site Deployment Script
# This script helps prepare and deploy the static site to Render.com

echo "=== HumXus Static Site Deployment Helper ==="
echo ""

# Check if we're in the right directory
if [ ! -f "render.yaml" ]; then
    echo "Error: render.yaml not found. Please run this script from the humxus_demo_static_site directory."
    exit 1
fi

echo "✓ Found render.yaml"
echo ""

# Check if public directory exists
if [ ! -d "public" ]; then
    echo "Error: public directory not found."
    exit 1
fi

echo "✓ Found public directory"
echo ""

# Check if all HTML files exist
html_files=("index.html" "user.html" "master.html" "partner.html" "login.html" "signup.html")
for file in "${html_files[@]}"; do
    if [ ! -f "public/$file" ]; then
        echo "Warning: public/$file not found"
    else
        echo "✓ Found public/$file"
    fi
done

echo ""
echo "=== Deployment Instructions ==="
echo ""
echo "1. Initialize git repository (if not already done):"
echo "   git init"
echo "   git add ."
echo "   git commit -m 'Initial static site commit'"
echo ""
echo "2. Add remote repository:"
echo "   git remote add origin <your-repo-url>"
echo ""
echo "3. Push to GitHub/GitLab/Bitbucket:"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "4. Go to Render.com:"
echo "   - Click 'New +' → 'Static Site'"
echo "   - Connect your repository"
echo "   - Render will auto-detect render.yaml"
echo "   - Click 'Create Static Site'"
echo ""
echo "=== Site will be live at: https://humxus-static.onrender.com ==="
