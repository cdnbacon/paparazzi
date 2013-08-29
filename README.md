# Paparazzi

> Grabs screenshots, makes people happy?

# Usage

## Install

    npm install paparazzi -g   # Soon :) Need to put it on the bin path 

## Snapping screenshots

Currently, paparazzi works using SauceLabs. You'll need your saucelabs credentials.

Calling it thusly will visit the url using the entire browser matrix.

    bin/snap \
      --username <saucelabs username> \
      --password <saucelabs token> \
      --url <url to screenshot> \
      --save <path to save screenshots>

To limit it to a specific browser, use the `--browser` filter

    bin/snap \
      --username <saucelabs username> \
      --password <saucelabs token> \
      --url <url to screenshot> \
      --save <path to save screenshots> \
      --browser IE7

