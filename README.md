# The Sustainables Academy Card Website

An eco-friendly digital and printable greeting card platform supporting environmental education.

## Live Demo
- Website: [https://charlie-card-backend-fbbe5a6118ba.herokuapp.com/](https://charlie-card-backend-fbbe5a6118ba.herokuapp.com/)

### Sample Accounts
- Teacher Account:
  - Email: teacher@test.com
  - Password: password123
- Parent Account:
  - Email: parent@test.com
  - Password: password123
- Student Account:
  - Email: student@test.com
  - Password: password123
- Admin Account:
  - Email: admin@test.com
  - Password: admin123

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
   API_URL=https://charlie-card-backend-fbbe5a6118ba.herokuapp.com
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
- Text customization with multiple fonts
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
- Input sanitization

## Support
For technical support or queries:
- Email: support@sustainablesacademy.org
- Twitter: [@sustainablesaca](https://x.com/sustainablesaca)
- Facebook: [The Sustainables Academy](https://www.facebook.com/thesustainablesacademy/)
