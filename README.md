
# Snowball – Social Media App

A mobile social media app built with React Native, Expo, and Supabase.  
Users can authenticate, view a feed of posts, and create new posts.

---

## Features

- **Authentication:** Email/password sign up and login (no third-party OAuth).
- **Feed:** Scrollable list of all posts (title, author, description, image).
- **Create Post:** Form to create new posts with validation and image picker.
- **Seed Data:** Populate the feed with sample posts using a script.

---

## Tech Stack

- React Native 0.81+
- Expo SDK 54+
- TypeScript
- Supabase (hosted DB & auth)
- Expo Image Picker

---

## Setup Instructions

### 1. Clone the Repository

```sh
git clone git@github.com:oilyfishball/Snowball.git
cd Snowball
```

### 2. Install Dependencies

```sh
npm install
```

### 3. Configure Environment

- Ensure `.env.local` exists in the project root with your Supabase service role key:
  ```
  SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
  ```
- The project already includes a sample `.env.local` for seeding.

### 4. Seed the Database (Optional, for fresh setup)

- Make sure you have Node.js installed.
- Run the seed script to populate Supabase with users and posts from `seed.json`:
  ```sh
  npx tsx scripts/seed.ts
  ```
- This uses the credentials in `.env.local` and the data in `seed.json`.

### 5. Start the App

- For development (choose one):
  ```sh
  npx expo start
  ```
  or
  ```sh
  npm run android
  ```
  or
  ```sh
  npm run ios
  ```
- Follow the Expo CLI instructions to open the app on your device or simulator.

---

## Usage

- **Login/Sign Up:** Use email and password to create an account or log in.
- **Feed:** Browse all posts from all users.
- **Create Post:** Add a new post (title, author, description, image). Title is required and max 25 characters.

---

## Notes

- Tested on Expo Go (Android and iOS).
- No third-party OAuth; only email/password.
- Biometric authentication is not required (email/password is allowed per spec).
- All seed data and scripts are included.

---

## Troubleshooting

- If you see errors about missing dependencies, run `npm install` again.
- If you have issues with Supabase, check your `.env.local` and Supabase project settings.
- For iOS, you must use a Mac or a cloud service to run the iOS simulator.

---

## License

This project is for educational/demo purposes only.

If you have any questions about the requirements or need clarification, please reach out to me (Sindhu) directly.

Good luck\! 🚀  
