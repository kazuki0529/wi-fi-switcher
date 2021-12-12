FROM python:3.9-slim-buster

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
        busybox-static wget libgconf-2-4 libnss3 libxcb1 fonts-ipafont

COPY switcher /usr/local/src
RUN pip install \
  --disable-pip-version-check --no-cache-dir \
  -r /usr/local/src/requirements.txt

# Chrome
RUN mkdir -p /tmp/chrome \
    && cd /tmp/chrome && wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb \
    && dpkg -i google-chrome-stable_current_amd64.deb || true \
    && apt -f install -y \
    && rm -rf /tmp/chrome

# ChromeWebDriver
RUN sbase install chromedriver latest

COPY ./docker/switcher/cron.conf /var/spool/cron/crontabs/root

WORKDIR /usr/local/src
ENTRYPOINT [ "busybox", "crond", "-l", "2", "-L", "/dev/stderr", "-f" ]
