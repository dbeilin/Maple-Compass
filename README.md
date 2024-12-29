# Maple Compass 🍁
It's a web app for finding paths between two maps in MapleStory.

## Why? 
I recently started playing again for the nostalgia (Artale). I was searching for a tool such as this to help me remember to how get to certain maps.
Also be cause it's fun 😁

## How to use
Simply choose a starting and end map, click on search and hope it finds a connection between the portals.

## Notes
- Due to some API constraints, some maps cannot be connected. It's best to just search for maps in the same area (Island, World).
- This website is just a hobby project, I can't promise to fix every issue found, but feel free to open PRs.

## Run Locally
1. Clone the repo
2. `npm build`
3. `npm run dev`
4. Access on http://localhost:3001/

### Docker
1. Run `docker run -p 3001:3001 beinish/ms-pathfinder`
2. Access on http://localhost:3001/

## API
[MapleStory.io](https://maplestory.io) was used for the API.
