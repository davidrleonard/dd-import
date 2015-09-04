// -----
// APP CONFIGURATION:
//
// This file can hold configuration settings for the app used during local
// development. When deployed on a hosting platform, you should use environment
// variables instead. See the config section in README.md for more info.
// NOTE: You'll need a Google Service Account setup to use this authorization
// structure.
//
// AVAILABLE SETTINGS:
//
// google_sheet_key (string)
// - The key of the spreadsheet your data is held in. You can find this at the
//   end of the URL used to edit the Google Sheet in your browser.
//
// google_service_email (string)
// - The email address set up for your Google Service Account. The format is:
//   xxxxxxxxxxxxx@developer.gserviceaccount.com
//
// google_service_private_key (string)
// - A private key downloaded from your Google Service Account. New lines should
//   be encoded as \n in the key. The format is:
//   -----BEGIN PRIVATE KEY-----\nXXXX\nXXXX...\n-----END PRIVATE KEY-----\n
//
// EXAMPLE CONFIGURATION:
//
// module.exports = {
//   "google_sheet_key" : "XXXXXXXXXXXXXXXXXX",
//   "google_service_email" : "XXXXXXXXXXXX@developer.gserviceaccount.com",
//   "google_service_private_key" : "-----BEGIN PRIVATE KEY-----\nXXXXXXXXXXXXXX\n...\nXXXXXXXXXXXXXXXXXX\n-----END PRIVATE KEY-----\n"
// }

module.exports = {
}
