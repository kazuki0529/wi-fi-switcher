# See here for image contents: https://github.com/microsoft/vscode-dev-containers/tree/v0.191.1/containers/python-3/.devcontainer/base.Dockerfile

# [Choice] Python version: 3, 3.9, 3.8, 3.7, 3.6
ARG VARIANT="3.9"
FROM mcr.microsoft.com/vscode/devcontainers/python:0-${VARIANT}

# [Choice] Node.js version: none, lts/*, 16, 14, 12, 10
ARG NODE_VERSION="none"
RUN if [ "${NODE_VERSION}" != "none" ]; then su vscode -c "umask 0002 && . /usr/local/share/nvm/nvm.sh && nvm install ${NODE_VERSION} 2>&1"; fi

# [Optional] If your pip requirements rarely change, uncomment this section to add them to the image.
COPY .devcontainer/requirements.txt /tmp/pip-tmp/requirements.txt
COPY .devcontainer/requirements.txt /tmp/pip-tmp/switcher-requirements.txt
RUN pip3 --disable-pip-version-check --no-cache-dir install -r /tmp/pip-tmp/requirements.txt \
    && pip3 --disable-pip-version-check --no-cache-dir install -r /tmp/pip-tmp/switcher-requirements.txt \
    && rm -rf /tmp/pip-tmp

# [Optional] Uncomment this section to install additional OS packages.
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends libgconf-2-4 libnss3 libxcb1 fonts-ipafont

# [Optional] Uncomment this line to install global node packages.
RUN su vscode -c "source /usr/local/share/nvm/nvm.sh && npm install -g aws-cdk" 2>&1

# Chrome
RUN mkdir -p /tmp/chrome \
    && cd /tmp/chrome && wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb \
    && dpkg -i google-chrome-stable_current_amd64.deb || true \
    && apt -f install -y \
    && rm -rf /tmp/chrome \

# ChromeWebDriver
RUN sbase install chromedriver latest
