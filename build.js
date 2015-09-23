var path = require('path')
    , fs = require('fs')
    , _ = require('underscore')
    , async = require('async')
    , dir = path.dirname(require.main.filename) + '/output/' // path to the root
    , barstool = require('./lib/barstool')
    , sheetData
    , wstream
    , speakers = {}
    ;

// =====
// GENERAL USE UTILITIES
// =====

// Helper function not called in the build process ...
// Processes each row, outputs it with double quotes escaped and characters
// correctly transformed.
function prepareRow(row){
  return _.map(row, function(item,key){
    // Escape double quotes inside and add double quotes around each item
    return '"' +
           item
           .replace(/"/g,'\'')
           .replace(/\n/g,'')
           .replace(/[\u2018\u2019]/g, '\'')
           .replace(/[\u201C\u201D]/g, '\'')
           + '"';
  })
  .join(',')+'\n';
}

// Create our writestream to @fileName (STRING)
function openStream(cb,fileName){
  // Clear the file
  fs.writeFile(dir + fileName, '', function(){})
  // Open a writestream
  wstream = fs.createWriteStream(dir + fileName);
  cb(null);
}

// Close the open write stream
function closeStream(cb){
  wstream.end();
  cb(null);
}

// Write our headers from @headers (STRING)
function writeHeaders(cb,headers){
  wstream.write(headers);
  cb(null);
};

// Get all worksheets, assign to global-scope `sheetData` variable
function getSheetData(cb){
  barstool.getAllWorksheets(function(err,data){
    if (err) throw err;
    sheetData = data;
    cb(err);
  });
}

// =====
// PARSE AND WRITE SPECIFIC DATA
// =====

// Write the mainstage/schedule block sessions
function writePrimarySessions(cb,sheetName){
  async.eachSeries(sheetData[sheetName], function(row,callback){
    var entry = [];

    // Name (required)
    entry.push(row['sessiontitle']);
    // Description
    entry.push(row['sessiondescription']);

    // ... do some data crunching to format date ...
    var time = row['timeblock'].split(' - ');
    // Start time (required): "3/13/2014 1:11:00 PM"
    entry.push(row['date'] + ' ' + time[0]);
    // End time (required): "3/13/2014 1:11:00 PM"
    entry.push(row['date'] + ' ' + time[1]);

    // Location
    // ... we aren't using these for now ...
    entry.push('');

    // Session Tracks
    entry.push(row['sessiontype']);

    // Filters
    // ... we aren't using these for now ...
    entry.push('');

    // Speaker IDs
    var speakers = [];
    if (row['speakersafe1'].length > 0) { speakers.push(row['speakersafe1']) }
    if (row['speakersafe2'].length > 0) { speakers.push(row['speakersafe2']) }
    if (row['speakersafe3'].length > 0) { speakers.push(row['speakersafe3']) }
    if (row['speakersafe4'].length > 0) { speakers.push(row['speakersafe4']) }
    if (row['speakersafe5'].length > 0) { speakers.push(row['speakersafe5']) }
    if (row['speakersafe6'].length > 0) { speakers.push(row['speakersafe6']) }
    if (row['speakersafe7'].length > 0) { speakers.push(row['speakersafe7']) }
    entry.push(speakers.join(','));

    // Link URLs
    // ... we aren't using these for now ...
    entry.push('');

    // Session ID (unique)
    entry.push(row['sessionuniquekey']);

    // Write the prepared row
    wstream.write( prepareRow(entry) );
    callback(null);
  },function(err){ cb(err) });
}

// Write the breakout sessions
function writeBreakoutSessions(cb,sheetName){
  async.eachSeries(sheetData[sheetName], function(row,callback){
    // If the breakout isn't confirmed, pass on it
    if (row['status'] !== 'Confirmed') { callback(null); }
    else {
      // Otherwise, proceed
      var entry = [];

      // Name (required)
      entry.push(row['sessiontitle']);
      // Description
      entry.push(row['sessiondescription']);

      // ... do some data crunching to format date ...
      var time = row['timeblock'].split(' - ');
      // Start time (required): "3/13/2014 1:11:00 PM"
      entry.push(row['date'] + ' ' + time[0]);
      // End time (required): "3/13/2014 1:11:00 PM"
      entry.push(row['date'] + ' ' + time[1]);

      // Location
      // ... we aren't using these for now ...
      entry.push(row['roomlocation']);

      // Session Tracks
      entry.push(row['sessionaudience']);

      // Filters
      // ... we aren't using these for now ...
      entry.push('');

      // Speaker IDs
      var speakers = [];
      if (row['speakersafe1'].length > 0) { speakers.push(row['speakersafe1']) }
      if (row['speakersafe2'].length > 0) { speakers.push(row['speakersafe2']) }
      if (row['speakersafe3'].length > 0) { speakers.push(row['speakersafe3']) }
      if (row['speakersafe4'].length > 0) { speakers.push(row['speakersafe4']) }
      if (row['speakersafe5'].length > 0) { speakers.push(row['speakersafe5']) }
      if (row['speakersafe6'].length > 0) { speakers.push(row['speakersafe6']) }
      if (row['speakersafe7'].length > 0) { speakers.push(row['speakersafe7']) }
      entry.push(speakers.join(','));

      // Link URLs
      // ... we aren't using these for now ...
      entry.push('');

      // Session ID (unique)
      entry.push(row['sessionuniquekey']);

      // Write the prepared row
      wstream.write( prepareRow(entry) );
      callback(null);
    }
  },function(err){ cb(err) });
}

function prepSpeakers(cb,sheetName){
  async.eachSeries(sheetData[sheetName], function(row,callback){
    // How many speakers do we support?
    var numSpeakers = 7,
        count = 0;

    async.until(
      function(){ return count == numSpeakers; },
      function(callllback){
        count++;
        var speaker_key = row['speakersafe'+count];

        // If we don't have speaker, skip
        if (row['speakername'+count].length === 0) {
          return callllback(null);
        }

        // Have we already seen this speaker? If so, skip it
        if (typeof(speakers[speaker_key]) === "object") {
          return callllback(null);
        }

        // OK, we've got a speaker, so go ahead and get it ready...
        var speaker = {};

        // Grab the name and safe/key, this is easy(ish)
        var name = row['speakername'+count].replace('Dr. ','').replace('Mayor ','')

        speaker['First Name (required)'] = name.substr(0,name.indexOf(' '));
        speaker['Last Name (required)'] = name.substr(name.indexOf(' ')+1);
        speaker['Speaker ID'] = row['speakersafe'+count];

        // Get the title/org
        if ( row['speakertitleorg'+count].indexOf(',') > 0 ) {
          // If there's a comma, i.e. if there's a 'Title here, Org here', split it up
          speaker['Title'] = row['speakertitleorg'+count].substr(0,row['speakertitleorg'+count].indexOf(','));
          speaker['Company'] = row['speakertitleorg'+count].substr(row['speakertitleorg'+count].indexOf(',')+1).replace(' ','');
        } else {
          // No comma, so shove everything in the title and make org empty
          speaker['Title'] = row['speakertitleorg'+count];
          speaker['Company'] = "";
        }

        // Figure out if we can grab a link to a photo, if we can, give it
        if ( row['speakerphoto'+count] == 'STAFF' ) {
          speaker['Image URL'] = 'http://codeforamerica.org/media/images/people/' + row['speakersafe'+count] + '.jpg';
        } else if ( row['speakerphoto'+count] == 'SPEAKER' ) {
          speaker['Image URL'] = 'http://codeforamerica.org/media/images/summit/2015/speakers/thumbnails/' + row['speakersafe'+count] + '.jpg';
        } else {
          speaker['Image URL'] = "";
        }

        // Don't do this. We don't want to write session IDs.
        speaker['Session IDs'] = "";

        // ... we don't have these ...
        speaker['Description'] = "";
        speaker['Website'] = "";
        speaker['Twitter Handle'] = "";
        speaker['Facebook URL'] = "";
        speaker['LinkedIn URL'] = "";
        speaker['Attendee ID'] = "";

        // speakers.push(speaker);
        speakers[row['speakersafe'+count]] = speaker;
        callllback(null);

      },
      function(err){ callback(null); }
    );
  },function(err){
    cb(err);
  });
}

function writeSpeakers(cb){
  async.forEachOfSeries(speakers, function(value,key,callback){
    var entry = [];

    // "First Name (required)"
    entry.push(value["First Name (required)"]);
    // "Last Name (required)"
    entry.push(value["Last Name (required)"]);
    // "Title"
    entry.push(value["Title"]);
    // "Company"
    entry.push(value["Company"]);
    // "Description"
    entry.push(value["Description"]);
    // "Image URL"
    entry.push(value["Image URL"]);
    // "Website"
    entry.push(value["Website"]);
    // "Twitter Handle"
    entry.push(value["Twitter Handle"]);
    // "Facebook URL"
    entry.push(value["Facebook URL"]);
    // "LinkedIn URL"
    entry.push(value["LinkedIn URL"]);
    // "Session IDs"
    entry.push(value["Session IDs"]);
    // "Attendee ID"
    entry.push(value["Attendee ID"]);
    // "Speaker ID"
    entry.push(value["Speaker ID"]);

    // Write the prepared row
    wstream.write( prepareRow(entry) );
    callback(null);
  },
  function(err){
    cb(null);
  });
}

// =====
// PERFORM ALL THE TASKS
// =====

async.series([
  function(cb){ getSheetData(cb)
              },
  function(cb){ openStream(cb,'session-import.csv')
              },
  function(cb){ writeHeaders(cb,'"Name (required)","Description","Start Time (required)","End Time (required)","Location","Session Tracks","Filters","Speaker IDs","Link URLs","Session ID"\n')
              },
  function(cb){ writePrimarySessions(cb,'external_live_data')
              },
  function(cb){ writeBreakoutSessions(cb,'breakout_descriptions')
              },
  function(cb){ closeStream(cb)
              },
  function(cb){ openStream(cb,'speakers-import.csv')
              },
  function(cb){ writeHeaders(cb,'"First Name (required)","Last Name (required)","Title","Company","Description","Image URL","Website","Twitter Handle","Facebook URL","LinkedIn URL","Session IDs","Attendee ID","Speaker ID"\n')
              },
  function(cb){ prepSpeakers(cb,'external_live_data')
              },
  function(cb){ prepSpeakers(cb,'breakout_descriptions')
              },
  function(cb){ writeSpeakers(cb)
              },
  function(cb){ closeStream(cb)
              },
]);
