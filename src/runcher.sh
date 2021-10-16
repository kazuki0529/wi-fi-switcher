#!/bin/bash

set -eux

###########################################################
# 引数で渡された評価対象の日付が期間内か判定する
#
# @param target 評価対象の日付(yyyy-MM-dd hh:mm:ss)
# @param period_start 開始日(yyyy-MM-dd hh:mm:ss)
# @param period_end 終了日(yyyy-MM-dd hh:mm:ss)
#
# @return 期間内の場合は0を返し、期間外は1を返す
###########################################################
is_within_period() {
  declare -r target=$1
  [[ "${2}" = "" ]] \
    && declare -r period_start='1990-01-01 00:00:00' \
    || declare -r period_start=$2
  [[ "${3}" = "" ]] \
    && declare -r period_end='1990-01-01 00:00:00' \
    || declare -r period_end=$3

  # 評価対象が期間内か判定する
  declare -r start_difference=$(expr $(date -d "$target" +%s) - $(date -d "$period_start" +%s))
  declare -r end_difference=$(expr $(date -d "$target" +%s) - $(date -d "$period_end" +%s))
  if [ $start_difference -ge 0 ] && [ $end_difference -le 0 ]; then
    return 0;
  else
    return 1;
  fi
}

declare -r now=$1
declare -r schedule=$2

cd $(dirname $0)

while IFS=, read start end description; do
  # ヘッダ行判定
  [[ "${start}" == "start" ]] && continue

  is_within_period "${now}" "${start}" "${end}" \
    && (yarn cypress run -s ./cypress/integration/PR-500KI-wifi-on.ts || true) \
    &&  exit 0
done < "${schedule}"

yarn cypress run -s ./cypress/integration/PR-500KI-wifi-off.ts
