// Middleware to check token expiration
const jwt = require("jsonwebtoken");

exports.checkTokenExpiration = async function(req, res, next) {
    try {
        // Get the token from the cookie
        const token = req.cookies.Token;

        // Verify the token
        const decoded = jwt.verify(token, 'mynameispulkitupadhyayfromharda');

        // Check if the token is expired
        if (decoded.exp * 1000 < Date.now()) {
            // Token is expired, clear cookies and log out the user
            res.clearCookie('Token');
            res.clearCookie('user_email');
            return res.redirect('/');// Redirect to the logout route or any other route you prefer
        }

        // Token is still valid, proceed with the next middleware
        next();
    } catch (error) {
        // Token verification failed or no token found
        console.error("err lucky here", error)
    }
}