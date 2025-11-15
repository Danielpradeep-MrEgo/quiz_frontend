"# quiz_frontend" 
You are my coding agent. Build a complete **Next.js frontend (App Router)** for a
"Quiz Management System" backend that uses Flask + MongoDB.

There is NO authentication and NO JWT required.

==================================================
🎯 FRONTEND REQUIREMENTS
==================================================

Build a modern, clean UI for the following features:

==============================
📌 PUBLIC PAGES
==============================

1. Home Page (/)
   - Show list of published quizzes
   - Card layout with title + description + “Take Quiz” button

2. Quiz Page (/quiz/[slug])
   - Fetch quiz by slug
   - Display quiz questions
   - Support question types:
       • MCQ single choice
       • MCQ multiple choice
       • True/False
       • Text response
   - A submit button to send answers to:
       POST /quizzes/<slug>/attempt
   - After submission → redirect to results page

3. Results Page (/quiz/[slug]/result?attemptId=)
   - Show score
   - Show correct/incorrect answers
   - List each question with:
       • User answer
       • Correct answer
       • Points earned

==============================
📌 ADMIN PAGES (NO LOGIN REQUIRED)
==============================

1. Admin Dashboard (/admin)
   - List all quizzes
   - Buttons: create, edit, delete

2. Create Quiz Page (/admin/create)
   - Form:
       • title
       • description
       • published toggle
   - After quiz creation → redirect to question builder

3. Edit Quiz Page (/admin/[id])
   - Edit the quiz fields
   - View list of questions with options to:
        • Add question
        • Edit question
        • Delete question

4. Question Builder Pages:
   - /admin/[quizId]/add-question
   - /admin/question/[questionId]
     Should support:
        • Type dropdown (MCQ_SINGLE, MCQ_MULTI, TRUE_FALSE, TEXT)
        • Question text
        • Choice management
        • Correct answer selection
        • Points

==================================================
🎨 UI / TECH STACK
==================================================

Use the following:

✔ Next.js 14 App Router  
✔ TailwindCSS  
✔ TypeScript  
✔ React Hooks  
✔ Server components for pages  
✔ Client components for forms  
✔ API utility wrapper for calling Flask backend  
✔ Clean minimal styling (cards, buttons, inputs)

Reusable UI components to generate:

- Button
- Input
- Select
- Checkbox
- RadioGroup
- Card
- Loader
- Form components

==================================================
📁 REQUIRED FOLDER STRUCTURE
==================================================

Generate the complete project structure:

/app
  /page.tsx
  /quiz/[slug]/page.tsx
  /quiz/[slug]/result/page.tsx
  /admin/page.tsx
  /admin/create/page.tsx
  /admin/[id]/page.tsx
  /admin/[quizId]/add-question/page.tsx
  /admin/question/[questionId]/page.tsx

/components
  Button.tsx
  Input.tsx
  Select.tsx
  Checkbox.tsx
  RadioGroup.tsx
  Card.tsx
  Loader.tsx
  Form.tsx

/lib
  api.ts  (handles all axios/fetch wrappers)
  types.ts (Quiz, Question, Attempt types)

==================================================
🔌 BACKEND API ENDPOINTS TO CONNECT TO
==================================================

The frontend should connect to the Flask backend endpoints:

PUBLIC:
GET  /quizzes
GET  /quizzes/:slug
POST /quizzes/:slug/attempt

ADMIN (NO AUTH):
GET    /admin/quizzes
POST   /admin/quizzes
GET    /admin/quizzes/:id
PUT    /admin/quizzes/:id
DELETE /admin/quizzes/:id

QUESTIONS:
POST   /admin/quizzes/:quizId/questions
PUT    /admin/questions/:questionId
DELETE /admin/questions/:questionId

Make a central API wrapper for all these.

==================================================
🧪 VALIDATION
==================================================
Include minimal validation for:

- Required fields
- At least 2 choices for MCQ
- At least 1 correct answer for MCQ

==================================================
📝 DELIVERABLES
==================================================

Cursor must output:

1. Full Next.js codebase with all pages & components
2. TailwindCSS setup
3. API wrapper file
4. Type definitions
5. All forms & UI logic
6. Working CRUD for quizzes and questions
7. A complete quiz-taking experience
8. A results page with score breakdown
9. README with setup + environment variables

==================================================
Now generate the full frontend codebase exactly as described.
