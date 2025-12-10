# Test Suite

Questa cartella contiene i test per il progetto REHAU NEA SMART 2.0 MQTT Bridge.

## Test Disponibili

### Test di Validazione Configurazione

**File**: `test-config-validation.ts`

Esegue una suite completa di test per la validazione runtime della configurazione.

**Eseguire**:
```bash
npm run test:config-validation
```

**Cosa testa**:
- ✅ Configurazione valida
- ❌ Email mancante o formato invalido
- ⚠️ Password troppo corta (warning)
- ❌ Porte MQTT/API fuori range
- ❌ Username MQTT senza password
- ❌ Hostname invalido
- ✅ Indirizzo IPv4 valido
- ❌ Intervalli fuori range
- ⚠️ LOG_LEVEL invalido (warning)
- ⚠️ USE_GROUP_IN_NAMES invalido (warning)

**Output**: Mostra un riepilogo con tutti i test passati/falliti e i dettagli degli errori e warning generati.

## Note

I test utilizzano `ts-node` per eseguire direttamente i file TypeScript senza compilazione.

Per maggiori dettagli sui test manuali, consulta `../docs/TEST_CONFIG_VALIDATION.md`.

