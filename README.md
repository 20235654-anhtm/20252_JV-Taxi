[English](README.md) | [日本語](README.ja.md) | [Tiếng Việt](README.vi.md)

# JV-TAXI

This project consists of two main parts: **Backend** (Node.js + Express + TypeScript) and **Frontend** (React + TypeScript + Vite).

Below is a guide for team members to clone the source code and set it up to run locally.

## Environment Requirements

- [Node.js](https://nodejs.org/) installed (**Requirement: LTS version 18.x or higher**).
  - *Note:* If Node.js is not installed, you won't be able to run `npm` commands. If you use a version that is too old, libraries like `Prisma` or `@tailwindcss/vite` will throw errors during installation.
- Git installed.

---

## 1. Setup Backend

1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables and database connection (Supabase):
   - Create a `.env` file from the `.env.example` file in the `backend` directory.
   - Open the newly created `.env` file and replace `[YOUR-PASSWORD]` with your actual database connection password.
   - Configure Stripe variables:
     ```env
     STRIPE_SECRET_KEY=sk_test_...
     STRIPE_PUBLISHABLE_KEY=pk_test_...
     ```
4. Test the database connection:
   ```bash
   npx ts-node src/test-db.ts
   ```
   _If the terminal prints "Database connection successful!" (Kết nối database thành công!), you have configured it correctly._
5. Start the server in the development environment:
   ```bash
   npm run dev
   ```
   _The server will start running. By default, it runs on port 5000 (e.g., `http://localhost:5000`)._

---

## 2. Setup Frontend

1. Open a new terminal (keep the backend terminal running in parallel) and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend application:
   ```bash
   npm run dev
   ```

---

## 3. Stripe Visa Payment Demo Testing Guide

The project integrates a demo Visa card payment through Stripe. To test this feature, follow these steps:

### Step 1: Access the Booking Confirmation Page
1. Log in as a Passenger.
2. Complete the driver-seeking process: **Search Location** -> **Select Ride Type** -> **Select Driver**.
3. You will be redirected to the **Booking Confirmation** page (`/passenger/booking-confirmation`).

### Step 2: Enter Payment Information
1. Under **Payment Method**, choose **Card**.
2. Click **Confirm Booking**.
3. A card input popup will appear. Enter the Stripe demo card details:
   - **Card number:** `4242 4242 4242 4242`
   - **Expiration Date (MM/YY):** Any date in the future (e.g., `12/30`).
   - **CVC:** Any 3-digit number (e.g., `123`).
   - **Zip Code:** Any 5-digit number (e.g., `10000`).
4. Click **Pay Now**.

### Step 3: Check Results
- If the details are correct, a **"Payment Successful"** popup will show up along with a transaction ID (Payment ID).
- You can go to the **Profile** page to see the linked demo Visa card under your account.

---

## 4. Frontend Route Structure

### Flow for Guests (Not logged in)

| Route (URL)              | Component (`src/pages/guest/`) | Description                                         |
| :----------------------- | :----------------------------- | :-------------------------------------------------- |
| `/`                      | `GuestHome.tsx`                | Home page for guests.                               |
| `/guest/search-location` | `GuestSearchLocation.tsx`      | Page to search and select destination for guests.   |
| `/login`                 | `SignIn.tsx`                   | Login screen.                                       |
| `/signup`                | `SignUpSelection.tsx`          | Sign-up role selection screen.                      |
| `/signup/passenger`      | `PassengerSignUp.tsx`          | Passenger registration screen.                      |
| `/signup/driver`         | `DriverSignUp.tsx`             | Driver registration screen.                        |

### Flow for Passengers (Logged in)

| Route (URL)                       | Component (`src/pages/passenger/`) | Description                                         |
| :-------------------------------- | :--------------------------------- | :-------------------------------------------------- |
| `/passenger`                      | `PassengerHome.tsx`                | Home page for passengers.                           |
| `/passenger/search-location`      | `SearchLocation.tsx`               | Page to search and select destination to book a ride.|
| `/passenger/booking-options`      | `BookingOptions.tsx`               | Page to choose booking/matching options.            |
| `/passenger/select-driver`        | `SelectDriver.tsx`                 | Page listing online drivers.                        |
| `/passenger/driver-detail`        | `DriverDetail.tsx`                 | Driver detail page.                                 |
| `/passenger/booking-confirmation` | `BookingConfirmationWrapper.tsx`   | Confirmation & Stripe payment page.                 |
| `/passenger/profile`              | `Profile.tsx`                      | Personal profile and Visa card info page.           |

---

## 5. Important Notes

1. **Prisma 7 & Supabase**:
   - **Required**: Run `npx prisma generate` in the `backend` directory immediately after running `npm install`. Without this step, the code will not recognize the models (Profile, Ride, etc.), resulting in TypeScript or runtime errors when running the server.
   - Run `npx prisma generate` again whenever you modify the `schema.prisma` file.
   - Use `npm run db:seed` to seed sample data (demo accounts, driver lists).
2. **Port Conflict**:
   - Defaults: Backend runs on port **5000**, Frontend runs on port **5173**.
   - If you have other applications running on these ports, the server will throw an error or assign a different port.
   - *Note:* If the Backend port changes, you must update the API base URL in the Frontend code to prevent connection errors.
3. **Security**: Never push `.env` files containing actual secret keys to Git. The current demo utilizes Stripe test keys.

---

## Git & Ignored Files (.gitignore)

- The entire `node_modules/` folder and build directories (`dist/`, `build/`) are ignored in `.gitignore`.
- Environment variable files containing sensitive data (like `.env`) are also ignored.
