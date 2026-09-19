---
name: Supabase browser seam
description: How this project keeps cloud auth optional while preserving a local-first clock experience.
---

NOVA CLOCK uses public Supabase Auth REST calls from the browser instead of bundling a Supabase client package, with guest mode and local persistence as the fallback.

**Why:** The package install path was unavailable during the first build, and a clock must stay usable offline or when cloud configuration is absent.

**How to apply:** Keep browser code limited to `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`; never add a service-role key or make cloud availability block the core clock tools.