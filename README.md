# CV-Chatbot Marius Meier

Interaktiver CV-Chatbot als Web-App. Recruiter können frei Fragen zu Marius Meier stellen, Antworten kommen aus der Anthropic Claude API auf Basis der kuratierten Wissensbasis in [`wissensbasis.md`](wissensbasis.md).

## Projektstruktur

```
cv-chatbot-marius/
├── netlify.toml
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── index.html
├── wissensbasis.md
├── .env.example
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
└── netlify/
    └── functions/
        └── chat.js
```

Frontend (React + Vite + Tailwind) ruft die Netlify Function unter `/.netlify/functions/chat` auf. Die Function lädt `wissensbasis.md` beim Start, baut daraus den System-Prompt und ruft die Anthropic Messages API auf. Der API-Key bleibt serverseitig in der Umgebungsvariable `ANTHROPIC_API_KEY` und wird nie ans Frontend ausgeliefert.

## Voraussetzungen

- [Node.js](https://nodejs.org/) (LTS-Version, inklusive npm) — auf diesem Rechner noch nicht installiert, bitte zuerst nachholen.
- Ein GitHub-Account.
- Ein Netlify-Account.
- Ein Anthropic API-Key (console.anthropic.com).

## Lokal entwickeln

1. Abhängigkeiten installieren:
   ```
   npm install
   ```
2. `.env.example` zu `.env` kopieren und den echten Anthropic API-Key eintragen:
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```
3. Netlify CLI installieren (einmalig, global):
   ```
   npm install -g netlify-cli
   ```
4. Lokalen Dev-Server inklusive Function starten:
   ```
   netlify dev
   ```
   Wichtig: `netlify dev` verwenden, nicht nur `npm run dev` — sonst läuft die Chat-Function nicht mit.

## Deployment auf GitHub + Netlify

1. **GitHub-Repo erstellen und pushen**
   ```
   git init
   git add .
   git commit -m "Initial commit: CV-Chatbot Marius Meier"
   ```
   Auf GitHub ein neues (privates oder öffentliches) Repo anlegen, dann:
   ```
   git remote add origin https://github.com/<dein-user>/<dein-repo>.git
   git branch -M main
   git push -u origin main
   ```

2. **Netlify-Site anlegen**
   - Auf [app.netlify.com](https://app.netlify.com) einloggen.
   - "Add new site" → "Import an existing project" → GitHub auswählen → das Repo auswählen.
   - Build-Einstellungen sollten automatisch aus `netlify.toml` übernommen werden:
     - Build Command: `npm run build`
     - Publish Directory: `dist`
     - Functions Directory: `netlify/functions`

3. **API-Key hinterlegen**
   - Im Netlify-Dashboard: Site settings → Environment variables → "Add a variable".
   - Name: `ANTHROPIC_API_KEY`, Value: der echte Key.

4. **Deploy auslösen**
   - Netlify baut automatisch beim ersten Import. Danach triggert jeder Push auf `main` einen neuen Build.

## Wissensbasis im laufenden Betrieb pflegen

Die Datei `wissensbasis.md` liegt im Repo-Root und kann direkt über den GitHub-Web-Editor angepasst werden, ohne lokale Entwicklungsumgebung:

1. Auf GitHub zur Datei navigieren: `github.com/<dein-user>/<dein-repo>/blob/main/wissensbasis.md`.
2. Auf das Bleistift-Icon ("Edit this file") klicken.
3. Änderungen vornehmen.
4. Unten "Commit changes" klicken (direkt auf `main`).
5. Netlify erkennt den neuen Commit automatisch und baut neu. Nach rund zwei Minuten ist die Änderung live.

## Bewusste Einschränkungen (Stand Erstversion)

- Kein Chat-Verlauf über Sessions hinweg, kein localStorage/sessionStorage — jede Session startet frisch, kein Recruiter-Tracking.
- Keine Analytics oder Tracking-Skripte.
- Keine Streaming-Antworten, die Antwort erscheint komplett auf einmal.
- Kein Auth-System, kein Rate Limiting.
