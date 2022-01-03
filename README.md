# Wi-FiのOn/Offスイッチャープログラム

Wi-FiをOn/Offするプログラム。  
実態はMACアドレスフィルタリングをON/OFFしているだけ。

## コマンドライン

```bash
cd switcher
pytest -s "./selenium/PR-500KI-wifi-on.py"
pytest -s "./selenium/PR-500KI-wifi-off.py"
```

## デプロイ

```bash
zone_id={your zone id}              # Optional
zone_name={your zone name}          # Optional
cert_arn={your certification arn}   # Optional

yarn cdk deploy \
  -c "ZONE_ID=${zone_id}" \
  -c "ZONE_NAME=${zone_name}" \
  -c "CERT_ARN=${cert_arn}"
```
