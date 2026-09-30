# RT Learning

RT Learning is a browser-based English-learning platform. It brings course content, practice activities, and learner tools together in a responsive multi-page website.

## Product Areas

- **Course library:** Academic writing, business English, everyday fluency, and IELTS/TOEFL preparation
- **Practice:** Quizzes and interactive test activities
- **Learner tools:** Dashboard, profile, theme preferences, and browser-side progress features
- **Supporting pages:** Contact, login, and logout screens

## Technology

- HTML, CSS, and browser-side JavaScript
- Tailwind CSS 4, with project styles in `css/theme.css`
- No backend service or database is required to run the current site

## Getting Started

### Prerequisites

- Python 3 for the local web server
- Node.js and npm only if you need to rebuild the Tailwind stylesheet

### Run the site

From the project root, start a local server:

```powershell
py -m http.server 8000
```

Open [http://localhost:8000](http://localhost:8000) in your browser. A local server is recommended so page navigation and browser storage work consistently.

### Rebuild CSS

Install the declared npm dependencies, then compile the Tailwind input stylesheet:

```sh
npm install
npx @tailwindcss/cli -i ./css/input.css -o ./css/output.css
```

For continuous rebuilding during development, append `--watch` to the CLI command. The project does not currently define npm `start` or `build` scripts.

## Repository Layout

```text
.
├── index.html       # Main dashboard
├── Pages/           # Account pages, courses, lessons, and practice tests
├── css/             # Tailwind input, generated CSS, and theme styles
├── js/              # Dashboard, navigation, theme, profile, and progress logic
└── images/           # Site image assets
```

## Implementation Notes

The site is currently delivered as static files. Theme preferences and related learner state are handled in the browser; there is no server-side account or progress persistence in this project setup.