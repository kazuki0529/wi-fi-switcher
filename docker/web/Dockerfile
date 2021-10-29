FROM python:3.8-slim-buster

# OSの最新化
RUN apt-get update \
    && apt-get -y clean \
    && rm -rf /var/lib/apt/lists/*

# ライブラリのインストール
COPY ./web/requirements.txt /tmp/pip-tmp/
RUN pip3 --disable-pip-version-check --no-cache-dir install -r /tmp/pip-tmp/requirements.txt \
    && rm -rf /tmp/pip-tmp

COPY web /usr/local/src
WORKDIR /usr/local/src/

ENTRYPOINT ["python"]
CMD ["app.py"]
