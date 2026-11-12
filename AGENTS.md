<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architettura
- Accesso con codice fiscale: email tecnica `<cf>@chifacosa.local`, registrazione pubblica disattivata; gli utenti li crea solo un admin.
- Dati turno condivisi nel database (turno_weeks, app_settings); scrive solo il ruolo admin.
- Le funzioni amministrative vivono nella pagina protetta `/admin`; evita pagine amministrative duplicate.
- Share the row layout through one React Query key, invalidate after saving, and refresh on focus and periodically so open schedules do not retain stale rows; keep unsaved Admin edits separate from refreshed data.
- Persist row removal directly from its action and restore the previous draft on failure, so leaving Admin does not silently undo a removal.
