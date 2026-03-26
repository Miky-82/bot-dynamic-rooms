# 🎤 Comandi Bot Voice

Questo bot permette di creare e gestire stanze vocali dinamiche su Discord.

---

## 🚀 Come funziona

1. Entra nella stanza trigger
2. Il bot crea automaticamente una stanza
3. Diventi il proprietario della stanza
4. Puoi gestirla con i comandi qui sotto

---

## 🎮 Comandi disponibili

### 🔒 /voice lock
Blocca la stanza (nessuno può entrare)

---

### 🔓 /voice unlock
Sblocca la stanza

---

### 👥 /voice limit <numero>
Imposta il limite utenti

Esempio:

/voice limit 5


- Min: 0 (illimitato)
- Max: 99

---

### ✏️ /voice rename <nome>
Rinomina la stanza

Esempio:

/voice rename Stanza di Luca


---

### 👑 /voice claim
Diventa proprietario della stanza

Funziona solo se:
- Il proprietario è uscito
- Sei dentro la stanza

---

## ⚠️ Regole

- Devi essere dentro una stanza vocale
- La stanza deve essere creata dal bot
- Solo il proprietario può usare i comandi
- Gli admin possono sempre intervenire

---

## 🧠 Note

- Le stanze vengono eliminate automaticamente quando vuote
- Il tempo di eliminazione è configurabile nel config.json

---

## 🔜 Prossimi aggiornamenti

- /voice kick @utente
- /voice mute @utente
- /voice info

---