#!/bin/bash

set -eux

###########################################################
# 本スクリプトの処理終了時
# 使用例：trap finally EXIT
#
# @return 必ず0を返す
###########################################################
function finally() {
  rm -f "${schedule}"
  return 0
}

trap finally EXIT

declare -r status_file='/tmp/wifi-switcher'

touch "${status_file}" \
  && declare -r latest_status=$(cat "${status_file}")

cd $(dirname $0)

declare -r schedule=$(mktemp)
wget -O "${schedule}" "${API_END_POINT}/api/v1/requests/approve/now"

while IFS=, read start end status; do
  [[ "${start}" == "start" ]] && continue     # ヘッダ行判定
  [[ "${status}" != "Approve" ]] && continue  # 承認済みデータ判定

  [[ "${latest_status}" != 'ON' ]] \
    && pytest -s "./selenium/${TARGET_ROUTER}-wifi-on.py" \
    && echo -n 'ON' > "${status_file}"

  exit 0
done < "${schedule}"

[[ "${latest_status}" != 'OFF' ]] \
  && pytest -s "./selenium/${TARGET_ROUTER}-wifi-off.py" \
  && echo -n 'OFF' > "${status_file}"
