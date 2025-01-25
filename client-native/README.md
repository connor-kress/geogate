# Geogate Client
## Hosting for Development
`npm start` (with Expo Go app)
`npm run web` (localhost web version)

## Building Application
```bash
$ sudo npm install -g eas-cli
$ eas login  # prompts for credentials
$ eas build:configure  # creates eas.json, maybe not needed
$ eas build --platform {android,ios}  # choose appropriate target
```
