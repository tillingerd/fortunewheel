# FortuneWheel – Quiz Only MVP Spec

## 1. Goal

Build a minimal working quiz + spin-the-wheel web app.

Flow:
Public game link → Registration → Quiz → Spin → Result modal.

No country, no campaign, no advanced roles in MVP.

---

## 2. User Flow

### 2.1 Public Game Page

Route:
`/g/[accessCode]`

Steps:

1. Registration
   - firstName
   - lastName
   - email (unique per game)
   - accept terms checkbox

2. Quiz
   - 3–5 questions
   - single correct answer per question
   - wrong answer → restart from question 1
   - after last correct answer:
     show message:
     “Congratulations, your answers are correct!”
     button:
     “Let’s spin the wheel!”

3. Wheel
   - shows prize slices
   - includes at least 1 “No win” slice
   - stop button becomes active shortly after spin
   - result modal:
     - prize name OR “No win”
     - link to Business Solutions page (only underlined text clickable)
     - button: “Close the game”

4. Close Game Page
   - minimal template
   - short text
   - link to Business Solutions page

---

## 3. Admin (MVP)

Route:
`/admin`

Features:
- create/edit/delete Game
- manage quiz questions + answers
- manage prizes:
  - name
  - image
  - stock quantity
- set “noWinChance” (0–100)
- view players list

Authentication:
- single admin login (hardcoded or simple auth)

---

## 4. Data Models (MVP)

Game:
- id
- name
- accessCode (6 char A-Z0-9)
- isActive
- noWinChance
- createdAt

QuizQuestion:
- id
- gameId
- text
- order

QuizAnswer:
- id
- questionId
- text
- isCorrect

Prize:
- id
- gameId
- name
- imageUrl
- stock
- wonCount

Player:
- id
- gameId
- firstName
- lastName
- email
- playedAt
- result (prizeId | null)