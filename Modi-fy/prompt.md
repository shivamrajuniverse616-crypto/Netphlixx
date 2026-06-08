# Modi-fy Generator Prompt

Use the following instructions to begin coding the Modi-fy music application.

**Context:**
You are building a premium music streaming application named "Modi-fy". I have provided a `context.md` file containing UI/UX animation paradigms (Framer Motion, glassmorphism, magnetic buttons, dynamic backgrounds) and a `plan.md` detailing the roadmap and APIs.

**Instructions:**
1. **Initialize the Project**: Scaffold a new Vite React project inside the `Modi-fy` folder if not already done. Install `tailwindcss`, `framer-motion`, `lucide-react`, and `fast-average-color`.
2. **Setup Global Styles**: Recreate the dark mode, shimmering loading states, and custom utility classes referenced in `context.md`.
3. **Build Core Components**: 
   - Create a `MagneticButton` wrapper component.
   - Build a sleek, glassmorphic `Navbar` with a unified search bar.
4. **Implement API Services**: 
   - Write service functions to fetch search results from `https://music-cgd8.onrender.com/api/search` and the JioSaavn API.
5. **Create the Music Player**: 
   - Implement a persistent bottom audio player using the HTML5 `<audio>` element. 
   - Use the `/api/stream/<video_id>` endpoint for playback.
6. **Focus on Aesthetics**: Ensure the app looks visually stunning. Use dynamic gradients that match album art and ensure all interactions have micro-animations.

**Begin Phase 1 and Phase 2 now.**
