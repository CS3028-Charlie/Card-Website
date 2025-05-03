// Configuration object containing API URLs for different environments
// development: Local development server
// production: Live deployment server on Heroku
const config = {
    development: {
        API_URL: 'http://localhost:3000',
    },
    production: {
        API_URL: 'https://charlie-card-backend-fbbe5a6118ba.herokuapp.com',
    },
};

// Export development configuration by default
// Change to 'production' when deploying to live server
export default config['development'];