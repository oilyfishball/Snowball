
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

**Note:** If you do not have Node.js installed, download and install it from [https://nodejs.org/](https://nodejs.org/). After installation, restart your terminal and run `npm install` again.

### 3. Set Up Supabase Database

1. **Create a Supabase Project:**
   - Go to [https://app.supabase.com/](https://app.supabase.com/) and create a new project.
   - Note your Supabase project URL and API keys (anon/public and service role).


2. **Configure Environment Variables (CRUCIAL STEP):**

   ⚠️ **This step is required for the app to work! If you skip it, the app will not be able to connect to Supabase and will fail to run.**

   - In the project root, create a file named `.env.local` if it doesn't exist.
   - Add the following to your `.env.local` (replace with your actual values from the Supabase dashboard):
     ```
     SUPABASE_URL=your_supabase_project_url
     SUPABASE_ANON_KEY=your_supabase_anon_public_key
     SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
     ```
   - These environment variables are used throughout the app for both client and server operations.
   - **Where to find these values in Supabase:**

      1. Go to the [Supabase dashboard](https://app.supabase.com) and select your project.
      2. In the left sidebar, click on **Project Settings** (gear icon).
      3. Under the **API** section, you will find:
          - **SUPABASE_URL:** Labeled as "Project URL"
          - **SUPABASE_ANON_KEY:** Labeled as "anon public" under "Project API keys"
          - **SUPABASE_SERVICE_ROLE_KEY:** Labeled as "service_role" under "Project API keys"
      4. Copy these values and paste them into your `.env.local` file as shown above.

---

3. **Set Up Database Schema:**
   - In the Supabase dashboard, use the SQL editor to run the following schema and policies:
     ```sql
     -- Profiles table
     create table profiles (
       id uuid references auth.users(id) on delete cascade primary key,
       username text unique not null,
       created_at timestamptz default now() not null
     );

     -- Posts table
     create table posts (
       id uuid default gen_random_uuid() primary key,
       user_id uuid references profiles(id) on delete cascade not null,
       title text not null,
       description text,
       image_url text,
       created_at timestamptz default now() not null
     );

     -- Indexes
     create index posts_user_id_idx on posts(user_id);
     create index posts_created_at_idx on posts(created_at desc);

     -- RLS policies
     alter table profiles enable row level security;
     alter table posts enable row level security;

     create policy "Profiles are viewable by everyone"
       on profiles for select using (true);

     create policy "Users can update own profile"
       on profiles for update using (auth.uid() = id);

     create policy "Posts are viewable by everyone"
       on posts for select using (true);

     create policy "Users can create own posts"
       on posts for insert with check (auth.uid() = user_id);

     create policy "Users can update own posts"
       on posts for update using (auth.uid() = user_id);

     create policy "Users can delete own posts"
       on posts for delete using (auth.uid() = user_id);

     create policy "Authenticated users can upload post images"
       on storage.objects for insert
       to authenticated
       with check (bucket_id = 'post-images');

     create policy "Anyone can view post images"
       on storage.objects for select
       using (bucket_id = 'post-images');

     -- Trigger to auto-create profile on user signup
     create or replace function public.handle_new_user()
     returns trigger as $$
     begin
       insert into public.profiles (id, username)
       values (new.id, new.raw_user_meta_data->>'username');
       return new;
     end;
     $$ language plpgsql security definer;

     create trigger on_auth_user_created
       after insert on auth.users
       for each row execute function public.handle_new_user();
     ```

---



### 4. Seed the Database (For fresh setup)
- Run the seed script to populate Supabase with users and posts from `seed.json`:
  ```sh
  npx tsx scripts/seed.ts
  ```
- This uses the credentials in `.env.local` and the data in `seed.json`.

### 5. Install Expo Go App

Before running the app, you must install the Expo Go app on your mobile device:

- **iOS:**
  1. Open the App Store on your iPhone or iPad.
  2. Search for "Expo Go".
  3. Download and install the Expo Go app by Expo.

- **Android:**
  1. Open the Google Play Store on your Android device.
  2. Search for "Expo Go".
  3. Download and install the Expo Go app by Expo.

### 6. Start the App

To start the app, use **Expo Go** (required for all users):

- Use this to quickly test on a physical device (iOS/Android) or in a web browser.
- Starts the Expo development server and provides a QR code for the Expo Go app.
```
npx expo start
```

If you have trouble connecting your device to the development server (e.g., QR code does not work or network issues), try starting Expo with the tunnel option. This uses ngrok to create a secure tunnel:

  1. Install ngrok globally if you don't have it:

    npm install -g ngrok
  2. Start Expo with the tunnel option:

    npx expo start --tunnel

Follow the Expo CLI instructions to open the app on your physical device or in the browser.


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
