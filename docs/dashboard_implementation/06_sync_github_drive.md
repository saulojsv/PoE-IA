# Sincronizacao GitHub e Google Drive

## GitHub

Repositorio:

`https://github.com/saulojsv/PoE-IA`

Branch:

`main`

Fluxo usado:

```bat
git status --short
git add -A
git commit -m "mensagem"
git pull --rebase origin main
git push origin main
```

## Ultimos commits relevantes

- `e74709b Add complete dashboard item sprites`
- `9eb2f8f Sync XML dataset updates`
- `9d88ce0 Add remaining item sprite`
- `08f7c9b Add latest recovered item sprites`
- `0e6e64b Add remaining arming axe sprite`

## Uso em outro PC

No outro computador:

```bat
git clone https://github.com/saulojsv/PoE-IA.git
cd PoE-IA
git pull origin main
```

Depois abrir:

- `Abrir_Dashboard.html`; ou
- `Abrir_Dashboard.bat`.

## Google Drive

Pasta encontrada:

`Agente - PoE backup 2026-07-14`

Backup enviado:

`PoE-IA_0e6e64b_full.zip`

Link:

`https://drive.google.com/file/d/1K3nHivKkecq9LfSpSLzYCaPvuhzGKP2v/view?usp=drivesdk`

## Observacao

O Google Drive foi usado como backup zip do estado commitado. O GitHub continua sendo a forma correta de sincronizar codigo e sprites entre PCs.
