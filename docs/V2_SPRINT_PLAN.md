# SplitMate V2: Standalone App Sprint Plan

> **Goal**: Remove Splitwise dependency and create a fully standalone expense splitting platform with own authentication, groups, and settlement tracking.

---

## Overview

### Why V2?

- Splitwise itemized expenses require Premium ($4.99/mo)
- Users currently use Excel spreadsheets as workaround
- Cookie/OAuth issues with Splitwise API
- Full control over features and user experience

### What We're Building

```
Current (V1):                         V2 (Standalone):
┌─────────────────────┐              ┌─────────────────────┐
│  User uploads       │              │  User uploads       │
│  receipt            │              │  receipt            │
│        ↓            │              │        ↓            │
│  AI parses items    │              │  AI parses items    │
│        ↓            │              │        ↓            │
│  Users mark items   │              │  Users mark items   │
│        ↓            │              │        ↓            │
│  Posts to Splitwise │ ←── REMOVE   │  Shows "You owe X"  │
│  (requires OAuth)   │              │  (standalone)       │
└─────────────────────┘              └─────────────────────┘
```

### Timeline

| Phase | Focus | Duration |
|-------|-------|----------|
| Phase 1 | Decoupling (Auth, Groups, Settlements) | 4 weeks |
| Phase 2 | Mobile App (React Native) | 4-6 weeks |
| Phase 3 | Polish & Launch | 2 weeks |

---

## Git Strategy

### Branch Structure

```
main                    ← Production (current Splitwise version)
  │
  └── v2/standalone-app ← V2 integration branch
        │
        ├── v2/auth-system
        ├── v2/standalone-groups
        ├── v2/expense-model
        └── v2/settlements
```

### Workflow

1. Create feature branch from `v2/standalone-app`
2. Work on feature, commit frequently
3. Create PR to `v2/standalone-app`
4. Self-review and merge
5. When Phase 1 complete, merge `v2/standalone-app` to `main`

---

## Phase 1: Decoupling from Splitwise

### Sprint 1: Authentication System (Week 1)

#### SM-001: User Model and Password Hashing

**Type**: Story | **Points**: 3 | **Priority**: Highest

**Description**:  
Create a new User model in MongoDB with email/password authentication. Implement secure password hashing using bcrypt.

**Acceptance Criteria**:
- [ ] User model with fields: `email`, `passwordHash`, `name`, `createdAt`
- [ ] Email must be unique (indexed)
- [ ] Password hashed with bcrypt (12 salt rounds)
- [ ] Unit test for password hashing

**Technical Notes**:
```javascript
// backend/models/userV2.js
const userSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
```

**Learning Resources**:
- [bcrypt npm package](https://www.npmjs.com/package/bcrypt)
- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)

**Files to Create**:
- `backend/models/userV2.js`
- `backend/utils/password.js`

---

#### SM-002: Registration Endpoint

**Type**: Story | **Points**: 3 | **Priority**: Highest

**Description**:  
Create POST `/api/v2/auth/register` endpoint for new user signup.

**Acceptance Criteria**:
- [ ] Validates email format and password strength (min 8 chars)
- [ ] Returns 409 if email already exists
- [ ] Creates user with hashed password
- [ ] Returns JWT token on success
- [ ] Returns user object (without password)

**API Specification**:
```
POST /api/v2/auth/register

Request:
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe"
}

Response (201):
{
  "user": { "id": "...", "email": "...", "name": "..." },
  "token": "eyJhbG..."
}

Errors:
- 400: Invalid input
- 409: Email already exists
```

**Files to Create**:
- `backend/routes/api/authRoutesV2.js`
- `backend/utils/jwt.js`

---

#### SM-003: Login Endpoint

**Type**: Story | **Points**: 2 | **Priority**: Highest

**Description**:  
Create POST `/api/v2/auth/login` endpoint that validates credentials and returns JWT.

**Acceptance Criteria**:
- [ ] Validates email and password
- [ ] Returns 401 for invalid credentials (generic message)
- [ ] Returns JWT with 7-day expiration
- [ ] Sets httpOnly cookie with token

**API Specification**:
```
POST /api/v2/auth/login

Request:
{
  "email": "user@example.com",
  "password": "securepassword123"
}

Response (200):
{
  "user": { "id": "...", "email": "...", "name": "..." },
  "token": "eyJhbG..."
}

Errors:
- 401: Invalid credentials
```

