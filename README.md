# Tutoring Booking Service

A clean and modern web application for booking tutoring sessions with student tutors.

## Features

- Browse 20 expert tutors across various subjects
- Clean, modern interface following Apple's Human Interface Guidelines
- Easy booking flow with detailed session information
- Responsive design that works on all devices

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **React Hooks** - State management

## Getting Started

1. Install dependencies:
```bash
npm install
# or
pnpm install
# or
yarn install
``` 

2. Run the development server:
```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
tutoring-booking-service/
├── app/
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Home page with tutor listings
│   └── globals.css      # Global styles
├── components/
│   ├── TutorCard.tsx    # Tutor card component
│   └── BookingModal.tsx # Booking form modal
├── data/
│   └── tutors.ts        # Tutor data
└── public/              # Static assets
```

## Customization

- Edit `data/tutors.ts` to add or modify tutors
- Modify `components/TutorCard.tsx` to change the tutor card design
- Update `components/BookingModal.tsx` to customize the booking form
