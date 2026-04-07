

## Fix: Back button in ServizioDetailPage should preserve URL filters

### Problem
The back button navigates explicitly to `/servizi` (or `/servizi?tab=X`), discarding `?data=` and `?id=` filter params that now live in the URL.

### Changes — 2 files

#### 1. `src/pages/servizi/ServizioDetailPage.tsx`
**Line 426-432** — Desktop sidebar `onBack` callback:
```
// BEFORE
onBack={() => {
  if (isFromReport && reportFilters) {
    navigate('/report-passeggeri', { state: { filters: reportFilters } });
  } else {
    const backUrl = isDipendente ? '/dipendente/servizi-assegnati' : (fromTab ? `/servizi?tab=${fromTab}` : '/servizi');
    navigate(backUrl);
  }
}}

// AFTER
onBack={() => {
  if (isFromReport && reportFilters) {
    navigate('/report-passeggeri', { state: { filters: reportFilters } });
  } else {
    navigate(-1);
  }
}}
```

**Lines 306 and 551** — Post-delete `navigate('/servizi')`: These stay unchanged. After deleting a service, navigating to a clean `/servizi` is correct (the deleted service no longer exists in the filtered view).

#### 2. `src/components/servizi/dettaglio/ServizioHeader.tsx`
**Line 55** — Tablet back button:
```
// BEFORE
onClick={() => navigate("/servizi")}

// AFTER
onClick={() => navigate(-1)}
```

### What is NOT changed
- Post-delete navigations (correct to go to clean list)
- Edit/create navigations (`/servizi/:id/modifica`)
- `ServiziPage.tsx` (already fixed)
- Dipendente redirect (security, line 104)
- Mobile layout (no separate back button)

### Acceptance criteria
- Set date filter → enter service detail → click back button → filters preserved
- Tab preserved via browser history (no longer needs `fromTab` state for this path)
- Report back navigation still works (explicit path preserved)
- Delete still navigates to clean `/servizi`

