# Robotic Rays

The public website for Robotic Rays: faithful 3D product digitization for digital commerce, with a longer-term vision for physical AI.

## Website

https://roboticrays.com

Static HTML, CSS and JavaScript, hosted on GitHub Pages. No package installation or build is required. The existing `CNAME` is preserved, and `.nojekyll` enables direct static-file hosting.

## Files

- `index.html`: content and page structure.
- `assets/styles.css`: responsive design and reduced-motion support.
- `assets/site.js`: mobile navigation and accessible video playback.
- `media/images/`: lightweight video posters.
- `media/video/`: approved product reconstruction videos prepared for the web.

Videos load only when requested. Their baked-in white canvas is blended into the tinted presentation surfaces with CSS; the video files themselves are unchanged. Text reveals and subtle pointer-based perspective effects respect reduced-motion preferences; pointer effects are disabled on touch devices. The gallery opens native video playback in a keyboard-accessible dialog; visitors without JavaScript can use direct video links.

## Private reference material

`website_contents/` is local-only and excluded by `.gitignore`. Do not force-add, upload or publish it. No public page references that directory. Only the two product reconstruction videos and their posters have been prepared as separate public assets; robot footage, simulations and the pitch are excluded.

Before staging or publishing, confirm `git ls-files website_contents` returns no files and `git check-ignore website_contents/main_pitch.pdf` identifies the ignore rule. Publish only the site source and approved assets. The full repository directory should never be uploaded as an unfiltered archive.

## Content updates

The current offering is managed scanning pilots. Robot subscriptions, wider hardware support and physical AI are future directions. Keep prototype timing qualified by tested conditions; do not add unsupported commercial performance claims.

## Contact

info@roboticrays.com
