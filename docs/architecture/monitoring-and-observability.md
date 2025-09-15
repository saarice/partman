# Monitoring and Observability

## Monitoring Stack

- **Frontend Monitoring**: Sentry for error tracking, Web Vitals API for performance metrics
- **Backend Monitoring**: Prometheus metrics collection, Winston structured logging
- **Error Tracking**: Centralized error reporting with Sentry integration
- **Performance Monitoring**: APM with response time tracking, database query performance analysis

## Key Metrics

**Frontend Metrics:**
- Core Web Vitals (LCP, FID, CLS) with targets: LCP <2.5s, FID <100ms, CLS <0.1
- JavaScript errors by component and user action
- API response times from client perspective with percentile tracking
- User interactions and feature adoption rates by organization

**Backend Metrics:**
- Request rate and response time by endpoint with 95th percentile targets
- Error rate by status code and endpoint
- Database connection pool utilization and query performance
- Configuration cache hit rates and update frequencies

**Business Metrics:**
- Revenue tracking accuracy vs manual calculations
- User adoption rates by feature and organization
- Configuration change frequency and impact on system performance
- Commission calculation processing time and accuracy rates
