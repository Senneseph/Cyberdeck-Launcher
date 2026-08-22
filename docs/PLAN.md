# Cyberdeck-Launcher — Work Plan

The Launcher is the **OS-like shell** of the Cyberdeck ecosystem: it manages
apps, windows, permissions, and (via *Cyberdeck Compatibility*) the share
mechanism between apps. It consumes jcule (BLC/router), jellicule (components),
memory-core (storage), cyber-eyes (logging), and comlink (messaging).

This plan replaces the current placeholder (`app/src/index.js` = "Coming soon…").

## Phases

### L1 — Shell foundation
- App grid/list + navigation + windowing UI built with jellicule + jcule's router.
- Theme service: light/dark/**auto** (`prefers-color-scheme`), inheritable system style.
- Fix the broken `app/public/index.html` → `app/src/index.js` wiring; add a build
  (tsc) + docker-compose following the canonical structure.

### L2 — App registry + lifecycle
- Parse the WebAX manifest `webax` field (package_id, version, permissions, services).
- Install / launch / terminate apps; permissions UI.
- The **windowing model** (decision #5) is decided here.

### L3 — Services
- Storage via memory-core; notification service; update service.

### L4 — Cyberdeck Compatibility
- Build the **capability registry** from apps' `provides` / `requires` declarations.
- The **share sheet**: route a resource from one app to any app accepting its
  format/intent (gallery → message list; video → transcription → eReader → TTS).

### L5 — Comlink integration
- Implement comlink (messaging + trust + service discovery) and wire the share
  mechanism + inter-app communication through it.

### L6 — CyberdeckOS shims + device sync
- CyberdeckOS shim API (privileged services: Ollama, Postgres, hardware).
- Device sync / install prompts via WebAXDN.

## Dependencies

- L1–L3 depend on jcule/jellicule/memory-core/cyber-eyes (✅ done).
- L4 depends on the **Cyberdeck Compatibility schema** (decision #4).
- L5 depends on **comlink** (decision #3).
- L6 depends on **CyberdeckOS** scope (decision #6) + Phase 5 distribution.

## Open questions to resolve first

1. Windowing model (iframes vs. single-SPA vs. separate contexts).
2. Cyberdeck Compatibility manifest vocabulary.
3. comlink transport + trust model.
