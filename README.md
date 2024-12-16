# Payment Voucher System

A web-based payment voucher approval system built with React, Node.js, Express, and MongoDB.

## Features

- User Authentication and Authorization
- Role-based Access Control (Admin, Approver, Creator)
- Beneficiary Management
- Payment Voucher Creation and Approval
- Dashboard with Analytics
- Secure JWT-based Authentication

## Prerequisites

- Node.js >= 14.0.0
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd payment-voucher-app
```

2. Install server dependencies:
```bash
npm install
```

3. Install client dependencies:
```bash
cd client
npm install
```

4. Create a `.env` file in the root directory:
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PRODUCTION_URL=your_production_url
```

## Development

Run the development server:
```bash
npm run dev
```

This will start both the backend server (port 5000) and frontend development server (port 4000).

## Production Deployment

1. Build the React client:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## Deploying to Heroku

1. Create a new Heroku app:
```bash
heroku create your-app-name
```

2. Set environment variables:
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_jwt_secret
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set PRODUCTION_URL=https://your-app-name.herokuapp.com
```

3. Deploy to Heroku:
```bash
git push heroku main
```

## Initial Admin Account

The system comes with a default admin account:
- Username: admin
- Password: admin123

Please change the password after first login.

## License

MIT
