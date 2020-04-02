const express = require('express');
const { getProducts, getProductsByName} = require('./lib/repository');
const app = express();
const port = process.env.port || 8080;
// secure the direct call to the application
const passport = require('passport');
const { JWTStrategy } = require('@sap/xssec');
const xsenv = require('@sap/xsenv');

// XSUAA Middleware
passport.use(new JWTStrategy(xsenv.getServices({uaa:{tag:'xsuaa'}}).uaa));

app.use(passport.initialize());
app.use(passport.authenticate('JWT', { session: false }));

app.get('/products', checkReadScope, getProducts);

// Scope check
function checkReadScope(req, res, next) {
	if (req.authInfo.checkLocalScope('read')) {
		return next();
	} else {
    	console.log('Missing the expected scope');
    	res.status(403).end('Forbidden');
	}
}

// Serve static files
app.use('/', express.static('static/'));

app.listen(port, () => {
	console.log('%s listening at %s', app.name, port);
})
