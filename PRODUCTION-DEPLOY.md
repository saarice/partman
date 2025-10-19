# Production Deployment Guide

## Overview

This guide walks you through deploying the Partnership Management Platform to a production environment with a clean database.

## Prerequisites

- Docker and Docker Compose installed
- Access to production server/environment
- SSL certificates (recommended for HTTPS)
- Strong passwords generated for database and JWT secrets

## Step-by-Step Deployment

### 1. Environment Variables (Already Set Up)

The production environment file `.env.production` has been created with secure random passwords:
- Database password: Securely generated
- JWT secret: 48-character random string
- Session secret: 48-character random string
- Database port: 5434 (to avoid conflicts)

**Note:** These passwords are already set. If you need to regenerate them:
```bash
openssl rand -base64 32  # For database password
openssl rand -base64 48  # For JWT secret
```

### 2. Start Production Database

The production setup currently includes only the database with clean data:

```bash
# Start production database
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f postgres-prod

# Check database status
docker-compose -f docker-compose.prod.yml ps
```

**Current Status:**
- Production database is running on port 5434
- Database name: `partman_prod`
- Clean schema initialized with only 1 system owner user

### 3. Verify Database Initialization

The database will be automatically initialized with a clean schema. Verify:

```bash
# Connect to the production database
docker exec -it partman-postgres-prod psql -U partman_prod -d partman_prod

# Check tables
\dt

# Verify system owner was created
SELECT email, role FROM users;

# Exit
\q
```

### 4. Change Default Admin Password

**CRITICAL:** The default admin password is `admin123`. Change it immediately!

```bash
# Connect to database
docker exec -it partman-postgres-prod psql -U partman_prod -d partman_prod

# Generate new password hash (use bcrypt with cost 10)
# You can use https://bcrypt-generator.com/ or a backend script

# Update password
UPDATE users SET password_hash = '<your-bcrypt-hash>' WHERE email = 'admin@partman.com';

# Verify
SELECT email, role FROM users WHERE email = 'admin@partman.com';

# Exit
\q
```

### 5. Connect Your Application to Production Database

To use the production database with your running application:

**Option 1: Update your existing .env file temporarily**
```bash
# In your apps/api/.env file, change DATABASE_URL to:
DATABASE_URL=postgresql://partman_prod:UXV94FxHVZxow+xXBei31mi79PxsJURGhpxkN6mdpWE=@localhost:5434/partman_prod
```

**Option 2: Run API and Web separately pointing to production DB**
```bash
# Set environment variable and start API
cd apps/api
DATABASE_URL=postgresql://partman_prod:UXV94FxHVZxow+xXBei31mi79PxsJURGhpxkN6mdpWE=@localhost:5434/partman_prod npm run dev

# In another terminal, start web
cd apps/web
npm run dev
```

### 6. Access and Login

- **Web UI**: http://localhost:3003 (or your configured port)
- **Database**: localhost:5434

**Default Credentials (CHANGE IMMEDIATELY):**
- Email: `admin@partman.com`
- Password: `admin123`

### 7. Add Your Own Data

Now you have a clean production database with only a system owner. You can:

1. **Login to the Web UI** with admin@partman.com / admin123
2. **Change Admin Password** (IMPORTANT!)
3. **Create Users**: Add your team members through the UI
4. **Add Partners**: Navigate to Partner Management
5. **Add Customers**: Create customer records
6. **Create Opportunities**: Start tracking your sales pipeline

## Production Checklist

- [ ] All environment variables updated with production values
- [ ] Strong passwords generated for database and JWT
- [ ] Default admin password changed
- [ ] SSL/TLS certificates configured
- [ ] Firewall rules configured
- [ ] Database backups configured
- [ ] Monitoring and logging set up
- [ ] CORS origins properly configured
- [ ] Rate limiting reviewed
- [ ] Debug modes disabled

## Security Best Practices

### 1. Database Security
```sql
-- Create a read-only user for reporting
CREATE USER partman_readonly WITH PASSWORD 'strong-password';
GRANT CONNECT ON DATABASE partman_prod TO partman_readonly;
GRANT USAGE ON SCHEMA public TO partman_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO partman_readonly;

-- Create application user with limited permissions
CREATE USER partman_app WITH PASSWORD 'strong-password';
GRANT CONNECT ON DATABASE partman_prod TO partman_app;
GRANT USAGE ON SCHEMA public TO partman_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO partman_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO partman_app;
```

### 2. Regular Backups

```bash
# Manual backup
docker exec partman-postgres-prod pg_dump -U partman_prod partman_prod > backup_$(date +%Y%m%d_%H%M%S).sql

# Automated daily backup (add to crontab)
0 2 * * * docker exec partman-postgres-prod pg_dump -U partman_prod partman_prod | gzip > /backups/partman_$(date +\%Y\%m\%d).sql.gz
```

### 3. Monitoring

Set up monitoring for:
- Database connection pool
- API response times
- Error rates
- Disk space
- Memory usage

## Database Schema Overview

### Core Tables

- **users**: System users and authentication
- **partners**: Partner companies and commission rates
- **customers**: Customer information
- **opportunities**: Sales pipeline with stages
- **commissions**: Commission tracking and payments
- **opportunity_stage_history**: Audit trail for changes

### Default Commission Rates

You can set commission rates at:
1. **Partner level**: Default rate for all opportunities from that partner
2. **Opportunity level**: Specific rate overrides partner default

Example commission rates by partner type:
- Referral: 10-15%
- Reseller: 15-20%
- MSP: 12-18%
- Strategic: 8-25%

## Stopping Production Services

```bash
# Stop all services
docker-compose -f docker-compose.prod.yml down

# Stop and remove volumes (WARNING: This deletes all data!)
docker-compose -f docker-compose.prod.yml down -v
```

## Upgrading

To upgrade the application:

```bash
# Pull latest changes
git pull origin master

# Rebuild containers
docker-compose -f docker-compose.prod.yml build

# Restart services
docker-compose -f docker-compose.prod.yml up -d

# View logs for any errors
docker-compose -f docker-compose.prod.yml logs -f
```

## Troubleshooting

### Database Connection Issues

```bash
# Check database is running
docker ps | grep postgres-prod

# Check database logs
docker logs partman-postgres-prod

# Test connection
docker exec -it partman-postgres-prod psql -U partman_prod -d partman_prod -c "SELECT 1;"
```

### API Not Starting

```bash
# Check API logs
docker logs partman-api-prod

# Verify environment variables
docker exec partman-api-prod env | grep DATABASE_URL

# Check database connectivity from API
docker exec partman-api-prod ping postgres-prod
```

### Web UI Not Loading

```bash
# Check web logs
docker logs partman-web-prod

# Verify API URL is correct
docker exec partman-web-prod env | grep VITE_API_URL
```

## Support

For issues or questions:
- Check logs first: `docker-compose -f docker-compose.prod.yml logs`
- Review environment variables
- Verify database connection
- Check firewall/network configuration

## Data Migration

If you need to migrate data from development to production:

```bash
# Export from development
docker exec partman-postgres pg_dump -U partman -d partman > dev_export.sql

# Import to production (CAUTION: This will add to existing data)
docker exec -i partman-postgres-prod psql -U partman_prod -d partman_prod < dev_export.sql
```

## Clean Slate Reset

If you need to completely reset the production database:

```bash
# WARNING: This deletes ALL data!

# Stop services
docker-compose -f docker-compose.prod.yml down -v

# Start fresh
docker-compose -f docker-compose.prod.yml up -d

# Database will be reinitialized with clean schema
```
