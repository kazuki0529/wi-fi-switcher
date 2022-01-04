FROM python:3.9-slim-buster

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
        busybox-static wget libgconf-2-4 libnss3 libxcb1 fonts-ipafont gnupg gnupg1 gnupg2

COPY switcher/requirements.txt /usr/local/src/requirements.txt
RUN pip install \
  --disable-pip-version-check --no-cache-dir \
  -r /usr/local/src/requirements.txt

COPY switcher /usr/local/src

# Chrome and ChromeWebDriver
RUN if [ "$(dpkg --print-architecture)" = 'arm64' ]; then ( \
      mkdir -p /tmp/chrome && cd /tmp/chrome && export DEBIAN_FRONTEND=noninteractive \
      && wget https://launchpad.net/~canonical-chromium-builds/+archive/ubuntu/stage/+files/chromium-codecs-ffmpeg_96.0.4664.45-0ubuntu0.18.04.1_arm64.deb \
      && wget https://launchpad.net/~canonical-chromium-builds/+archive/ubuntu/stage/+files/chromium-codecs-ffmpeg-extra_96.0.4664.45-0ubuntu0.18.04.1_arm64.deb \
      && wget https://launchpad.net/~canonical-chromium-builds/+archive/ubuntu/stage/+files/chromium-browser_96.0.4664.45-0ubuntu0.18.04.1_arm64.deb \
      && wget https://launchpad.net/~canonical-chromium-builds/+archive/ubuntu/stage/+files/chromium-chromedriver_96.0.4664.45-0ubuntu0.18.04.1_arm64.deb \
      && apt-get -y install --no-install-recommends ./chromium-codecs-ffmpeg_96.0.4664.45-0ubuntu0.18.04.1_arm64.deb \
      && apt-get -y install --no-install-recommends ./chromium-codecs-ffmpeg-extra_96.0.4664.45-0ubuntu0.18.04.1_arm64.deb \
      && apt-get -y install --no-install-recommends ./chromium-browser_96.0.4664.45-0ubuntu0.18.04.1_arm64.deb  \
      && apt-get -y install --no-install-recommends ./chromium-chromedriver_96.0.4664.45-0ubuntu0.18.04.1_arm64.deb \
      && rm -rf /tmp/chrome \
    ) else ( \
      echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list \
      && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
      && apt-get update && export DEBIAN_FRONTEND=noninteractive \
      && apt-get -y install --no-install-recommends google-chrome-stable \
      && sbase install chromedriver latest \
    ) fi

COPY ./docker/switcher/cron.conf /var/spool/cron/crontabs/root

WORKDIR /usr/local/src
ENTRYPOINT [ "busybox", "crond", "-l", "2", "-L", "/dev/stderr", "-f" ]
