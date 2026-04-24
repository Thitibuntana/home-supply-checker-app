# HomeStock — Supabase Setup Guide

Follow these steps to get the backend running.

---

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in (or create a free account).
2. Click **"New Project"**.
3. Choose your organization, give the project a name (e.g. `homestock`), set a database password, and pick a region close to you.
4. Click **"Create new project"** and wait ~1 minute for it to spin up.

---

## Step 2: Get Your API Keys

1. In your Supabase project dashboard, go to **Settings → API**.
2. Copy:
   - **Project URL** (looks like `https://xyzxyz.supabase.co`)
   - **anon / public key** (the long JWT string under "Project API keys")

---

## Step 3: Fill in Your `.env` File

Open the `.env` file in the root of this project and replace the placeholder values:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## Step 4: Run the Database Migration

1. In your Supabase dashboard, go to **SQL Editor** (left sidebar).
2. Click **"New query"**.
3. Open the file `supabase/migration.sql` from this project.
4. Copy and paste the **entire contents** into the SQL editor.
5. Click **"Run"** (or press `Ctrl+Enter`).

You should see a success message. This creates all tables, indexes, Row Level Security policies, and enables realtime.

---

## Step 5: Configure Authentication

1. In Supabase, go to **Authentication → Providers**.
2. Make sure **Email** is enabled (it is by default).
3. Optionally, in **Authentication → Email Templates**, you can customize the confirmation email.

> **For development/testing:** You can disable email confirmation so you can log in immediately.
> Go to **Authentication → Settings** and turn off **"Enable email confirmations"**.

---

## Step 6: Run the App

```bash
npx expo start
```

Then scan the QR code with the **Expo Go** app on your phone.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| "Invalid API key" error | Double-check your `.env` values — no trailing spaces |
| Can't join family with code | Make sure you ran the full migration SQL |
| Items not syncing in real-time | Check that `supply_items` was added to `supabase_realtime` publication (last line of migration) |
| Email confirmation loop | Disable email confirmations in Supabase Auth settings during development |

---

## Database Structure (Reference)

```
profiles          — User profiles linked to auth.users
families          — Household groups with invite codes
supply_items      — Shopping list items (shared per family)
purchase_records  — Price history per item
```