**Security Notes**:
- Use timing-safe comparison for passwords
- Don't reveal whether email exists or password is wrong
- Log failed attempts (for future rate limiting)

---

#### SM-004: Auth Middleware

**Type**: Story | **Points**: 2 | **Priority**: Highest

**Description**:  
Create middleware that validates JWT and attaches user to request.

**Acceptance Criteria**:
- [ ] Extracts token from `Authorization: Bearer <token>` header
- [ ] Falls back to cookie if header not present
- [ ] Validates JWT signature and expiration
- [ ] Attaches user object to `req.user`
- [ ] Returns 401 for invalid/expired tokens

**Implementation**:
```javascript
// backend/routes/middlewares/authV2.js
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] 
                || req.cookies.token;
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await UserV2.findById(decoded.sub);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
```

**Files to Create**:
- `backend/routes/middlewares/authV2.js`

---

#### SM-005: Frontend Login/Register Pages

**Type**: Story | **Points**: 5 | **Priority**: High

**Description**:  
Create login and registration pages in Next.js with form validation.

**Acceptance Criteria**:
- [ ] `/v2/auth/login` page with email/password form
- [ ] `/v2/auth/register` page with name/email/password form
- [ ] Client-side validation using react-hook-form + zod
- [ ] Loading states during API calls
- [ ] Error display for invalid credentials
- [ ] Redirect to `/v2/dashboard` on success
- [ ] "Already have an account?" / "Create account" links

**UI Components Needed**:
- Use existing shadcn/ui components (Input, Button, Card, Form)

**Files to Create**:
- `app/src/app/v2/auth/login/page.tsx`
- `app/src/app/v2/auth/register/page.tsx`
- `app/src/app/v2/auth/layout.tsx`
- `app/src/client/authV2.ts`
- `app/src/hooks/use-auth-v2.ts`

---

### Sprint 2: Standalone Groups (Week 2)

#### SM-006: Standalone Group Model

**Type**: Story | **Points**: 3 | **Priority**: Highest

**Description**:  
Create a Group model independent of Splitwise.

**Acceptance Criteria**:
- [ ] Group model with: `name`, `creatorId`, `members[]`, `inviteCode`, `createdAt`
- [ ] Members array contains user ObjectId references
- [ ] Unique 8-character alphanumeric invite code
- [ ] Index on `inviteCode` for fast lookups
- [ ] Index on `members` for user's groups query

**Schema**:
```javascript
const groupSchema = new Schema({
  name: { type: String, required: true },
  creatorId: { type: Schema.Types.ObjectId, ref: 'UserV2', required: true },
  members: [{ type: Schema.Types.ObjectId, ref: 'UserV2' }],
  inviteCode: { type: String, unique: true, required: true },
  createdAt: { type: Date, default: Date.now }
});
```

**Files to Create**:
- `backend/models/groupV2.js`
- `backend/utils/inviteCode.js`

---

#### SM-007: Group CRUD Endpoints

**Type**: Story | **Points**: 5 | **Priority**: Highest

**Description**:  
Implement RESTful endpoints for group management.

**Acceptance Criteria**:
- [ ] `POST /api/v2/groups` - Create group
- [ ] `GET /api/v2/groups` - List user's groups
- [ ] `GET /api/v2/groups/:id` - Get group with populated members
- [ ] `PUT /api/v2/groups/:id` - Update group name (creator only)
- [ ] `DELETE /api/v2/groups/:id` - Delete group (creator only)

**API Specifications**:
```
POST /api/v2/groups
{ "name": "Roommates" }
→ 201: { group: {...}, inviteCode: "ABC12345" }

GET /api/v2/groups
→ 200: { groups: [...] }

GET /api/v2/groups/:id
→ 200: { group: {..., members: [{id, name, email}...]} }
```

**Files to Create**:
- `backend/routes/api/groupRoutesV2.js`

---

#### SM-008: Join Group via Invite Code

**Type**: Story | **Points**: 3 | **Priority**: High

**Description**:  
Allow users to join groups using invite code or link.

**Acceptance Criteria**:
- [ ] `POST /api/v2/groups/join/:inviteCode` - Join group
- [ ] Returns 404 if code invalid
- [ ] Returns 409 if already a member
- [ ] Adds user to members array
- [ ] Frontend route `/v2/join/:code` handles deep links

**Files to Create/Modify**:
- `backend/routes/api/groupRoutesV2.js`
- `app/src/app/v2/join/[code]/page.tsx`

---

