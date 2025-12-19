'user strict';

const express = require('express'),
    //morgan = require('morgan'),
    config = require('./config'),
    router = require('./router'),
    bodyParser = require('body-parser'),
    db = require('./orm')


    
    
    
const sjs = require('sequelize-json-schema');


const app = express()
const PORT = config.PORT;
//OPTIONAL: Security headers?????
// app.use((req, res, next) => {
//     res.header('Content-Type', 'application/json');
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
//   });

//OPTIONAL: Activate Logging
// app.use(morgan('combined'));
app.use(bodyParser.json());


//session middleware
var cookieParser = require('cookie-parser');

var session = require('express-session');

const SessionCookie =  {
  secure: false,
  httpOnly: true,
  sameSite: "lax",
  maxAge: 1000 * 60 * 60 * 60 * 24 * 2
} 

app.use(session({
  name: 'sessionID',
  secret: process.env.SESSION_SECRET || require('crypto').randomBytes(32).toString('hex'),
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,      
    secure: process.env.STAGE === "production" || false, 
    sameSite: 'strict',  
    maxAge: 1000 * 60 * 60 * 24 * 2, 
    path: '/',
    domain: 'localhost:5000'
  }
}));
app.use(cookieParser());

router(app, db);

//drop and resync with { force: true } normal with alter:true
db.sequelize.sync({alter:true}).then(() => {
    app.listen(PORT, () => {
      console.log('Express listening on port:', PORT);
    });
  });

const expressJSDocSwagger = require('express-jsdoc-swagger');

const docOptions = {
  info: {
    version: '1.0.0',
    title: 'Damn vulnerable app',
    license: {
      name: 'MIT',
    },
  },
  security: {
    BearerAuth: {
      type: 'http',
      scheme: 'bearer',
    },
  },
  baseDir: __dirname,
  // Glob pattern to find your jsdoc files (multiple patterns can be added in an array)
  filesPattern: './../**/*.js',
  // URL where SwaggerUI will be rendered
  swaggerUIPath: '/api-docs',
  // Expose OpenAPI UI
  exposeSwaggerUI: true,
  // Expose Open API JSON Docs documentation in `apiDocsPath` path.
  exposeApiDocs: true,
  // Open API JSON Docs endpoint.
  apiDocsPath: '/v1/api-docs',
  // Set non-required fields as nullable by default
  notRequiredAsNullable: false,
  // You can customize your UI options.
  // you can extend swagger-ui-express config. You can checkout an example of this
  // in the `example/configuration/swaggerOptions.js`
  swaggerUiOptions: {},
  // multiple option in case you want more that one instance
  multiple: true,
};

  //const swaggerDocs = expressJSDocSwagger(swaggerOptions);

expressJSDocSwagger(app)(docOptions);
  //app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
  
  //generate schemas from sequelize
  const options = {exclude: ['id', 'createdAt', 'updatedAt']};
sjs.getSequelizeSchema(db.sequelize, options);

const expressNunjucks = require('express-nunjucks');
app.set('views', __dirname + '/templates');
const njk = expressNunjucks(app, {
  watch: true,
  noCache: true
});

//expose css, js
app.use(express.static('src/public'))

//form handler
const formidableMiddleware = require('express-formidable');

app.use(formidableMiddleware());
