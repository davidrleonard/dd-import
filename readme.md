DoubleDutch Imports
============

A set of JavaScript scripts (say that five times fast) running on Node that read the Google Spreadsheets API and build .csv files that we can import into DoubleDutch, our event app.

This is a pretty small project that just does a few things in a kinda meh way. (It's a one off need.) Consider it alpha tin-can-with-string software -- I wouldn't use it as a foundation for anything.

# Configuring the app

### Specific instructions for this app
General instructions for setting this up follow. **dd-imports** data model is tied directly to our Summit schedule spreadsheets. To get the `config.js` file with everything filled out for that spreadsheet, Slack or email David Leonard ([dleonard@codeforamerica.org](mailto:dleonard@codeforamerica.org)).

### Local Configuration
This app uses the [Google Sheets API](https://developers.google.com/google-apps/spreadsheets/), and requires authentication through a [Google Service Account](https://developers.google.com/identity/protocols/OAuth2ServiceAccount).

1. Create a new [Google Developer](https://developers.google.com/) app. Give your account access to the Spreadsheet API scope.
2. Create a new [Service Account](https://developers.google.com/identity/protocols/OAuth2ServiceAccount#creatinganaccount) for authorization. Download the JSON-formatted private key.
3. Copy the `config-example.js` file to `config.js`. Follow the instructions in the file to specify out your spreadsheet ID, Service Account email, and Service Account key.

### Server configuration

You can also upload a `config.js` file to your server. However if you use a service like Heroku that relies on checking files into git, it's not recommended to check your secrets into your repository.

To allow the app to correctly authenticate to the Google API, you can set up environment variables in the place of config.js. The environment variables are:

    $ export GOOGLE_SHEET_KEY="xxxxx"
    $ export GOOGLE_SERVICE_EMAIL="xxxxx@developer.gserviceaccount.com"
    $ export GOOGLE_SERVICE_PRIVATE_KEY="XXXXXXX
    $ XXXXXXXXXXXX
    $ XXXXXXXXXXXX
    $ XXXXXXXXXXXX
    $ "

When exporting your Service Account private key, you'll need to turn the newlines (`\n`) into actual line breaks. You can do so by using quotes in your shell to allow entry of multiple lines:

    $ export GOOGLE_SERVICE_PRIVATE_KEY="FIRST LINEXXXXXXX # press enter to keep going
    $ SECOND LINE XXXXXXXXXXXXXXX
    $ ...etc...
    $ " # finish with and end quote to stop exporting

# To run locally

You'll need:
* [Node - click for installation instructions](https://github.com/codeforamerica/howto/blob/master/Node.js.md)

Run the following in your shell/terminal:

    $ git clone https://github.com/davidrleonard/dd-imports.git
    $ cd dd-imports
    $ npm install
    $ npm run-scripts run

# To run on a server

Umm... don't run it on a server. It isn't a service. It's a just a script.