#### SM-009: Frontend Groups Dashboard

**Type**: Story | **Points**: 5 | **Priority**: High

**Description**:  
Dashboard showing user's groups with create/join functionality.

**Acceptance Criteria**:
- [ ] List all groups user is member of
- [ ] "Create Group" button → modal with name input
- [ ] "Join Group" button → modal with invite code input
- [ ] Group cards show: name, member count, your balance
- [ ] Copy invite link button
- [ ] Click card → navigate to group detail

**Files to Create**:
- `app/src/app/v2/dashboard/page.tsx`
- `app/src/app/v2/dashboard/create-group-modal.tsx`
- `app/src/app/v2/dashboard/join-group-modal.tsx`
- `app/src/app/v2/dashboard/group-card.tsx`
- `app/src/client/groupsV2.ts`

---

### Sprint 3: Expenses & Settlements (Week 3)

#### SM-010: Adapt Expense Model for Standalone

**Type**: Story | **Points**: 3 | **Priority**: Highest

**Description**:  
Create V2 expense model that works without Splitwise.

**Acceptance Criteria**:
- [ ] Add `payerId` field (who paid the bill)
- [ ] Add `totalAmount` computed field
- [ ] Remove Splitwise-specific fields
- [ ] Keep existing `items` and `participation` structure
- [ ] Add `status`: 'pending' | 'finalized'

**Schema**:
```javascript
const expenseSchemaV2 = new Schema({
  groupId: { type: Schema.Types.ObjectId, ref: 'GroupV2', required: true },
  payerId: { type: Schema.Types.ObjectId, ref: 'UserV2', required: true },
  description: String,
  items: [{
    name: String,
    quantity: Number,
    price: Number,
    participation: { type: Map, of: Boolean }
  }],
  status: { type: String, enum: ['pending', 'finalized'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});
```

**Files to Create**:
- `backend/models/expenseV2.js`

---

#### SM-011: Calculate "Who Owes Whom"

**Type**: Story | **Points**: 5 | **Priority**: Highest

**Description**:  
Implement debt calculation and simplification algorithm.

**Acceptance Criteria**:
- [ ] Calculate each person's share based on item participation
- [ ] Aggregate across all finalized expenses in group
- [ ] Return net balances per user
- [ ] Implement debt simplification (minimize transactions)

**Algorithm Overview**:
```
1. For each expense:
   - For each item: split price among participants
   - Track: who owes what to the payer

2. Aggregate all debts in group

3. Simplify debts:
   - Calculate net balance for each person
   - Positive = is owed money, Negative = owes money
   - Match debtors with creditors to minimize transactions
```

**Example**:
```
Before simplification:
  A owes B: $10
  B owes C: $15
  C owes A: $5

After simplification:
  A owes C: $5
  B owes C: $5
```

**Files to Create**:
- `backend/utils/debtCalculator.js`
- `backend/utils/debtSimplifier.js`
- `backend/routes/api/balanceRoutesV2.js`

