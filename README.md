# My Simple Workout Tracker (work in progress!)
This is a workout tracker that I made for own purpose usage. Since I did not find any suitable application for my puproses I decided to develope it by myself.

## Tools
Frontend: React, TypeScript, RTK, RTK Querry, Ant Design, D3.js, Styled Components, Day.js.
<br>
Backend: Express.js, MongoDB.
Deployment: Docker (WIP).

I chose Next.js to get more practice of it, but eventually it's not the best choice for this specifically mobile like app, so later I switched to Vite builder.

I did not spend much time on making backend codebase neat since frontend is my specialization and I'm not really interested in backend.

Currently I'm migrating the app to Capacitor, since background work in browser is severly limited.

## Run locally
To run it locally you don't need to have [Backend](https://github.com/Sv1nnet/mswt-server) installed. Instead you can choose `Continue without login` on a login page and try it out with IndexedDB storage.

Then:
1. Switch to vite-pwa branch
2. Rename `EXAMPLE.env` file to `.env` and configure it.
3. Run `npm i`
4. Run `npm run dev`

For non-commercial use only.
