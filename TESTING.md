# Testing Guide & Test Cases

## Unit Test Checklist

### Authentication Flow
- [ ] Signup page loads correctly
- [ ] Signup generates unique API key
- [ ] Cannot signup with duplicate username
- [ ] Login with correct credentials succeeds
- [ ] Login with wrong API key fails
- [ ] Token is stored in localStorage after login
- [ ] Logout clears token from localStorage
- [ ] Navigating to protected route without token redirects to login

### User Dashboard
- [ ] User dashboard loads with stats
- [ ] All 5 navigation items are clickable
- [ ] Each page loads without errors
- [ ] Active route is highlighted in sidebar

### Make Payment Page
- [ ] Form validation works (empty fields)
- [ ] Positive amounts only allowed
- [ ] Successful payment shows success message
- [ ] API response displays correctly
- [ ] Form resets after submission

### Check Balance Page
- [ ] Balance loads on page load
- [ ] Refresh button re-fetches balance
- [ ] Loading state appears while fetching
- [ ] Balance displays with proper formatting

### Spam Requests Page
- [ ] "Start Attack" button is enabled initially
- [ ] Button becomes disabled during attack
- [ ] First 10 requests show success (200)
- [ ] 11th request shows rate limit (429)
- [ ] After blocking, requests show forbidden (403)
- [ ] Request log updates in real-time
- [ ] Stats count correctly (total, success, rate-limited, blocked)

### Activity History Page
- [ ] All filter buttons work
- [ ] Filter correctly shows/hides activities
- [ ] Activities display in reverse chronological order
- [ ] Status badges show correct colors
- [ ] Timestamps are formatted correctly

### Admin Dashboard
- [ ] Admin can only access with role="admin"
- [ ] Regular user cannot access admin pages
- [ ] Metrics cards display numbers
- [ ] System health shows all components
- [ ] Request distribution bars are visible

### Admin API Traffic Page
- [ ] Refresh button updates traffic data
- [ ] All endpoints are listed
- [ ] HTTP method badges color correctly
- [ ] Success rate bars display
- [ ] Status indicators show healthy/warning

### Admin Suspicious Activity Page
- [ ] Filter buttons work correctly
- [ ] Activities display with icons
- [ ] Severity badges color code
- [ ] IP addresses are visible
- [ ] Timestamps format correctly

## Integration Test Scenarios

### Scenario 1: Complete User Journey
1. Browser opens `http://localhost:5173/`
2. Redirects to `/login` ✅
3. Click "Sign up here"
4. Enter username "test_user_1"
5. Click "Create Account"
6. API key is displayed
7. Copy API key
8. Click "Go to Login"
9. Enter username "test_user_1"
10. Paste API key
11. Click "Sign In"
12. Redirected to `/user/dashboard` ✅
13. Dashboard shows stats ✅
14. Sidebar navigation works ✅

### Scenario 2: Rate Limiting Demo
1. Login as user
2. Navigate to "Spam Requests"
3. Click "Start Attack"
4. Monitor request log:
   - Requests 1-10: Status 200, badge green ✅
   - Request 11: Status 429, badge yellow ⚠️
   - Requests 12+: Status 403, badge red ❌
5. Stats update correctly ✅
6. Rate limited count increases ✅
7. Blocked count increases ✅

### Scenario 3: Admin Monitoring
1. Login as admin user
2. Redirected to `/admin/dashboard` ✅
3. Dashboard displays 6 metric cards ✅
4. Click "API Traffic"
5. Traffic table loads ✅
6. Click "Suspicious Activity"
7. Activity log displays ✅
8. Filters work correctly ✅

### Scenario 4: Payment Flow
1. Login as user
2. Go to "Make Payment"
3. Enter recipient "user2"
4. Enter amount "100"
5. Click "Send Payment"
6. Response displays ✅
7. Shows transaction ID ✅
8. Status shows success ✅

### Scenario 5: Balance Check
1. Login as user
2. Go to "Check Balance"
3. Balance displays automatically ✅
4. Click Refresh
5. Balance updates ✅
6. Timestamp changes ✅

### Scenario 6: Activity History
1. Login as user
2. Make 3-4 API calls (payment, balance, etc.)
3. Go to "Activity History"
4. Recent activities appear ✅
5. Filter by "success" - shows successful calls ✅
6. Filter by "failed" - shows failures ✅
7. Total count is accurate ✅

## API Test Cases

