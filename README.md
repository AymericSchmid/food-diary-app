# Food Diary App

## Overview

This project is a mobile-first AI-powered food diary app. Users can create an account, complete a basic nutrition profile, log meals either from a photo or manually, and review their daily energy intake in a diary view.

For photo-based logging, the app uses the LogMeal API to detect food regions in a meal image, display bounding boxes, and suggest dish names for each detected region. The user can then confirm or correct the detected foods before the app fetches nutritional information. The estimated serving size can be adjusted manually, and the calories are updated accordingly before the meal is saved.

For manual logging, the app lets users search the LogMeal ingredient catalogue, select one or more ingredients, adjust the amount eaten, and compute the energy value before saving the composed meal to the diary.

The app is built as a web app, but designed primarily for standard smartphone screens. I chose this approach because it allowed me to build and deploy a realistic mobile experience quickly while still using a modern full-stack TypeScript setup.

## Features

### Authentification

Users must create an account and log in before accessing the diary, logging, or profile screens.

### User profile and BMI

The profile page allows users to save basic personal information, including age, sex, weight, height, nutrition goal, dietary preference, and physical activity level.

When weight and height are entered, the app automatically calculates and displays the user's Body Mass Index (BMI).

### Photo-based meal logging

Users can log a meal by either taking a new photo with their phone camera or choosing an existing image from their gallery.

Before sending the image to LogMeal, the app resizes and compresses it in the browser to avoid file-size issues with large phone photos. The image is then sent to the LogMeal segmentation endpoint through a private Next.js API route.

After analysis, the app displays bounding boxes on top of the image. For each detected region, the user can review the top candidate dishes, select the correct one, or remove a false detection.

Once the user confirms the foods, the app fetches nutritional information. The user can then edit the serving amount in grams or millilitres, and the calorie value is adjusted automatically before saving.

Photo-based entries are saved to the diary together with the analyzed meal image.

### Manual meal logging

Users can also log meals manually without using a photo. The app loads the LogMeal ingredient catalogue, caches it, and filters it client-side as the user types.

Users can select one or more ingredients, adjust the amount eaten for each ingredient, and compose them into a single meal. The app calls the LogMeal nutrient computation endpoint to calculate the energy value before saving.

### Food diary

The diary shows previously logged meals by day. Users can move between days, inspect the meals logged on the selected date, and see the total daily energy intake in kilocalories.

Each meal card displays the meal name, logging type, time, total calories, and individual food items with their amount, unit, and calorie value. For photo-based meals, the saved image is also shown visually in the diary card.

### API error handling

The app shows clearer error messages when LogMeal cannot process a request, when the image is invalid, or when API access is unavailable.

## Tech Stack

I chose a full-stack TypeScript setup that would let me build quickly while still keeping the project clean and deployable.

### Next.js App Router

Next.js is used for both frontend pages and backend API routes. The browser calls internal routes such as `/api/logmeal/segmentation`, while those server routes call LogMeal with the private API token.

### TypeScript

TypeScript helped keep the data structures clear across LogMeal responses, Supabase rows, React state, and UI components.

### Tailwind CSS and shadcn/ui

Tailwind CSS was used for fast mobile-first styling. shadcn/ui provided reusable components such as cards, buttons, inputs, etc. I chose shadcn/ui because it looks polished in a short timeframe.

### Supabase

Supabase is used for authentification, database storage, and image storage. It made it possible to add sign up/login, persistent diary entries, user profiles, and meal image uploads without building this infrastructure from scratch. Row Level Security is used so that users can only access their own data.

### LogMeal API

LogMeal provides the AI food analysis and nutrition data. The app uses it for photo segmentation, dish confirmation, nutritional information and ingredient search.

### Vercel

Vercel is used for deployment because it works very smoothly with Next.js and support server-side API routes and environment variables out of the box.

## Architecture

The app is built as a single Next.js project with both frontend pages and backend API routes.

React components handle the user interface, form state, photo previews, meal composition, and diary display. Pages that require authentication are placed inside a protected route group.

The backend logic lives in Next.js API routes under `/api/logmeal`. These routes act as a secure middle layer between the browser and the LogMeal API. The browser never calls LogMeal directly.

The main flow is:

```txt
User on mobile browser
→ Next.js page or component
→ Internal Next.js API route
→ LogMeal API or Supabase
→ Response displayed in the app
```

Supabase handles authentication, database persistence, and image storage. This keeps the responsibilities clear: React handles the interface, API routes handle LogMeal calls, and Supabase handles user data.

## Database Schema

The db is kept simple. It only stores the information needed for user profiels, diary entries, meal items, and photo-based meals.

### `profiles`

Stores optional personal information for each user, including age, sex, weight, height, goal, dietary preference, and activity level.

### `diary_entries`

The `diary_entries` table represents one logged meal.

Represents one logged meal. It stores the user id, meal name, logging type (`photo` or `manual`), total energy in kilocalories, meal date/time, and an optional image URL for photo-based entries.

### `diary_items`

Stores the individual foods or ingredients inside a diary entry. Each item contains the food name, amount, unit, LogMeal ID, and energy in kilocalories.

### Supabase Storage

Photo-based meals store the analyzed image in a Supabase Storage bucket called `meal-images`. The image URL is saved in `diary_entries.image_url`.

### Row Level Security

Row Level Security is enabled so users can only access their own data. Storage uploads are also scoped by user.

## Local Setup and Reproducibility

Clone the repository and install the dependencies.

```bash
git clone <repository-url>
cd <project-folder>
npm install
```

Create a `.env.local` file at the root of the project:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
LOGMEAL_API_TOKEN=
```

The Supabase variables are used for authentication, database access, and storage. The LogMeal token is only used inside server-side API routes.

The repository includes a `db_definition.sql` file at the root of the project. To prepare the database, create a Supabase project and run the contents of this file in the Supabase SQL Editor.

The app expects the following main tables to exist:

```bash
profiles
diary_entries
diary_items
```

It also expects a Supabase Storage bucket named:

```txt
meal-images
```

After the environment variables and Supabase setup are ready, start the development server:

```bash
npm run dev
```

Then open:

```txt
http://localhost:3000
```