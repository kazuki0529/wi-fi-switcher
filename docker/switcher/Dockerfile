FROM node:16-buster-slim

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
      libgtk2.0-0 libgtk-3-0 libgbm-dev libnotify-dev libgconf-2-4 libnss3 libxss1 libasound2 libxtst6 xauth xvfb \
      busybox-static

COPY switcher /usr/local/src
WORKDIR /usr/local/src
RUN yarn

COPY ./docker/switcher/cron.conf /var/spool/cron/crontabs/root

ENTRYPOINT [ "busybox", "crond", "-l", "2", "-L", "/dev/stderr", "-f" ]
