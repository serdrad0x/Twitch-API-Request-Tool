# Twitch API Request Tool
A tool to easily make requests to the Twitch API. It supports Kraken ([Twitch API v5](https://dev.twitch.tv/docs/v5/))
and Helix ([New Twitch API](https://dev.twitch.tv/docs/api/))

# Getting Started - Local
You can use the Twitch API Request Tool directly from its website https://tart.retro-elite.de or run it local on your own
machine.

If you want to run it local, you have to follow the following steps:

1. Easiest way would be to run a web server locally. Otherwise you have to handle (depending on your browser) CORS
(cross origin requests) issues. 
2. Change "redirect_uri" from https://tart.retro-elite.de/index.html to your local host. E.g.: 
redirect_uri = "localhost"
3. Don't forget to match the OAuth Redirect URL from https://dev.twitch.tv/console/apps of your application with your
local change!

# Getting Started - Online
To use the Twitch API Request Tool you need a client id from Twitch. You can get one at 
https://dev.twitch.tv/console/apps/create

Just fill in the following information and click create:

| Field               | Description                                             |
| ------------------- | ------------------------------------------------------- |
| Name                | Feel free to choose any name you like!                  |
| OAuth Redirect URL  | You have to use: https://tart.retro-elite.de/index.html |
| Category            | Should be: Website Integration                          |

You will get your client id which you can use on the website!

# How to use
Short overview about possible usages!

### Scopes
Scopes define which level of access you granted the application to request. Some requests don't require any scopes but
will only show public information. 

### User Access Token
The user access token is tied to the user, granted scopes and client id which asked for permission. It will be send
with your requests to access data from Twitch if needed.

Keep it secret like you would do with a password!

### Validate
If you validate your user access token you get information if the token is still active, which client id it was 
requested for and the associated scopes you granted permission for.

### Revoke
If you don't want the application to user your access token any further, you can revoke your granted permissions.
You should do this every time you finished using the Twitch API Request Tool!

# Additionally used
Here is a list of sources the Twitch API Request Tool uses:

| Name + Version           | Website                                                  |
| ------------------------ | -------------------------------------------------------- |
| Bootstrap 4.3.1          | https://www.bootstrapcdn.com/                            |
| bootstrap-select 1.13.10 | https://developer.snapappointments.com/bootstrap-select/ |
| BsMultiSelect 0.2.22     | https://github.com/DashboardCode/BsMultiSelect           |
| jQuery 3.4.1             | https://jquery.com/                                      |
| popper 1.15.0            | https://popper.js.org/                                   |

# Disclaimer
The Twitch API Request Tool is an unofficial tool to request the Twitch API. It is by no means associated with Twitch!
