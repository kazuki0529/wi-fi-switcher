#!/bin/bash

set -eux

apt-get update && export DEBIAN_FRONTEND=noninteractive \
  && apt-get -y install --no-install-recommends busybox-static libgtk2.0-0 libgtk-3-0 libgbm-dev libnotify-dev libgconf-2-4 libnss3 libxss1 libasound2 libxtst6 xauth xvfb

cd /usr/local/src \
  && yarn

# cron実行
busybox crond -l 2 -L /dev/stderr -f
