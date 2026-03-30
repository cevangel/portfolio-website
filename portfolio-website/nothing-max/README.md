# Nothing max (Do Nothing Gacha)

A small browser app for **mindful stillness**: you set a timer, press **Start Pull**, then **do not interact** with the page (no clicks, scroll, keys, or tab switch) until the timer finishes. If you make_it, you get a playful **gacha-style reward** (“spirits” with Common / Rare / Epic rarity), optional **post-check-in** fields (SUDs, feelings, notes), and **recent history** stored in the browser.

Originally based on a [CodePen](https://codepen.io/cevangel/pen/JoRyZLK).

**Tech:** plain HTML, CSS, and JavaScript. No `npm install`, no build step.

---

## How to run

### Easiest: open the app

1. Put these files in **`assets/`** (same folder as `index.html`):

   - **`spongebobNothing.png`** — buddy panel image  
   - **`spongePatBeatup.webp`** — shown after a failed run  
   - **`meditationBell.mp3`**, **`pokemonLevelUp.mp3`**, **`punching.mp3`**, **`wilhelmscream.mp3`**

   If your images are `.jpg` / `.webp`, update the `src` paths in **`index.html`**.

2. Open **`index.html`** in your browser.

Keep **`script.js`** next to `index.html`. If audio fails from a `file://` URL, use a local server:

```bash
npx --yes serve .
```

Then open the URL printed (often `http://localhost:3000`).

---

## Data and privacy

Stats, journal entries, and collection progress are stored in **`localStorage`** under the key `doNothingGachaData_v1`. Clearing site data removes them. Nothing sends data to a server.

---

## Tips

- Minimum timer length enforced in code: **5 seconds** (longer sessions are normal).
- **Switching tabs or minimizing** counts as failing the run (visibility change triggers reset).
- **Bell + level-up** clips are MP3s in **`assets/`**; **Start** still plays a short Web Audio **chime**.
- **Interrupting** the timer plays **`punching.mp3`**, then **`wilhelmscream.mp3`**, then an overlay with the beat-up image and caption (OK dismisses it).
- Each **full minute** of stillness plays the meditation bell, with a timer pulse and haptics (where supported). **Finishing** plays the level-up clip plus a **~4 second** victory glow on the ring and time display and a longer vibration pattern.
