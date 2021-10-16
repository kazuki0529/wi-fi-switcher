# Wi-FiのOn/Offスイッチャープログラム

Wi-FiをOn/Offするプログラム。  
実態はMACアドレスフィルタリングをON/OFFしているだけ。

## コマンドライン

```bash
cd src
yarn cypress run -s ./cypress/integration/PR-500KI-wifi-on.ts 
yarn cypress run -s ./cypress/integration/PR-500KI-wifi-off.ts 
```
