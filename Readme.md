# 🎙️ Discord Dynamic Voice Bot

Bot Discord per la creazione automatica di stanze vocali dinamiche.

## 🚀 Features
- Creazione automatica stanze
- Auto delete intelligente
- Permessi avanzati (live/private)
- Limiti utenti dinamici
- Comandi gestione stanza:
  - /voice lock
  - /voice unlock
  - /voice limit
  - /voice rename
  - /voice permit
  - /voice kick
  - /voice claim
  - /voice info

## ⚙️ Configurazione

Modifica `config.json`:

```json
{
  "categories": {
    "public": "STANZE PUBBLICHE",
    "live": "STANZE LIVE",
    "private": "STANZE PRIVATE"
  }
}