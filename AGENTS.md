# AGENTS.md

## Project Mission

Build and maintain a production-ready Student Attendance Management System.

Primary goal:
- Extremely simple attendance process
- Mobile-first
- Reliable image proof collection
- Easy administration

Users:
- One Admin
- Multiple Students

---

## Attendance Workflow

Students do NOT have accounts.

Students do NOT use passwords.

Students do NOT enter student IDs.

Attendance flow:

1. Open attendance page
2. Select name
3. Upload proof image
4. Optional note
5. Submit

Target completion time:
< 15 seconds

---

## Tech Stack

Required:

- React
- TypeScript
- Vite
- TailwindCSS
- Firebase Authentication
- Firebase Firestore
- Firebase Storage
- React Router
- React Hook Form
- Zod
- XLSX
- Recharts

Use latest stable versions.

TypeScript strict mode must remain enabled.

---

## Architecture Rules

Always:

1. Analyze before coding.
2. Update architecture when requirements change.
3. Generate production-ready code.
4. Prefer reusable components.
5. Prefer maintainable solutions.
6. Prefer simple solutions over clever solutions.

Never:

- Use any
- Use pseudo-code
- Use TODO placeholders
- Generate incomplete implementations
- Create dead code

---

## Database Rules

Collections:

students
attendance
dailyAttendance
customFields
bonusTransactions
settings

Never store aggregate bonus points.

Bonus points must be calculated from bonusTransactions.

---

## Attendance Rules

A student may submit attendance only once per day.

Timezone:

Asia/Ho_Chi_Minh

Duplicate prevention:

dailyAttendance/{YYYY-MM-DD_studentDocId}

Use Firestore transactions.

---

## Image Upload Rules

Image upload is mandatory.

Requirements:

- Images only
- Max 10 MB
- Preview before upload
- Store imagePath only

Do NOT permanently store download URLs.

Generate download URLs only when admin views images.

Storage path:

attendance/{year}/{month}/{studentDocId}/{uuid}.{ext}

---

## Security Rules

Students may:

- Submit attendance

Students may NOT:

- Read attendance history
- Read uploaded images
- Modify attendance
- Delete attendance
- Access admin pages

Admins may:

- Full access

Never use:

request.auth != null

as admin authorization.

Use role-based admin validation.

---

## UI Rules

Design priorities:

1. Simplicity
2. Mobile-first
3. Fast loading
4. Accessibility

Avoid:

- Fancy animations
- Complex navigation
- Unnecessary dialogs

Attendance page should fit on one screen on most phones.

---

## Statistics Rules

Dashboard must show:

- Total students
- Total attendance
- Attendance rate
- Daily attendance
- Weekly attendance
- Monthly attendance
- Top participants
- Top bonus point earners

Avoid loading entire collections when possible.

Design for future growth.

---

## Excel Rules

Support:

- Student export
- Attendance export
- Statistics export

Requirements:

- Auto column width
- Bold headers
- Vietnamese support
- Proper date formatting

---

## Coding Workflow

Before implementation:

1. Requirements Analysis
2. Database Design
3. Folder Structure
4. Security Design
5. Implementation Plan

Large features must be implemented phase-by-phase.

Do not generate the entire application at once.

---

## File Generation Rules

When creating code:

1. Show file tree first.
2. Generate complete files.
3. Explain affected files.
4. Include testing steps.
5. Verify imports.
6. Verify TypeScript types.

No partial files.

No omitted sections.

Every generated file must be runnable.