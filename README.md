# Intervall-Timer

Sprechender Intervall-Timer fürs Workout. Standard: **55 s Belastung, 5 s Pause**, mit Ansagen auf Deutsch.

| Zeitpunkt in der Runde | Ansage |
| --- | --- |
| 0:00 | „Los“ |
| 0:45 | „Noch 10 Sekunden“ |
| 0:55 | „Wechsel“ |
| 1:00 | nächste Runde |

In der letzten Runde entfällt die Pause: Nach der Belastung kommt direkt „Fertig. Gut gemacht“.

Belastung, Hinweis vor Ablauf, Pause und Rundenzahl (∞ = endlos) lassen sich in der App einstellen und werden im Browser gespeichert.

## Funktionen

- Sprachausgabe (Web Speech API, deutsche Stimme des Geräts) plus kurzer Piepton je Wechsel
- Display bleibt während des Timers an (Screen Wake Lock)
- Läuft nach dem ersten Laden **offline** (PWA mit Service Worker)
- Auf dem iPhone über Safari → Teilen → „Zum Home-Bildschirm“ wie eine App nutzbar
- Heller und dunkler Modus nach Systemeinstellung

## Tech-Stack

React 19 · TypeScript · Vite · Tailwind CSS 4 · vite-plugin-pwa · Vitest

## Loslegen

Voraussetzung: Node.js 20 oder neuer.

```bash
npm install
npm run dev        # Entwicklungsserver auf http://localhost:5173
npm test           # Unit-Tests der Timer-Logik
npm run build      # Produktions-Build nach dist/
npm run preview    # Build lokal ansehen
```

Zum Testen auf dem iPhone im selben WLAN: `npm run dev -- --host` und die angezeigte Netzwerk-Adresse in Safari öffnen. Wake Lock und Service Worker funktionieren nur über HTTPS (oder localhost), also erst nach dem Deployment vollständig.

## Hinweise zu iOS

- Der **Stummschalter** muss aus sein, sonst bleibt die Sprachausgabe still.
- iOS gibt Audio erst nach einem Tipp frei. Deshalb startet der Ton immer über den Start-Button.
- Bei gesperrtem Bildschirm pausiert Safari die Seite. Der Timer hält das Display deshalb an.
