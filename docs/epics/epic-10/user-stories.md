# User Stories

## Phase 1: Foundation & RBAC (Week 1 - 34 points)

### Story 10.1: Database Schema for OAuth & Invitations (8 pts)
**As a** developer
**I want** database tables for OAuth providers, user invitations, and activity logs
**So that** the system can support Google authentication and user invitation workflows

**Acceptance Criteria**:
- [ ] Migration 004_add_oauth.sql creates oauth_providers table with indexes
- [ ] Migration 005_add_invitations.sql creates user_invitations table
- [ ] Migration 006_update_users.sql adds: profile_picture_url, last_login_at, registration_method
- [ ] Migration 007_update_refresh_tokens.sql adds remember_me column, removes unique constraint
- [ ] Migration 008_add_activity_logs.sql creates user_activity_logs table
- [ ] All migrations run successfully with `npm run migrate`
- [ ] Database indexes created for optimal query performance

**Definition of Done**:
- Migrations tested on clean database and existing data
- All foreign keys and constraints functional
- Indexes verified with EXPLAIN ANALYZE

---

### Story 10.2: RBAC Authorization Middleware (8 pts)
**As a** developer
**I want** role-based authorization middleware
**So that** API endpoints are protected based on user roles

**Acceptance Criteria**:
- [ ] Create `apps/api/src/middleware/authorization.ts`
- [ ] Export `authorize(allowedRoles: string[])` function
- [ ] Returns 403 Forbidden if role not in allowedRoles
- [ ] Returns 401 Unauthorized if req.user not present
- [ ] Authorization failures logged with user_id, path, role
- [ ] Unit tests cover all scenarios (valid role, invalid role, no user)
- [ ] Integration tests verify protected endpoints work correctly

**Definition of Done**:
- Middleware applied to all protected routes
- 100% test coverage for authorization.ts
- Security audit confirms proper role enforcement

---

### Story 10.3: Frontend RBAC Hooks & Route Guards (8 pts)
**As a** frontend developer
**I want** permission hooks and route guards
**So that** UI elements are hidden/shown based on user role

**Acceptance Criteria**:
- [ ] Create `apps/web/src/hooks/usePermissions.ts` hook
- [ ] Hook returns: canManageUsers, canEditPartnerships, canEditOpportunities, canViewDashboards
- [ ] Update ProtectedRoute component to accept optional allowedRoles prop
- [ ] Unauthorized route access redirects to /403 page
- [ ] Create 403 Forbidden page with clear message
- [ ] Update SidebarNavigation to conditionally render menu items
- [ ] Admin navigation item only visible to system_owner
- [ ] Edit buttons hidden/disabled based on permissions

**Definition of Done**:
- All components updated to use permission checks
- No edit buttons visible to viewer role
- Tests confirm all permission scenarios

---

### Story 10.4: Enhanced Auth Service - Remember Me (5 pts)
**As a** backend developer
**I want** to add "remember me" functionality
**So that** users can stay logged in for 30 days instead of 7

**Acceptance Criteria**:
- [ ] Update login method: `login(email, password, rememberMe = false)`
- [ ] When rememberMe = true, refresh token expires in 30 days
- [ ] When rememberMe = false, refresh token expires in 7 days
- [ ] Update storeRefreshToken to save remember_me boolean
- [ ] POST /api/auth/login accepts rememberMe in request body
- [ ] Unit tests cover both remember me scenarios

**Definition of Done**:
- Login with rememberMe=true creates 30-day token
- All tests passing

---

### Story 10.5: Frontend Remember Me Checkbox (3 pts)
**As a** user
**I want** a "Remember me" checkbox on login
**So that** I stay logged in for 30 days

**Acceptance Criteria**:
- [ ] Login form displays "Remember me for 30 days" checkbox
- [ ] Checkbox unchecked by default
- [ ] Checkbox state stored in localStorage as 'rememberMe' preference
- [ ] On subsequent visits, checkbox pre-checked if preference was true
- [ ] Login request includes rememberMe boolean in request body
- [ ] Mobile responsive (checkbox visible on small screens)

**Definition of Done**:
- Checkbox functional and styled
- Remember preference persists across reloads

---

### Story 10.6: Activity Logging Infrastructure (5 pts)
**As a** system owner
**I want** activity logging for all auth events
**So that** I can audit user access and detect security issues

