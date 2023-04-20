############################
# Final container
############################
FROM registry.cto.ai/official_images/node:2-12.13.1-stretch-slim
RUN mkdir -p /usr/local/nvm
ENV NVM_DIR /usr/local/nvm
ENV NODE_VERSION 16.13.0
RUN apt-get update && \
    apt-get remove nodejs && \
    apt-get install -y \
        python3 \
        python3-pip \
        python3-setuptools \
        groff \
        less \
        mysql-client \
    && pip3 install --upgrade pip \
    && apt-get clean
RUN curl --silent -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
RUN . $NVM_DIR/nvm.sh \
    && nvm install $NODE_VERSION \
    && nvm alias default $NODE_VERSION \
    && nvm use default
RUN pip3 --no-cache-dir install --upgrade awscli
RUN curl "https://s3.amazonaws.com/session-manager-downloads/plugin/latest/ubuntu_64bit/session-manager-plugin.deb" -o "session-manager-plugin.deb"
RUN dpkg -i session-manager-plugin.deb
ENV NODE_PATH $NVM_DIR/v$NODE_VERSION/lib/node_modules
ENV PATH $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH
RUN npm install -g npm@9.6.5
WORKDIR /ops
ADD --chown=ops:9999 package.json .
RUN npm install --loglevel=error
ADD --chown=ops:9999 . .
RUN apt install -y procps lsof telnet
EXPOSE 3306