# Wi-FiのOn/Offスイッチャープログラム

Wi-FiをOn/Offするプログラム。  
実態はMACアドレスフィルタリングをON/OFFしているだけ。

## コンテナ立ち上げ

```bash
docker-compose up -d
```

## 環境変数

| 環境変数                | 説明                                |
| :---------------------- | :---------------------------------- |
| `TARGET_ROUTER`         | ルータの機種名                      |
| `ROUTER_USER_NAME`      | ルータのユーザID                    |
| `ROUTER_PASSWORD`       | ルータのパスワード                  |
| `AWS_DEFAULT_REGION`    | 申請データのリージョン              |
| `AWS_ACCESS_KEY_ID`     | 申請データ参照用AWSアクセスキー     |
| `AWS_SECRET_ACCESS_KEY` | 申請データ参照用AWSシークレットキー |
| `TABLE_NAME`            | 申請データのテーブル名              |

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
