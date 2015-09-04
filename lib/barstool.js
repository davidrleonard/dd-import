var config = _ = require('underscore')
    , async = require('async')
    , GoogleSpreadsheet = require('google-spreadsheet')
    , googleAuth = require("google-auth-library")
    ;

// Try to load our config
try {
  var config = require('../config');
}
catch (e) {
  console.log("No config file found, trying to use ENV vars.")
}

// -----
// Settings
// -----
var settings = {};
settings.google_sheet_key = process.env.GOOGLE_SHEET_KEY || config["google_sheet_key"];
settings.google_service_email = process.env.GOOGLE_SERVICE_EMAIL || config["google_service_email"];
settings.google_service_private_key = process.env.GOOGLE_SERVICE_PRIVATE_KEY || config["google_service_private_key"];

// -----
// Barstool (fetches data from Google Analytics and sends it back as normal JSON)
// -----
var barstool = {};
var sheet = new GoogleSpreadsheet(settings.google_sheet_key);

// Login with Google Authentication token
barstool.login = function(cb) {
  var authClient = new googleAuth();
  var jwtClient = new authClient.JWT(settings.google_service_email, null, settings.google_service_private_key, ["https://spreadsheets.google.com/feeds"], null);
  jwtClient.authorize(function (err, token) {
    if (err) throw err;
    sheet.setAuthToken({ "type": token.token_type, "value": token.access_token });
    // sheet is now authenticated
    cb(err);
  });
}

// Download the data from Google Sheets, return the rows
barstool.fetchData = function(cb) {
  barstool.login(function(err){
    if (err) throw err;
    sheet.getInfo(function(err, sheetInfo){
      if (err) throw err;
      cb(err, sheetInfo);
    });
  });
}

// Get one worksheet
barstool.getWorksheet = function(worksheetId, cb) {
  barstool.fetchData(function(err,sheetInfo){
    if (err) throw err;
    if (typeof(worksheetId) === "number") {
      wantedSheet = sheetInfo.worksheets[worksheetId];
    }
    if (typeof(worksheetId) === "string") {
      console.log( "STRING" );
      for (worksheet in sheetInfo.worksheets) {
        // @TODO: Nice error handling if string worksheeetId doesn't exist
        if (sheetInfo.worksheets[worksheet]["title"] !== worksheetId) {
          continue;
        }
        wantedSheet = sheetInfo.worksheets[worksheet];
      }
    }

    wantedSheet.getRows({
      start: 1,
      num: 3000
    },
    function(err,rows){
      cb(err, rows)
      // returns an array [] of row data
    });
  });
}

// Get all worksheets
// Return them as an object with keys set to worksheet name. Each key holds an array of rows
// data {
//   "worksheet_name_1" : {
//     [
//       { ... row data }
//     ]
//   }
// }
barstool.getAllWorksheets = function(cb) {
  barstool.fetchData(function(err,sheetInfo){
    if (err) throw err;
    console.log("Getting worksheets...");
    var worksheets = {};
    async.map(sheetInfo.worksheets,
      function(worksheet,cb){
        worksheet.getRows({
          start: 1,
          num: 3000
        },
        function(err,rows){
          // !!!!!!! SPLICE THE FIRST ROW OUT
          // Why? Because for appreview, the two rows are junk (a description and hashes)
          // This is very specific to our needs would need to be stripped out for other versions
          rows.splice(0,1);
          // put the rows into the worksheets object, with a key of the worksheet name (escaped)
          worksheets[(worksheet.title).toLowerCase().split(' ').join('_')] = rows;
          cb(err);
          // returns an array [] of row data
        });
      },
      function(err,output){
        // we don't want output, we want worksheets
        cb(err,worksheets);
      }
    );
  });
}

module.exports = barstool;
