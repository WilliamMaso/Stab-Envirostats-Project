//this one
require('dotenv').config();
const express = require('express');

const session = require('express-session');

// const federated_credentials = require("better-sqlite3")("sqlite.db");
const app = express();
var passport = require('passport');
var GoogleStrategy = require('passport-google-oidc');

const GOOGLE_CLIENT_ID = "239320005354-2sjdf1mksdfhqnnbh62oesajh02p3e49.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET= "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"




const path = require('path');
const {google} = require("googleapis")

//_______________________________________________________________________________________________________________________________________________

// Code paraphrased from Prashant Ram || https://medium.com/@prashantramnyc/how-to-implement-google-authentication-in-node-js-using-passport-js-9873f244b55e

//Middleware
app.use(session({
    secret: "secret",
    resave: false ,
    saveUninitialized: true ,
}))

app.use(passport.initialize()) // init passport on every route call
app.use(passport.session())    //allow passport to use "express-session"
let gimmieEmail;
let theEmail;

authUser = (request, accessToken, refreshToken, profile, done) => {
	gimmieEmail = refreshToken.emails;
	request.session.email = gimmieEmail[0].value
    return done(null, profile);
  }

//Use "GoogleStrategy" as the Authentication Strategy
passport.use(new GoogleStrategy({
    clientID:     GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:8080/auth/google/callback",
    passReqToCallback   : true
  }, authUser));


passport.serializeUser( (user, done) => { 
    console.log(`\n--------> Serialize User:`)
    console.log(user)
     // The USER object is the "authenticated user" from the done() in authUser function.
     // serializeUser() will attach this user to "req.session.passport.user.{user}", so that it is tied to the session object for each session.  

    done(null, user)
} )


passport.deserializeUser((user, done) => {
        console.log("\n--------- Deserialized User:")
        console.log(user)
        // This is the {user} that was saved in req.session.passport.user.{user} in the serializationUser()
        // deserializeUser will attach this {user} to the "req.user.{user}", so that it can be used anywhere in the App.

        done (null, user)
}) 

//Use the req.isAuthenticated() function to check if user is Authenticated
checkAuthenticated = (req, res, next) => {
	if(!req.session.email){
		return res.redirect("/login")
	}
	if( req.session.email.includes('@stab.org') || req.session.email.includes('@students.stab.org')){
  if (req.isAuthenticated() ) { return next() }
  res.redirect("/login")
}else{
	res.redirect("/login")
}
}


//_______________________________________________________________________________________________________________________________________________

app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + "/views")

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
	res.render('home.ejs', {
		NAME: "STAB"
	});
});

app.get("/about", (req, res) => {	
	res.render('about.ejs', {
		NAME: "about"
	});
});

app.get("/benthic", checkAuthenticated, (req, res) => {
	res.render('benthic.ejs', {name: req.user.displayName})
	
});

app.get("/input", checkAuthenticated, (req, res) => {
	res.render('input.ejs' ,{name: req.user.displayName})
});

app.get("/collective", (req, res) => {
	res.render('collective.ejs', {name: req.user.displayName})
});

app.get("/login", (req, res) => {
	res.render('login.ejs')
	NAME: "login"
});

app.get("/submission", (req, res) => {
	res.render('submission.ejs')
	NAME: "submission"
});
//_______________________________________________________________________________________________________________________________________________

