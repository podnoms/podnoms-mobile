# PodNoms mobile

The PodNoms app for Android and iOS, mainly for listening: sign in, follow
shows and find trending ones, watch broadcasts, see your own shows and how
their episodes are coming along, add an episode from a link (or by sharing one to
the app from YouTube, a browser, etc.), read and write comments on episodes,
and listen, in the background, with
lock screen controls, picking up where you left off here or on the site.

Built with Expo (SDK 58), Expo Router, NativeWind and
[React Native Reusables](https://reactnativereusables.com). It takes the
site's theme (as set on the admin Theme tab) from the server, and follows the
phone's light/dark setting unless you choose one in Settings.

## Development

The share sheet and lock screen controls need native code, so the app runs in a
**development build**, not Expo Go.

```sh
bun install
bun run android                # builds and installs a dev build on a device/emulator, then starts Metro
bun run ios                    # the same for iOS (macOS only)
# or build in the cloud:
bunx eas-cli build --profile development --platform android
bun run start                  # just Metro, once a dev build is installed (rebuild after adding native modules)
bun run web                    # the web build, for checking layouts, on http://localhost:19006
```

Run `bunx tsc --noEmit` and `bun run lint` before calling anything done.

### Pointing it at a local server

The server defaults to `https://podnoms.com`; change it on the sign-in screen
("Server: … · Change"). For a platform running with `bun run _dev`, use your
machine's LAN address, e.g. `http://192.168.1.20:5173`. `localhost` is the
phone itself. Android only allows plain `http` in debug builds.

Provider sign-in only works against the server's own public address
(`SITE_URL`, e.g. `https://podnoms.dev.fergl.ie:3000`), not `localhost:5173`:
the provider sends the browser back to `SITE_URL`, and Auth.js's cookies have
to be on the same host the sign-in started on.

## How it talks to PodNoms

Through the mobile API in `podnoms-platform` (`src/routes/api/mobile/`).
Signing in gives a token, kept in SecureStore and sent as
`Authorization: Bearer …`. With an email and password, the app posts them;
with GitHub, Google or Facebook (whichever the server has set up), it opens
the site's usual sign-in in a browser, which comes back to `podnoms://auth`
with a one-time code the app exchanges for a token, proving with a PKCE-style
verifier that it started the sign-in. Users with two-factor authentication
then enter an authenticator or recovery code either way; security keys aren't
supported on the app.

On web (`bun run web`), provider sign-in opens a popup that comes back to the
app's `/sign-in` page instead; the platform allows that only on `localhost`.
Signing in with a provider leaves that browser signed in to the site too.

| | |
| --- | --- |
| `POST /api/mobile/auth/sign-in`, `/two-factor`, `/sign-out` | tokens |
| `GET /api/mobile/theme` | the site's theme colours, as HSL |
| `GET /api/mobile/auth/providers`; `GET …/oauth/<provider>` → `…/oauth/finish`; `POST …/oauth/exchange` | signing in with a provider |
| `GET /api/mobile/me` | the signed-in user |
| `GET /api/mobile/home` | the home page: shows followed, trending and the user's own |
| `GET /api/mobile/shows`, `/shows/<slug>` | the user's shows; any show they may see with its episodes (with live progress on their own) |
| `POST /api/mobile/follows` | following and unfollowing a show |
| `POST /api/mobile/episodes`; `POST …/<id>/retry`; `DELETE …/<id>` | adding, retrying, deleting episodes |
| `POST /api/mobile/episodes/<id>/position`, `GET /api/mobile/continue-listening` | where you left off |
| `GET /api/mobile/episodes/<id>`; `POST …/<id>/comments` | an episode's page and its comments; commenting and replying |
| `POST /api/mobile/comments/<id>/like`, `DELETE /api/mobile/comments/<id>` | liking and deleting comments |
| `GET /api/mobile/live/<slug>`; `GET …/<slug>/hls/<file>` | a show's live page (what's on, chat, viewers), polled every few seconds; its video as HLS, by token |
| `GET /api/mobile/live` | the slugs of shows live now, polled for the badges |
| `GET`, `POST /api/mobile/notifications`; `POST …/shows`; `POST …/device` | notification settings; muting a followed show; this device's push token |
| `POST /api/mobile/broadcasts/<id>/chat`, `DELETE /api/mobile/chat/<id>` | writing and deleting live chat |
| `GET /api/episodes/<id>/audio` | audio (takes the token too) |

## License

[MIT](LICENSE) © 2026 Fergal Moran

The license also retains the Expo copyright notice.

## Push notifications

Followers hear about shows going live and new episodes through Expo's push
service. Builds need an EAS project and credentials, once:

1. `bunx eas-cli init`, which adds the project id to `app.json`.
2. Android: make a Firebase project with an Android app for `com.podnoms.mobile`,
   put its `google-services.json` in the project root, set
   `"googleServicesFile": "./google-services.json"` under `expo.android` in
   `app.json`, and upload a service account key for FCM V1 with
   `bunx eas-cli credentials`.
3. iOS: `bunx eas-cli credentials` sets up the APNs key.
4. Rebuild the app.

Until then the settings work, but the Notifications screen says this build
can't receive them.