**Learning Resources**:
- [Splitwise's Algorithm Blog Post](https://www.splitwise.com/blog/tech/algorithm/)
- This is a graph problem - great for interviews!

---

#### SM-012: Settlement Recording

**Type**: Story | **Points**: 3 | **Priority**: High

**Description**:  
Allow users to record payments between members.

**Acceptance Criteria**:
- [ ] `POST /api/v2/settlements` - Record payment
- [ ] Fields: `payerId`, `payeeId`, `amount`, `groupId`, `note`
- [ ] Both parties can view settlement
- [ ] Settlements affect balance calculations

**Schema**:
```javascript
const settlementSchema = new Schema({
  groupId: { type: Schema.Types.ObjectId, ref: 'GroupV2' },
  payerId: { type: Schema.Types.ObjectId, ref: 'UserV2' },
  payeeId: { type: Schema.Types.ObjectId, ref: 'UserV2' },
  amount: { type: Number, required: true },
  note: String,
  createdAt: { type: Date, default: Date.now }
});
```

**Files to Create**:
- `backend/models/settlement.js`
- `backend/routes/api/settlementRoutesV2.js`

---

#### SM-013: Frontend Balance & Settlement View

**Type**: Story | **Points**: 5 | **Priority**: High

**Description**:  
Show balances and allow recording settlements.

**Acceptance Criteria**:
- [ ] "Balances" tab in group view
- [ ] Shows net balance: "You owe $X" or "You are owed $X"
- [ ] Detailed breakdown: "You owe Sarah $15, Mike owes you $8"
- [ ] "Settle Up" button → record payment modal
- [ ] Settlement history list

**Files to Create**:
- `app/src/app/v2/group/[id]/balances/page.tsx`
- `app/src/app/v2/group/[id]/settle-modal.tsx`
- `app/src/client/settlementsV2.ts`

---

### Sprint 4: Integration & Cleanup (Week 4)

#### SM-014: Mount V2 Routes and Feature Flag

**Type**: Story | **Points**: 3 | **Priority**: High

**Description**:  
Integrate V2 routes into the Express app with feature flag.

**Acceptance Criteria**:
- [ ] Mount all V2 routes under `/api/v2/`
- [ ] V1 routes continue to work unchanged
- [ ] Environment variable `ENABLE_V2=true` to enable
- [ ] V2 auth middleware only on V2 routes

**Files to Modify**:
- `backend/app.js`

---

#### SM-015: End-to-End Testing

**Type**: Story | **Points**: 5 | **Priority**: Medium

**Description**:  
Write E2E tests for critical user flows.

**Test Scenarios**:
- [ ] Register → Login → Create Group
- [ ] Join Group via Invite Code
- [ ] Add Expense → Set Participation → Finalize
- [ ] View Balances → Record Settlement

**Tools**: Playwright or Cypress

---

## Sprint Velocity & Tracking

### Story Points per Sprint

| Sprint | Stories | Total Points |
|--------|---------|--------------|
| Sprint 1 | SM-001 to SM-005 | 15 pts |
| Sprint 2 | SM-006 to SM-009 | 16 pts |
| Sprint 3 | SM-010 to SM-013 | 16 pts |
| Sprint 4 | SM-014 to SM-015 | 8 pts |
| **Total** | **15 stories** | **55 pts** |

### Definition of Done

- [ ] Code complete and working
- [ ] At least one test written
- [ ] No linter errors
- [ ] Self-reviewed
- [ ] Merged to `v2/standalone-app`

---

## Environment Variables (New for V2)

```env
# Add to .env
JWT_SECRET=your-secure-secret-key-min-32-chars
JWT_EXPIRES_IN=7d
ENABLE_V2=true
```

---

## File Structure (New for V2)

```
backend/
├── models/
│   ├── userV2.js          (SM-001)
│   ├── groupV2.js         (SM-006)
│   ├── expenseV2.js       (SM-010)
│   └── settlement.js      (SM-012)
├── routes/
│   ├── api/
│   │   ├── authRoutesV2.js      (SM-002, SM-003)
│   │   ├── groupRoutesV2.js     (SM-007, SM-008)
│   │   ├── balanceRoutesV2.js   (SM-011)
│   │   └── settlementRoutesV2.js (SM-012)
│   └── middlewares/
│       └── authV2.js            (SM-004)
└── utils/
    ├── password.js              (SM-001)
    ├── jwt.js                   (SM-002)
    ├── inviteCode.js            (SM-006)
    ├── debtCalculator.js        (SM-011)
    └── debtSimplifier.js        (SM-011)

app/src/
├── app/
│   └── v2/
│       ├── auth/
│       │   ├── login/page.tsx   (SM-005)
│       │   └── register/page.tsx (SM-005)
│       ├── dashboard/
│       │   └── page.tsx         (SM-009)
│       ├── group/
│       │   └── [id]/
│       │       ├── page.tsx
│       │       └── balances/page.tsx (SM-013)
│       └── join/
│           └── [code]/page.tsx  (SM-008)
├── client/
│   ├── authV2.ts               (SM-005)
│   ├── groupsV2.ts             (SM-009)
│   └── settlementsV2.ts        (SM-013)
└── hooks/
    └── use-auth-v2.ts          (SM-005)
```

---

## Learning Log Template

For each story, document what you learned:

```markdown
## SM-XXX: [Story Title]

### What I Built
- Brief description

### What I Learned
- Key concept 1
- Key concept 2

### Challenges Faced
- Challenge and how I solved it

### Resources Used
- Link 1
- Link 2

### Blog Post Idea
- Potential article topic from this story
```

---

## Next Steps

1. [ ] Set up git branches (see Git Strategy section)
2. [ ] Start SM-001: User Model
3. [ ] Document learnings as you go
4. [ ] Write first blog post: "Why I'm Building My Own Expense Splitter"

---

*Last Updated: January 2026*
*Author: Jenish Kothari*
