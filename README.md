# Auto One Egypt

This is a fresh, standalone prototype for managing social links on the main page and per-car pages. It is not the source code for the currently deployed autonegypt.com website.

## Prototype behavior

- The homepage preview and per-car previews show only enabled social links with a non-empty URL.
- The dashboard lets an editor show or hide links, add a URL for a social platform, and manage links separately for each car.
- State is stored in this browser's `localStorage` only. It is not shared with other users or devices and is not connected to autonegypt.com.
- This prototype has no authentication, server, database, or file/image upload.

Do not use it to manage real production content or enter confidential data. Connect it to the real website's authenticated backend before production use.

## Run locally

Open `index.html` in a modern browser. No packages or build step are needed.
