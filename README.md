# blueRonyHazard.github.io

Personal site of Pritam Ghosh, live at **https://blueronyhazard.github.io**.

Plain HTML, CSS and JavaScript with no build step, so GitHub Pages serves it as-is.

- Hero with an interactive terminal (try `help`, `whoami`, `projects`, `theme`, Tab to complete, ↑/↓ for history)
- Animated constellation background that reacts to the mouse
- Dark and light themes, remembered per browser
- Respects `prefers-reduced-motion`

```
index.html      page markup and content
css/style.css   styles and themes
js/main.js      terminal, background, theme, scroll effects
favicon.svg
```

Run locally: `python3 -m http.server` then open http://localhost:8000.
