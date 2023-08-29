# GooseTrack - backend part

## Tools

Goose Track is built using the following tools:

- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com)
- [MongoDB](https://www.mongodb.com/)

## Installation

To install Goose Track, follow these steps:

1. Clone the Goose Track repository to your local machine using "git clone https://github.com/IvanRuskevych/GooseTrack-backend.git"
2. Navigate to the project directory "GooseTrack-backend".
3. Install dependencies using "npm install".
4. Create .env and add your environment variables like in .env.example:

   - MONGO_URL: your MongoDB connection string
   - PORT: port of this program
   - SENDGRID_API_KEY: secret key email service
   - SENDGRID_EMAIL_FROM: user email service

   - EMAIL_PASS: password email service--

   - CLOUDINARY_CLOUD_NAME: cloudnery api name
   - CLOUDINARY_API_KEY: cloudnery api key
   - CLOUDINARY_API_SECRET: cloudnery api secret

   - CLOUDINARY_URL: cloudnery URL--

   - GOOGLE_CLIENT_ID: id google client
   - GOOGLE_CLIENT_SECRET: secret string for signing google client

   - FRONTEND_URL: URL Front End part

   - REFRESH_SECRET_KEY: secret string for signing refresh token
   - ACCESS_SECRET_KEY: secret string for signing access token

5. Start the server using

- $ npm run dev - for start Beckend

## Links

- [Live Demo]()
- [Frontend Repository]()
- [Backend Repository](https://github.com/IvanRuskevych/GooseTrack-backend)