**Acceptance Criteria**:
- [ ] Create `apps/api/src/services/activityLogService.ts`
- [ ] Service exports `logActivity(userId, action, method, ip, userAgent)` method
- [ ] Actions tracked: login_success, login_failed, logout, password_changed, oauth_linked, role_changed
- [ ] Auth service logs all login attempts (success and failure)
- [ ] Failed login attempts logged with email (not just user_id)
- [ ] Service handles errors gracefully (logging failure doesn't break main flow)

**Definition of Done**:
- All auth actions logged
- Query performance < 50ms for recent 50 logs

---

## Phase 2: Google OAuth Integration (Week 2 - 26 points)

### Story 10.7: Google OAuth Backend Service (13 pts)
**As a** user
**I want** to login with my Google account
**So that** I can access the system without creating a password

**Acceptance Criteria**:
- [ ] Create `apps/api/src/services/oauthService.ts`
- [ ] Implement `getGoogleAuthUrl(state, codeChallenge)` method
- [ ] Implement `exchangeCodeForTokens(code, codeVerifier)` method
- [ ] Implement `getUserProfile(accessToken)` method
- [ ] Implement `findOrCreateUser(googleProfile)` method
- [ ] Use googleapis npm package for Google API calls
- [ ] OAuth URL includes scopes: openid, email, profile
- [ ] PKCE code_challenge and code_verifier for enhanced security
- [ ] If email exists, links OAuth to existing user
- [ ] If email doesn't exist, creates new user with role='viewer'
- [ ] Unit tests mock Google API calls

**Definition of Done**:
- OAuth service fully functional
- PKCE security implemented
- All tests passing

---

### Story 10.8: Google OAuth API Routes (8 pts)
**As a** developer
**I want** OAuth endpoints
**So that** the OAuth flow can be initiated and completed

**Acceptance Criteria**:
- [ ] Create `apps/api/src/routes/oauth.ts`
- [ ] GET /api/oauth/google generates OAuth URL and redirects
- [ ] Generate cryptographic state (UUID) and code_challenge
- [ ] Store state and code_verifier in Redis (expires in 10 minutes)
- [ ] GET /api/oauth/google/callback validates state, exchanges code for tokens
- [ ] Callback generates JWT tokens (access + refresh)
- [ ] Callback redirects to frontend with tokens in URL fragment
- [ ] Error scenarios redirect to login with error message
- [ ] Activity log records oauth_linked event
- [ ] Rate limiting: max 10 OAuth attempts per IP per hour

**Definition of Done**:
- OAuth flow works end-to-end
- State validation prevents CSRF
- Errors handled gracefully

---

### Story 10.9: Frontend Google OAuth Button & Callback (5 pts)
**As a** user
**I want** a "Sign in with Google" button
**So that** I can login quickly with my Google account

**Acceptance Criteria**:
- [ ] Login page displays Google button prominently (above email/password form)
- [ ] Button uses Google brand guidelines (colors, logo, text)
- [ ] Clicking button redirects to GET /api/oauth/google
- [ ] Create /auth-callback route that handles OAuth redirect
- [ ] Callback route extracts tokens from URL fragment
- [ ] Callback route stores tokens in authStore and redirects to dashboard
- [ ] Error parameter shows error message
- [ ] Works on mobile devices (responsive button)

**Definition of Done**:
- Google button visible and styled correctly
- OAuth flow completes successfully
- User logged in and redirected to dashboard

---

## Phase 3: User Invitation System (Week 3 - 21 points)

### Story 10.10: Invitation Service & API (13 pts)
**As a** system owner
**I want** to invite users via email
**So that** I can control who has access to the system

**Acceptance Criteria**:
- [ ] Create `apps/api/src/services/invitationService.ts`
- [ ] Service methods: createInvitation, getInvitationByToken, acceptInvitation, revokeInvitation, resendInvitation
- [ ] createInvitation generates unique token (crypto.randomBytes(32))
- [ ] Invitation expires in 7 days
- [ ] Email sent via nodemailer or SendGrid
- [ ] Email template branded with Partman logo
- [ ] Create 7 API endpoints (POST /invitations, GET /invitations, GET /invitations/:token, etc.)
- [ ] acceptInvitation validates token not expired, not already used
- [ ] acceptInvitation creates user and auto-logs them in
- [ ] Activity logs track invitation events

**Definition of Done**:
- All service methods functional
- Email sent successfully
- Invitation expiry enforced
- API endpoints protected with authorization

---

### Story 10.11: Frontend Invite User Dialog (5 pts)
**As a** system owner
**I want** an "Invite User" button in user management
**So that** I can easily add new team members

**Acceptance Criteria**:
- [ ] User management page has "Invite User" button (top-right, primary color)
- [ ] Button only visible to system_owner role
- [ ] Clicking opens Material-UI Dialog
- [ ] Form fields: email (required), first name (required), last name (required), role (dropdown)
- [ ] Role dropdown options: System Owner, VP, Sales Manager, Sales Rep, Viewer
- [ ] Form validation: all fields required, email format validated
- [ ] Success closes dialog and shows snackbar: "Invitation sent to {email}"
- [ ] Dialog mobile-responsive

**Definition of Done**:
- Dialog functional and styled
- Form validation works
- Invitation sent successfully

---

### Story 10.12: Registration Page for Invited Users (8 pts)
**As an** invited user
**I want** to click the registration link and set my password
**So that** I can create my account easily

**Acceptance Criteria**:
- [ ] Route /register?token=... displays registration page
- [ ] Page fetches invitation details on load
- [ ] If token invalid/expired, show error message
- [ ] Form shows: email (disabled), first name, last name, password fields
- [ ] Password field with strength indicator (weak/medium/strong)
- [ ] Confirm password field with validation (must match)
- [ ] Password requirements shown: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special
- [ ] On submit: creates user and auto-logs in
- [ ] Success redirects to dashboard
- [ ] Mobile responsive

**Definition of Done**:
- Registration page functional
- Password strength indicator works
- User created and auto-logged in

---

## Phase 4: Admin User Management Interface (Week 4 - 21 points)

### Story 10.13: User Management API Endpoints (8 pts)
**As a** system owner
**I want** API endpoints for user management
**So that** I can manage users programmatically

**Acceptance Criteria**:
- [ ] Create `apps/api/src/routes/admin.ts`
- [ ] GET /api/admin/users - List users with filters (role, status, search, pagination)
- [ ] PUT /api/admin/users/:id - Update user (first_name, last_name, role)
- [ ] DELETE /api/admin/users/:id - Delete user (prevent self-deletion)
- [ ] PUT /api/admin/users/:id/status - Activate/deactivate user
- [ ] GET /api/admin/users/:id/activity - Get user activity logs
- [ ] All endpoints require system_owner role
- [ ] List endpoint supports query params: ?role=...&status=...&search=...&page=...&limit=...
- [ ] Search param searches email, first_name, last_name (case-insensitive)
- [ ] Pagination defaults: limit=50, page=1

**Definition of Done**:
- All endpoints functional
- Filters and search work correctly
- Authorization enforced

---

### Story 10.14: User Management UI - User Table (13 pts)
**As a** system owner
**I want** a user management interface
**So that** I can view, edit, and manage users easily

**Acceptance Criteria**:
- [ ] /admin/users route displays user management page
- [ ] "Invite User" button in top-right corner
- [ ] Table columns: checkbox, avatar, name, email, role, status, last login, actions
- [ ] Table sortable by: name, email, role, status, last login
- [ ] Search bar (debounced 300ms) filters by email or name
- [ ] Filter dropdowns: Role (All, System Owner, VP, Sales Manager, Sales Rep, Viewer), Status (All, Active, Inactive)
- [ ] Active users shown with green "Active" chip
- [ ] Actions menu: Edit, View Activity, Deactivate/Activate, Delete
- [ ] Pagination at bottom (50 users per page)
- [ ] Bulk select with "Change Role" and "Deactivate" actions
- [ ] Mobile responsive (table scrolls horizontally)

**Definition of Done**:
- User table displays correctly
- Filters and search work
- Actions functional

---

## Phase 5: Integration, Testing & Documentation (Week 5 - 15 points)

### Story 10.15: Security Hardening - Rate Limiting & Password Validation (8 pts)
**As a** developer
**I want** rate limiting and strong password validation
**So that** the system is protected from brute force attacks

**Acceptance Criteria**:
- [ ] Install and configure express-rate-limit middleware
- [ ] Login endpoint limited to 5 attempts per IP per 15 minutes
- [ ] Registration endpoint limited to 3 attempts per IP per hour
- [ ] OAuth endpoints limited to 10 attempts per IP per hour
- [ ] Rate limit exceeded returns 429 Too Many Requests
- [ ] Password validation enforces: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special
- [ ] Password cannot match email
- [ ] Rate limit state stored in Redis
- [ ] Tests verify rate limiting and password validation

**Definition of Done**:
- Rate limiting active on all auth endpoints
- Password validation enforced
- Tests passing

---

### Story 10.16: End-to-End Testing & Documentation (8 pts)
**As a** developer
**I want** comprehensive tests and documentation
**So that** the system is reliable and maintainable

**Acceptance Criteria**:
- [ ] E2E tests for email/password login flow
- [ ] E2E tests for Google OAuth flow (mocked)
- [ ] E2E tests for user invitation flow
- [ ] E2E tests for user management operations
- [ ] E2E tests for RBAC enforcement
- [ ] E2E tests cover mobile viewport
- [ ] README updated with authentication setup instructions
- [ ] Environment variables documented in .env.example
- [ ] User guide created: "How to invite and manage users"

**Definition of Done**:
- All E2E tests passing
- Documentation complete
- Code coverage > 80%

---
