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

To limit it to a specific browser, use the `--browser` filter.

    bin/snap \
      --username <saucelabs username> \
      --password <saucelabs token> \
      --url <url to screenshot> \
      --save <path to save screenshots> \
      --browser IE7

### Multiple urls per session
You can also pipe multiple urls into the process (one URL per line).

    cat urls | bin/snap \
                 --username <saucelabs username> \
                 --password <saucelabs token> \
                 --save <path to save screenshots>

Each browser session will visit each url in FIFO order.