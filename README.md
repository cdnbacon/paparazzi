# Paparazzi

> Grabs screenshots, makes people happy?

# Usage

## Install

    npm install paparazzi

## Snapping screenshots

Currently, paparazzi works using SauceLabs. You'll need your saucelabs credentials.

    bin/snap \
      --username <saucelabs username> \
      --password <saucelabs token> \
      --url <url to screenshot> \
      --save <path to save screenshots>
