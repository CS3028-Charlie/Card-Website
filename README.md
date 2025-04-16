# The Sustainables Academy Card Website

An eco-friendly digital and printable greeting card platform supporting environmental education.

## Live Demo
- Website: [https://charlie-card-frontend-2-267b7f36cb99.herokuapp.com/](https://charlie-card-frontend-2-267b7f36cb99.herokuapp.com/)

### Sample Accounts
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

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file in the root directory with:
   ```
   # API Endpoints
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
   
   # Email Service (for notifications)
   SMTP_HOST=smtp.example.com
   SMTP_PORT=587
   SMTP_USER=your_email@example.com
   SMTP_PASS=your_email_password
   
   # Optional Configuration
   NODE_ENV=development    # or 'production'
   PORT=3000              # default port for local development
   ```

4. Start the development server:
   ```bash
   npm start
   ```

5. Access the website:
   Open `http://localhost:3000` in your web browser

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

## Support
For technical support or queries:
- Email: info@sustainablesacademy.org
- Twitter: [@sustainablesaca](https://x.com/sustainablesaca)
- Facebook: [The Sustainables Academy](https://www.facebook.com/thesustainablesacademy/)
