# The Sustainables Academy Card Website - MAINTENANCE MANUAL

An eco-friendly digital and printable greeting card platform supporting environmental education.

## Live Demo
- Website: [https://charlie-card-frontend-2-267b7f36cb99.herokuapp.com/](https://charlie-card-frontend-2-267b7f36cb99.herokuapp.com/)

### Sample Academy Accounts
- Teacher Account:
  - Email: teacher@evaluation.com
  - Password: teacherEvaluation
- Parent Account:
  - Email: parent@evaluation.com
  - Password: parentEvaluation
- Student Account:
  - Email: student@evaluation.com
  - Password: studentEvalaution
- Admin Account:
  - Email: admin@evaluation.com
  - Password: adminEvaluation

### Sample Payment Accounts
- Seller Account (use to verify successful transaction):
   - Email: sb-zosus37484994@business.example.com
   - Password: ap2w4YO!
- Buyer Account (use to make payments on site):
   - Email: sb-xjjoo37494395@personal.example.com
   - Password: yM#BMS0f
- Accounts can be viewed at the [PayPal sandbox site](https://www.sandbox.paypal.com/mep/dashboard)
- **Accounts are for testing purposes only, all money involved is fake**

## Installation

### Prerequisites
- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)
- Modern web browser (Chrome 88+, Firefox 87+, Safari 14+, Edge 88+)
- Internet connection for CDN resources

### Dependencies
- Bootstrap (v4.5.2)
- Font Awesome (v6.0.0-beta3)
- jQuery (v3.6.0)
- Three.js (r128)
- jsPDF (v2.5.1)
- Custom fonts:
  - InterVariable
  - Montserrat
  - Pacifico

### Setup Instructions
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/Card-Website.git
   cd Card-Website
   ```
   ```bash
   git clone https://github.com/yourusername/Backend.git
   cd Card-Website
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables (LOCAL ONLY - Please store secrets securely when deploying to a live site.):
   Create a `.env` file in the root directory of the backend with:
   ```
   # API Endpoints (Where the site is being hosted. Must host both frontend and backend. The links stated below are examples.)
   API_URL=https://charlie-card-backend-fbbe5a6118ba.herokuapp.com
   FRONTEND_URL=https://charlie-card-frontend-2-267b7f36cb99.herokuapp.com
   
   # PayPal Configuration
   PAYPAL_CLIENT_ID=YOUR_PAYPAL_CLIENT_ID
   PAYPAL_CLIENT_SECRET=YOUR_PAYPAL_SECRET
   
   # MongoDB Connection
   MONGODB_URI=YOUR_MONGODB_CONNECTION_STRING
   
   # JWT Configuration
   JWT_SECRET=YOUR_JWT_SECRET_KEY
   JWT_EXPIRY=24h
   
   # Optional Configuration
   NODE_ENV=development    # or 'production'
   PORT=3000              # default port for local development
   ```

4. Start the development server:
   ```bash
   npm start
   ```

5. Access the website:
   Open `http://localhost:3000` or `your hosting site` in your web browser

## Features
- eCard and printable card creation
- Drag-and-drop sticker placement
- Text customisation with multiple fonts
- 3D preview of cards
- Classroom management system for teachers
- Credit-based payment system
- Draft saving system
- PayPal integration for purchases

## Browser Support
- Chrome (88+)
- Firefox (87+)
- Safari (14+)
- Edge (88+)

## System Requirements
- Minimum 4GB RAM
- Modern CPU (Intel Core i3/AMD Ryzen 3 or better)
- 1GB free disk space
- Display resolution: 1280x720 or higher
- WebGL-capable graphics card/chip for 3D preview

## Development Stack
- Frontend: HTML5, CSS3, JavaScript (ES6+)
- Styling: Bootstrap 4.5.2
- 3D Rendering: Three.js
- PDF Generation: jsPDF
- Payment Processing: PayPal API
- Version Control: Git

## Deployment
The application is deployed on Heroku with the following specifications:
- Runtime: Node.js
- Database: MongoDB Atlas
- Static Files: Heroku Static Buildpack
- SSL: Enabled
- Region: EU
- Scaling: Standard-1X dyno

## Security Features
- HTTPS enforced
- CORS enabled
- JWT authentication
- XSS protection
- CSRF protection
- Rate limiting
- Input sanitisation

## Testing

### Setup Testing Environment
```bash
# Install required testing packages
npm install mocha chai sinon jsdom node-fetch
```

### Run Tests
```bash
# Run all tests
npx mocha tests/**/*.test.js

# Run specific test file
npx mocha tests/login.test.js
npx mocha tests/classroom.test.js
```

### Test Files Structure
```
tests/
├── login.test.js     # Authentication tests
└── classroom.test.js # Classroom management tests
```

### Test Coverage
Current test coverage includes:
- Authentication System
  - [x] Login functionality
  - [x] Registration process
  - [x] Sign out process
  - [x] Session management

- Classroom Management
  - [x] Student listing
  - [x] Adding students
  - [x] Credit distribution
  - [x] Student removal
  - [x] Credit withdrawal

### Manual Testing Checklist
Before each deployment, verify:

- Authentication
  - [ ] All account types can log in
  - [ ] Registration validates input
  - [ ] Sign out clears session
  - [ ] Invalid credentials handled

- Card Editor
  - [ ] Text tools work
  - [ ] Sticker placement works
  - [ ] 3D preview renders
  - [ ] Changes save correctly

- Payment Processing
  - [ ] Credit purchases complete
  - [ ] Balance updates correctly
  - [ ] Payment errors handled
  - [ ] Receipts generated

- Classroom Features
  - [ ] Students can be added
  - [ ] Credits distribute correctly
  - [ ] Student removal works
  - [ ] Balance tracking accurate

### Writing New Tests
Example test structure:
```javascript
describe('Feature Name', () => {
    beforeEach(() => {
        // Setup test environment
    });

    it('should perform specific action', async () => {
        // Test implementation
    });

    afterEach(() => {
        // Clean up
    });
});
```

## Extensibility
The system can be extended in the following ways:

### New Features
1. Additional Card Customisation
   - More fonts and stickers
   - Animation effects
   - Audio messages
   - QR code integration

2. Enhanced Classroom Features
   - Video tutorials
   - Lesson planning tools
   - Student progress tracking
   - Group projects

3. Payment Options
   - Additional payment gateways
   - Subscription models
   - Group purchasing
   - Reward programs

### Technical Extensions
1. API Improvements
   - GraphQL implementation
   - WebSocket real-time updates
   - Enhanced caching
   - API versioning

2. Performance Optimisations
   - Image compression
   - Lazy loading
   - Service Worker implementation
   - Progressive Web App features

3. Security Enhancements
   - Two-factor authentication
   - OAuth integration
   - Enhanced audit logging
   - Automated security scanning

### Architecture Scalability
1. Microservices Migration
   - Separate card rendering service
   - Dedicated authentication service
   - Independent classroom management

2. Cloud Services Integration
   - AWS S3 for media storage
   - CloudFront for CDN
   - Lambda for serverless functions
   - Container orchestration

3. Monitoring and Analytics
   - User behaviour tracking
   - Performance metrics
   - Error tracking
   - Usage analytics

## Support
For technical support or queries:
- Email: info@sustainablesacademy.org
- Twitter: [@sustainablesaca](https://x.com/sustainablesaca)
- Facebook: [The Sustainables Academy](https://www.facebook.com/thesustainablesacademy/)
