var path = require('path')
    , fs = require('fs')
    , _ = require('underscore')
    , async = require('async')
    , dir = path.dirname(require.main.filename) + '/output/' // path to the root
    , barstool = require('./lib/barstool')
    , sheetData
    , wstream
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
              }
]);