app.post("/input", async (req, res) => {
	const {times, River, date, TimeStarted, Species, tagColor, Tag, NewRecapture, SurfaceSubsurface, Measurement, Sex, Spines, BrianOK, Notes} = req.body;
	//console.log(times, river, date, time, id, size, species, spines, surf-subsurf, sex, BrianOK, Notes);

	const auth = new google.auth.GoogleAuth({
	    keyFile: "credentials.json",
	    scopes: "https://www.googleapis.com/auth/spreadsheets",
	  });
	  
	const client = await auth.getClient(); // Create client
	const googleSheet = google.sheets({ version: "v4", auth: client }); //Googlesheet api
	const spreadsheetId = "137iLinoT66M2jRge5GhHsh7LX1qPsE-KTwbC0aQLKow";
	  
	// Get metadata about spreadsheet
	const metaData = await googleSheet.spreadsheets.get({
		auth,
		spreadsheetId,});

	// Read rows from spreadsheet
	const getRows = await googleSheet.spreadsheets.values.get({
		auth,
		spreadsheetId, 
		range: "Sheet1!A:A",
	});
	
	// Write row(s) to spreadsheet
	await googleSheet.spreadsheets.values.append({auth, spreadsheetId,
	    range: "Sheet1!A:N",
	    valueInputOption: "USER_ENTERED",
	    resource: {
	      values: [[times, River, date, TimeStarted, Species, tagColor, Tag, NewRecapture, SurfaceSubsurface, Measurement, Sex, Spines, BrianOK, Notes]],
	    },
	})

	res.render('submission.ejs')
	//res.sendFile(path.join(__dirname, '/page2.html'));
});
//_______________________________________________________________________________________________________________________________________________
app.post("/benthic", async (req, res) => {
	const {date, river, worm, flatworm, leeches, crayfish, sowbug, scrub, stoneflies, mayflies, damesel_dragon, hgram_fishfl_alder, cnetspin, caddisfly, beetles, midges, blackflies, truefly, gsnail, lsnail, clams, wpennies, other, tscore } = req.body;

	const auth = new google.auth.GoogleAuth({
	    keyFile: "credentials.json",
	    scopes: "https://www.googleapis.com/auth/spreadsheets",
	  });
	  
	const client = await auth.getClient(); // Create client
	const googleSheet = google.sheets({ version: "v4", auth: client }); //Googlesheet api
	const spreadsheetId = "137iLinoT66M2jRge5GhHsh7LX1qPsE-KTwbC0aQLKow";
	  
	// Get metadata about spreadsheet
	const metaData = await googleSheet.spreadsheets.get({
		auth,
		spreadsheetId,});

	// Read rows from spreadsheet
	const getRows = await googleSheet.spreadsheets.values.get({
		auth,
		spreadsheetId, 
		range: "Sheet1!A:A",
	});
	
	// Write row(s) to spreadsheet
	await googleSheet.spreadsheets.values.append({auth, spreadsheetId,
	    range: "Sheet2!A:X",
	    valueInputOption: "USER_ENTERED",
	    resource: {
	      values: [[date, river, worm, flatworm, leeches, crayfish, sowbug, scrub, stoneflies, mayflies, damesel_dragon, hgram_fishfl_alder, cnetspin, caddisfly, beetles, midges, blackflies, truefly, gsnail, lsnail, clams, wpennies, other, tscore]],
	    },
	});

	res.render('submission.ejs')
	//res.sendFile(path.join(__dirname, '/page2.html'));
});
//________________________________________________________________________________________________________________________________________________

app.post("/collective", async (req, res) => {
	const {date, river, site, grid, bscore, flowrate, phosphate, temp, ph, ammonium, nitrates, ecoli, turbitidy, doinitial, dofinal, hourslater, bod} = req.body;

	const auth = new google.auth.GoogleAuth({
	    keyFile: "credentials.json",
	    scopes: "https://www.googleapis.com/auth/spreadsheets"
	  });
	  
	const client = await auth.getClient(); // Create client
	const googleSheet = google.sheets({ version: "v4", auth: client }); //Googlesheet api
	const spreadsheetId = "137iLinoT66M2jRge5GhHsh7LX1qPsE-KTwbC0aQLKow";
	  
	// Get metadata about spreadsheet
	const metaData = await googleSheet.spreadsheets.get({
		auth,
		spreadsheetId,});

	// Read rows from spreadsheet
	const getRows = await googleSheet.spreadsheets.values.get({
		auth,
		spreadsheetId, 
		range: "Sheet1!A:A",
	});
	
	// Write row(s) to spreadsheet
	await googleSheet.spreadsheets.values.append({auth, spreadsheetId,
	    range: "Sheet3!A:P",
	    valueInputOption: "USER_ENTERED",
	    resource: {
	      values: [[date, river, site, grid, bscore, flowrate, phosphate, temp, ph, ammonium, nitrates, ecoli, turbitidy, doinitial, dofinal, hourslater, bod]],
	    },
	});
	res.render('submission.ejs')
	//res.sendFile(path.join(__dirname, '/page2.html'));
});
	
app.listen(8080, () => {
	console.log("Server Launched");
})

//________________________________________________________________________________________________________________________________________________

// Code paraphrased from Prashant Ram || https://medium.com/@prashantramnyc/how-to-implement-google-authentication-in-node-js-using-passport-js-9873f244b55e

let count = 1
showlogs = (req, res, next) => {
    console.log("\n==============================")
    console.log(`------------>  ${count++}`)

    console.log(`\n req.session.passport -------> `)
    console.log(req.session.passport)
  
    console.log(`\n req.user -------> `) 
    console.log(req.user) 
  
    console.log("\n Session and Cookie")
    console.log(`req.session.id -------> ${req.session.id}`) 
    console.log(`req.session.cookie -------> `) 
    console.log(req.session.cookie) 
  
    console.log("===========================================\n")

    next()
}

app.use(showlogs)


app.get('/auth/google',
  passport.authenticate('google', { scope:
      [ 'email', 'profile' ] }
));

app.get('/auth/google/callback',
    passport.authenticate( 'google', {
        successRedirect: '/',
        failureRedirect: '/login'
}));

//Define the Login Route
app.get("/login", (req, res) => {
    res.render("login.ejs")
})


//Define the Protected Route, by using the "checkAuthenticated" function defined above as middleware
app.get("/dashboard", checkAuthenticated, (req, res) => {
  res.render("dashboard.ejs", {name: req.user.displayName})
})

//Define the Logout
app.post("/logout", (req,res) => {
    req.logOut()
    res.redirect("/login")
    console.log(`-------> User Logged out`)
})




