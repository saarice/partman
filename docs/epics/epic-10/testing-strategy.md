# Testing Strategy

**Unit Tests:**
- Authorization middleware (valid/invalid roles, no user)
- Password validator (all validation rules)
- Activity log service (graceful error handling)

**Integration Tests:**
- OAuth flow end-to-end (with mocked Google API)
- User invitation flow (create, send, accept)
- Admin user management (CRUD operations)
- RBAC enforcement on protected endpoints

**E2E Tests:**
- Email/password login → dashboard
- Google OAuth login → dashboard
- Invite user → receive email → register → auto-login
- System owner manages users (edit, deactivate, delete)
- Viewer cannot access admin routes (403 error)

**Performance Tests:**
- Login response < 1s (95th percentile)
- Token refresh < 200ms (99th percentile)
- User management page load < 2s for 1000 users

---
