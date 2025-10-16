# Technical Implementation Details

## Database Schema Changes

**New Tables:**
```sql
-- oauth_providers: Store Google account linkages
CREATE TABLE oauth_providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,
  provider_user_id VARCHAR(255) NOT NULL,
  profile_picture_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(provider, provider_user_id)
);

-- user_invitations: Track invitation lifecycle
CREATE TABLE user_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(50) NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  invited_by UUID REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'pending',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- user_activity_logs: Audit trail
CREATE TABLE user_activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  method VARCHAR(20),
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**Updated Tables:**
```sql
-- users: Add OAuth and tracking fields
ALTER TABLE users ADD COLUMN profile_picture_url TEXT;
ALTER TABLE users ADD COLUMN last_login_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN registration_method VARCHAR(20) DEFAULT 'email';

-- refresh_tokens: Support remember me and multiple devices
ALTER TABLE refresh_tokens ADD COLUMN remember_me BOOLEAN DEFAULT false;
ALTER TABLE refresh_tokens DROP CONSTRAINT refresh_tokens_user_id_key;
```

## New Backend Files

```
apps/api/src/
├── services/
│   ├── oauthService.ts          (Google OAuth logic)
│   ├── invitationService.ts     (Invitation management)
│   └── activityLogService.ts    (Activity logging)
├── routes/
│   ├── oauth.ts                 (OAuth endpoints)
│   ├── invitations.ts           (Invitation endpoints)
│   └── admin.ts                 (Admin user management)
├── middleware/
│   ├── authorization.ts         (RBAC middleware)
│   └── rateLimiter.ts          (Rate limiting)
├── utils/
│   └── passwordValidator.ts     (Password validation)
└── migrations/
    ├── 004_add_oauth.sql
    ├── 005_add_invitations.sql
    ├── 006_update_users.sql
    ├── 007_update_refresh_tokens.sql
    └── 008_add_activity_logs.sql
```

## New Frontend Files

```
apps/web/src/
├── pages/
│   └── Auth/
│       ├── Register.tsx         (Invitation registration)
│       └── OAuthCallback.tsx    (OAuth redirect handler)
├── components/
│   └── admin/
│       ├── InviteUserDialog.tsx
│       └── EditUserDialog.tsx
├── hooks/
│   └── usePermissions.ts        (RBAC hook)
└── services/
    ├── adminApi.ts              (Admin API calls)
    └── invitationsApi.ts        (Invitation API calls)
```

## Environment Variables

```bash
# Google OAuth
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
GOOGLE_REDIRECT_URI=http://localhost:3001/api/oauth/google/callback

# Email Service (SendGrid recommended)
SENDGRID_API_KEY=SG.xxx
SENDGRID_FROM_EMAIL=noreply@partman.com
SENDGRID_FROM_NAME=Partman

# Rate Limiting
REDIS_HOST=localhost
REDIS_PORT=6379
```

## Role Permission Matrix

| Feature                    | System Owner | VP | Sales Manager | Sales Rep | Viewer |
|----------------------------|--------------|-----|---------------|-----------|--------|
| View Dashboards            | ✅           | ✅  | ✅            | ✅        | ✅     |
| Edit Opportunities         | ✅           | ✅  | ✅            | ✅        | ❌     |
| Edit Partnerships          | ✅           | ✅  | ✅            | ❌        | ❌     |
| Manage Users               | ✅           | ❌  | ❌            | ❌        | ❌     |
| Invite Users               | ✅           | ❌  | ❌            | ❌        | ❌     |

---
