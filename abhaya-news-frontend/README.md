# Abhaya News Frontend

A modern, responsive news website frontend built with HTML, CSS, and JavaScript.

## Setup Instructions

### Prerequisites
- Node.js and npm installed
- Backend server running (see backend setup instructions)

### Installation

1. Install dependencies:
```
npm install
```

2. Start the development server:
```
npm start
```

The frontend will be available at http://localhost:3000

## Features

- **Dynamic Banner Slider**: Showcases featured news articles with smooth transitions
- **News Categories**: Filter news by different categories
- **Trending Section**: Highlights the most popular news articles
- **Latest News Grid**: Displays the most recent news articles
- **Category Highlights**: Shows news articles organized by category
- **Newsletter Subscription**: Allows users to subscribe for updates
- **Responsive Design**: Works on all devices from mobile to desktop
- **Admin Panel**: Upload and manage news articles (requires login)

## Connecting with Backend

The frontend is configured to connect with the backend API running at http://localhost:5000. Make sure the backend server is running before using the frontend.

### Backend Setup

1. Navigate to the backend directory:
```
cd ../abhaya-news-backend
```

2. Install dependencies:
```
npm install
```

3. Start the backend server:
```
npm start
```

The backend API will be available at http://localhost:5000

## Admin Access

To access the admin functionality:
1. Login using the admin credentials
2. After successful login, you can navigate to /admin.html to upload news articles

## Project Structure

- `index.html` - Main page for viewing news with dynamic banner slider
- `admin.html` - Admin page for uploading news
- `styles.css` - Main stylesheet for the website
- `slider.css` - Styles specific to the banner slider and other components
- `admin.css` - Admin page styles
- `app.js` - Main JavaScript for the news viewing functionality
- `slider.js` - JavaScript for the banner slider functionality
- `admin.js` - JavaScript for the admin functionality
- `server.js` - Express server for serving the frontend and proxying API requests

## API Endpoints

The frontend interacts with the following API endpoints:

- `GET /api/news` - Get all news articles with pagination
- `GET /api/news/:id` - Get a specific news article by ID
- `POST /api/admin/login` - Admin login
- `POST /api/news/upload` - Upload a new news article (requires authentication)