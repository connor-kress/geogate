# Geogate Client
## Hosting for Development
```bash
$ npm start  # using Expo Go app
```
```bash
$ npm run web  # using web version
```

## Building Application
```bash
$ sudo npm install -g eas-cli
$ eas login  # prompts for credentials
$ eas build:configure  # creates eas.json, maybe not needed
$ eas build --platform {android,ios}  # choose appropriate target
```
