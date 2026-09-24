# F4-60 — UI: home sin AOS, contacto CMS, logo login

## Cambios

- **HomePage.tsx**: eliminado AOS (`aos` + CSS + `init`). Los `data-aos` sin scroll dejaban secciones en `opacity:0` → hueco blanco gigante bajo el hero (§4.x UX).
- **ContactoPage.tsx**: Email / WhatsApp / Dirección leídos de `cmsTexts` (`footer_email`, `footer_whatsapp`, `footer_address`) con fallbacks; formato WhatsApp `+591 …`.
- **auth-simple-layout.tsx**: wordmark `AppLogoIcon` completo en login (antes solo icono "Lg", §4.4).
- **Seed (DB local, no en git)**: 5 claves footer CMS + `brands.active=true` ×10.

## Capturas

- `docs/audit2/home-final.png` — home completo sin hueco AOS.
- `docs/audit2/login-final.png` — logo SMART HOUSE en login.
- `docs/audit2/contacto-final.png` — contacto CMS + footer social.

## Verificación

- Capturas vía browser-automation (0 consola/red errors).
- `npm run build` reflejado; Laravel sirve build estático (`public/hot` eliminado).