### Authentication Endpoints
```
POST /auth/register
✅ Returns API key
❌ Duplicate username returns 409

POST /auth/login
✅ Correct credentials return JWT token
❌ Wrong API key returns 401
```

### User API Endpoints
```
GET /api/balance
✅ Returns balance number
❌ No token returns 401

POST /api/payment
✅ Valid payment returns transaction ID
❌ Missing fields returns 400
❌ After 10 requests in 60s returns 429
❌ When blocked returns 403

GET /api/user/activity
✅ Returns activity array
❌ No token returns 401
```

### Admin Endpoints
```
GET /api/admin/metrics
✅ Regular user gets 403
✅ Admin user gets metrics
❌ No token returns 401

GET /api/admin/traffic
✅ Regular user gets 403
✅ Admin user gets traffic data

GET /api/admin/suspicious-activity
✅ Regular user gets 403
✅ Admin user gets activities
```

## Performance Benchmarks

- [ ] Page load time < 2 seconds
- [ ] API response time < 500ms (average)
- [ ] Rate limiting detection instant
- [ ] Spam requests (15 rapid calls) complete in < 5 seconds
- [ ] Admin dashboard data updates in < 1 second

## Browser Compatibility

Test on:
- [ ] Chrome 120+
- [ ] Firefox 121+
- [ ] Safari 17+
- [ ] Edge 120+

## Mobile Responsiveness

- [ ] Sidebar is readable (or hamburger menu in production)
- [ ] Cards stack vertically on small screens
- [ ] Forms are touch-friendly
- [ ] Buttons are clickable (min 44px)
- [ ] Text is readable (min 16px on mobile)

## Error Handling

- [ ] Network error shows user-friendly message
- [ ] 401 error logs out user
- [ ] 403 error shows permission denied message
- [ ] 404 error shows endpoint not found
- [ ] 429 error clearly shows rate limit exceeded
- [ ] 500 error shows server error message

## Security Tests

- [ ] Token cannot be accessed by XSS (stored in localStorage - note: secure storage recommended for production)
- [ ] CORS allows only localhost:5173 to localhost:5000
- [ ] Admin endpoints reject non-admin users
- [ ] Protected routes require authentication
- [ ] API key cannot be extracted from JWT
- [ ] Rate limiting cannot be bypassed

## UI/UX Tests

- [ ] All colors are readable (contrast ratio 4.5:1)
- [ ] Hover states work on all buttons
- [ ] Active states indicate current page
- [ ] Loading spinners appear during API calls
- [ ] Error messages are visible and understandable
- [ ] Success messages display with checkmark
- [ ] Icons load correctly
- [ ] Animations don't cause motion sickness

## Accessibility Tests

- [ ] Tab navigation works through form fields
- [ ] Form labels are associated with inputs
- [ ] Error messages are announced
- [ ] Buttons have sufficient padding
- [ ] Text contrast meets WCAG AA standards

---

## Test Execution Order

1. **Unit Tests** (individual components)
2. **Integration Tests** (component interactions)
3. **API Tests** (backend endpoints)
4. **E2E Tests** (full user journeys)
5. **Performance Tests** (load & response time)
6. **Security Tests** (auth & data protection)
7. **Browser Tests** (cross-browser compatibility)
8. **Mobile Tests** (responsive design)

## Known Limitations (For Production)

1. **Rate Limiting State**
   - Resets on backend restart
   - Stored in memory (use Redis for production)

2. **Activity Logs**
   - Stored in memory
   - Use MongoDB for persistence

3. **Admin Data**
   - Mocked with random values
   - Connect to real metrics system

4. **Storage**
   - JWT stored in localStorage (vulnerable to XSS)
   - Use httpOnly cookies for production

5. **CORS**
   - Allows all origins (only for dev)
   - Restrict to specific domains in production

---

## Automation Testing (Optional)

### Cypress Test Example
```javascript
describe('Spam Requests Flow', () => {
  it('Should rate limit after 10 requests', () => {
    cy.login('test_user', 'api_key')
    cy.visit('/user/spam')
    cy.get('[data-testid="attack-button"]').click()
    
    // Wait for requests to complete
    cy.get('[data-testid="request-log"]').within(() => {
      cy.get('div').should('have.length', 15)
      cy.get('div').eq(9).should('contain', '200')
      cy.get('div').eq(10).should('contain', '429')
    })
  })
})
```

---

**All tests should pass before deployment ✅**
