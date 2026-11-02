# EduCore AI: MVP PRD

Nov 2, 2026 · @mhk

EduCore AI lets a student upload a PDF and instantly get a simple explanation and a short quiz, so they can understand and test their own study material.

## Problem

Students find dense notes hard to understand and have no quick way to check what they learned.

## Core Features (MVP)

1. Upload a PDF document.
2. AI generates a simple explanation from the uploaded content.
3. AI generates 3–5 quiz questions based on the uploaded content.
4. Responsive interface for desktop and mobile.
5. Loading and error states provide clear user feedback.

## User Flow

1. Student opens the application.
2. Student uploads a PDF.
3. The application displays a loading state while processing.
4. AI displays the explanation.
5. AI displays a 3–5 question quiz based on the uploaded PDF.

## Error Handling

- Wrong file type: "Please upload a PDF."
- Empty or unreadable PDF: "We couldn't read this file."
- AI processing failure: "Something went wrong. Please try again."

## Out of Scope (Future)

- User authentication
- Progress tracking
- Saved study history
- Flashcards
- Voice-based learning
- Multiple file formats

## Success Criteria

Students can upload a PDF, receive an AI-generated explanation, and complete a 3–5 question quiz through a responsive interface on desktop and mobile devices.
