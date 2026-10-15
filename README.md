# Fry Frenchi, Surat

One-page site for Fry Frenchi, the loaded fries food truck at Phoenix Mall, Vesu, Surat. Designed and built by Prime Digitals.

Plain HTML, CSS and JS. No build step. Open `index.html` or serve the folder.

- `js/menu-data.js` holds the menu: two sizes, six flavours, and the sides (prices in ₹)
- `js/main.js` holds the shop details (`CONFIG`), the menu board, the party planner and the motion (GSAP + ScrollTrigger, Lenis)
- `assets/` holds the logo and photos. `cheese-pour`, `sauce-fries` and `masala-fries` are the truck's own photos. The rest are Unsplash stock for now.

## Orders

There is no public phone number yet, so every order button opens an Instagram DM to @fry.frenchi and copies the order text first, so the customer only has to paste it.

To switch to WhatsApp, set `whatsapp` in `CONFIG` at the top of `js/main.js` to the shop's number (country code, no plus, e.g. `919876543210`). Every order button and the party planner then open WhatsApp with the message already filled in.
