# 🤖 Guida Avvio e Comandi Bot Discord

---

## 🚀 AVVIO BOT

### 1️⃣ Apri il terminale e vai nella cartella del bot
```bash
cd D:\github-bot\bot-main

2️⃣ Installa le dipendenze (solo la prima volta)
npm install
3️⃣ Avvia il bot
node index.js
🔄 RIAVVIO BOT
Quando modifichi il codice:

❌ NON serve reinstallare tutto

Ti basta:

CTRL + C
poi:

node index.js
⚡ AVVIO AUTOMATICO (consigliato)
Installa nodemon:

npm install -g nodemon
Avvia con:

nodemon index.js
👉 Il bot si riavvia da solo quando salvi i file

🎮 COMANDI BOT
🔒 Bloccare stanza
/voice lock
🔓 Sbloccare stanza
/voice unlock
👥 Limite utenti
/voice limit 5
✏️ Rinominare stanza
/voice rename NomeStanza
👑 Diventare proprietario
/voice claim
⚠️ REGOLE
Devi essere in una stanza vocale

Deve essere una stanza creata dal bot

Solo il proprietario può usare i comandi

Gli admin possono sempre intervenire

🧠 NOTE IMPORTANTI
Le stanze si eliminano automaticamente quando vuote

Tempo eliminazione: configurabile in config.json

Se i comandi non compaiono → riavvia il bot

🛠️ RISOLUZIONE PROBLEMI
❌ Il bot non parte
Controlla:

node -v
e il file .env:

TOKEN=tuo_token
❌ I comandi non funzionano
Riavvia il bot

Controlla di essere in una stanza

❌ Le stanze non si creano
Controlla ID stanza trigger

Controlla permessi bot

🔜 FUTURI AGGIORNAMENTI
/voice kick

/voice mute

/voice info


---

💡 Così hai:
- tutto per avviare ✅  
- tutto per riavviare ✅  
- tutti i comandi ✅  

---

Se vuoi al prossimo step ti faccio anche:
👉 un **README professionale per GitHub** (così il progetto sembra già serio serio 😏)