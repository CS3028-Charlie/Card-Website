const config = {
    development: {
        API_URL: 'http://localhost:3000',
    },
    production: {
        API_URL: 'https://charlie-card-backend-fbbe5a6118ba.herokuapp.com',
    },
};

export default config['development'];