## Usage

Those templates dependencies are maintained via [pnpm](https://pnpm.io) via `pnpm up -Lri`.

This is the reason you see a `pnpm-lock.yaml`. That being said, any package manager will work. This file can be safely be removed once you clone a template.

```bash
$ npm install # or pnpm install or yarn install
```

### Learn more on the [Solid Website](https://solidjs.com) and come chat with us on our [Discord](https://discord.com/invite/solidjs)

## Available Scripts

In the project directory, you can run:

### `npm dev` or `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>

### `npm run build`

Builds the app for production to the `dist` folder.<br>
It correctly bundles Solid in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

## Deployment

You can deploy the `dist` folder to any static host provider (netlify, surge, now, etc.)


## Tasks 
- [ ] Web RTC
  - [ ] TeamChat
    - [ ] UI
    - [ ] Function
      - [ ] Send message
      - [ ] Receive message
  - [ ] User Management
    - [ ] UI
    - [ ] Function
      - [ ] Kick
      - [ ] Invite
      - [ ] Block
- [ ] Canvas
  - [ ] Zoom funktion
    - [ ] Idee: based on font size maybe  
- [x] Relationship
  - [ ] FIX Delete Relationship
  - [x] Line/Arrow improvment
  - [ ] Line Selection improvements
  - [x] Slim Derive save (only uuid)
  - [ ] Config 
    - [ ] Association
      - [ ] UI
      - [x] Arrow draw
    - [ ] Directional association
      - [ ] UI
      - [x] Arrow draw
    - [ ] Bidirectional association
      - [ ] UI
      - [x] Arrow draw
    - [ ] Composition
      - [ ] UI
      - [x] Arrow draw
    - [ ] Aggregation
      - [ ] UI
      - [x] Arrow draw
    - [ ] Usage
      - [ ] UI
      - [x] Arrow draw
    - [ ] Subsitution
      - [ ] Arrow draw
      - [x] UI
    - [ ] Abstraction
      - [ ] Arrow draw
      - [x] UI
    - [ ] Dependency
      - [ ] Arrow draw
      - [X] UI
    - [ ] Information Flow
      - [ ] Arrow draw
      - [X] UI 
    - [ ] Containment
      - [ ] Arrow draw
      - [X] UI
    - [ ] Realization
      - [ ] Arrow draw
      - [x] UI
    - [ ] Generalization
      - [ ] Arrow draw
      - [X] UI
  - [x] Arrow rotation
- [x] Relationship searchbar
  -  Yes, but with filter
- [ ] auto formatting
  - [ ] Up-Down formatting
  - [ ] Down-Up formatting
  - [ ] Left-Right formatting
  - [ ] Right-Left formatting
- [ ] Group Selection
  - [x] Visiable selection area
  - [ ] Marking selected classes
  - [ ] Moving
- [ ] Comment function 
- [ ] Browser save


## Idee
- Replace the derive-meu to connection-menu with connection type (derive, use, ... ) selection option and config
