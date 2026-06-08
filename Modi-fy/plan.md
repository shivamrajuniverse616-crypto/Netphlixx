# Modi-fy App Implementation Plan

## Goal
Build "Modi-fy", a premium and dynamic music streaming application. The app will feature a sleek, modern UI heavily inspired by the smooth animations and glassmorphic aesthetics of the Netphlix app.

## Tech Stack
- **Frontend**: React (Vite)
- **Styling**: Tailwind CSS for utility classes
- **Animations**: Framer Motion for interactive, fluid animations (magnetic buttons, page transitions, expanding players)
- **Audio Playback**: HTML5 `<audio>` API

## APIs Integrated
1. **YouTube Music API** (`https://music-cgd8.onrender.com`)
   - Search: `/api/search?q=`
   - Stream: `/api/stream/<video_id>` (Supports range headers)
   - Lyrics: `/api/lyrics/<video_id>` (Synced `.lrc` format)
   - Recommendations: `/api/watch/<video_id>` & `/api/related/<browse_id>`
2. **JioSaavn API** (`https://jiosaavn-api.shivamrajuniverse616.workers.dev/docs`)
   - Used for accessing regional Indian and Bollywood tracks.

## Core Features
1. **Dynamic UI**
   - Dynamic background colors that adapt to the currently playing album art (using `fast-average-color`).
   - Smooth layout transitions when opening the "Now Playing" view.
2. **Search & Discovery**
   - Unified search bar fetching results from both APIs.
   - Horizontal scrolling rows for top hits, trending artists, and similar tracks.
3. **Music Player**
   - Persistent bottom player bar.
   - Seekable progress bar, volume controls, and play/pause toggles.
   - Autoplay queue built using YouTube API recommendations.
4. **Synced Lyrics**
   - Real-time lyrics scrolling in sync with the audio track.

## Phased Development
- **Phase 1**: Scaffold the Vite React app, setup Tailwind and Framer Motion.
- **Phase 2**: Implement the unified search and display track lists.
- **Phase 3**: Build the persistent HTML5 audio player and integrate the `/api/stream` endpoint.
- **Phase 4**: Add synced lyrics view and autoplay queue.
- **Phase 5**: Polish UI/UX with magnetic buttons, dynamic gradients, and shimmer loading states.
