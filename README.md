# Quiz Management System - Frontend

A modern, full-featured Next.js frontend for a Quiz Management System built with TypeScript, TailwindCSS, and the App Router.

## Features

### Public Pages
- **Home Page** (`/`) - Browse and take published quizzes
- **Quiz Page** (`/quiz/[slug]`) - Take quizzes with support for multiple question types
- **Results Page** (`/quiz/[slug]/result`) - View detailed quiz results with score breakdown

### Admin Pages (No Authentication Required)
- **Admin Dashboard** (`/admin`) - Manage all quizzes
- **Create Quiz** (`/admin/create`) - Create new quizzes
- **Edit Quiz** (`/admin/[id]`) - Edit quiz details and manage questions
- **Add Question** (`/admin/[quizId]/add-question`) - Add questions to quizzes
- **Edit Question** (`/admin/question/[questionId]`) - Edit existing questions

### Question Types Supported
- **MCQ Single Choice** - Multiple choice with one correct answer
- **MCQ Multiple Choice** - Multiple choice with multiple correct answers
- **True/False** - Binary choice questions
- **Text Response** - Free-form text answers

## Tech Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **TailwindCSS v4**
- **Axios** - HTTP client for API calls
- **React Hooks** - State management

## Project Structure

```
/app
  /page.tsx                    # Home page
  /quiz
    /[slug]
      /page.tsx                # Quiz taking page
      /result
        /page.tsx              # Results page
  /admin
    /page.tsx                  # Admin dashboard
    /create
      /page.tsx                # Create quiz page
    /[id]
      /page.tsx                # Edit quiz page
    /[quizId]
      /add-question
        /page.tsx              # Add question page
    /question
      /[questionId]
        /page.tsx              # Edit question page
/components
  Button.tsx                   # Reusable button component
  Input.tsx                    # Input field component
  Select.tsx                   # Select dropdown component
  Checkbox.tsx                 # Checkbox component
  RadioGroup.tsx               # Radio button group component
  Card.tsx                     # Card container component
  Loader.tsx                   # Loading spinner component
  Form.tsx                     # Form wrapper component
/lib
  api.ts                       # API wrapper for all backend calls
  types.ts                     # TypeScript type definitions
```

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Flask backend running (see backend setup)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```
   
   Update `NEXT_PUBLIC_API_URL` to match your Flask backend URL.

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Base URL for the Flask backend API | `http://localhost:5000` |

## API Integration

The frontend connects to the following Flask backend endpoints:

### Public Endpoints
- `GET /quizzes` - Get all published quizzes
- `GET /quizzes/:slug` - Get quiz by slug
- `POST /quizzes/:slug/attempt` - Submit quiz attempt
- `GET /quizzes/:slug/result?attemptId=:id` - Get attempt results

### Admin Endpoints
- `GET /admin/quizzes` - Get all quizzes (admin)
- `POST /admin/quizzes` - Create new quiz
- `GET /admin/quizzes/:id` - Get quiz by ID
- `PUT /admin/quizzes/:id` - Update quiz
- `DELETE /admin/quizzes/:id` - Delete quiz
- `POST /admin/quizzes/:quizId/questions` - Create question
- `PUT /admin/questions/:questionId` - Update question
- `DELETE /admin/questions/:questionId` - Delete question

All API calls are handled through the centralized API wrapper in `/lib/api.ts`.

## Validation

The frontend includes validation for:
- Required fields (title, description, question text)
- Minimum 2 choices for MCQ questions
- At least 1 correct answer for MCQ questions
- Minimum 1 point per question
- Answer validation before quiz submission

## UI Components

All reusable components are located in `/components`:
- **Button** - Primary, secondary, danger, and outline variants
- **Input** - Text input with label and error handling
- **Select** - Dropdown select with options
- **Checkbox** - Checkbox with label
- **RadioGroup** - Radio button group
- **Card** - Container card with shadow
- **Loader** - Loading spinner (sm, md, lg sizes)
- **Form** - Form wrapper component

## Styling

The project uses TailwindCSS v4 with a modern, clean design:
- Purple primary color scheme
- Responsive grid layouts
- Card-based UI
- Smooth transitions and hover effects
- Mobile-friendly responsive design

## Development Notes

### Client vs Server Components
- Public pages (Home) use Server Components for better performance
- Interactive pages (Quiz, Admin) use Client Components for state management
- Forms and interactive elements are Client Components

### Type Safety
All API responses and data structures are typed using TypeScript interfaces defined in `/lib/types.ts`.

### Error Handling
- API errors are caught and displayed to users
- Form validation provides immediate feedback
- Loading states prevent duplicate submissions

## Troubleshooting

### API Connection Issues
- Verify `NEXT_PUBLIC_API_URL` is correct in `.env.local`
- Ensure Flask backend is running
- Check CORS settings on backend if requests fail

### Build Errors
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run lint`

## License

This project is part of a Quiz Management System.
