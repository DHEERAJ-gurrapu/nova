# nova

A simple AI-powered bot project with a lightweight web interface.

## Features

- Node.js bot entry point in `bot.js`
- Express-based web interface in `public/`
- Environment configuration with `.env`
- Uses OpenAI for AI functionality

## Getting started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Add your API key to `.env`:
   ```dotenv
   GROQ_API_KEY=your_api_key_here
   ```
3. Start the app:
   ```bash
   npm start
   ```

## Notes

- Keep `.env` out of version control.
- The bot runs from `bot.js` and serves the UI from `public/`.
