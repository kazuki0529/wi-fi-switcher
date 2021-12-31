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
fqdn={your domain}                  # Optional
cert_arn={your certification arn}   # Optional

yarn cdk deploy \
  -c "FQDN=${fqdn}" \
  -c "CERT_ARN~${cert_arn}"
```
