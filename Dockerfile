FROM onfinality/subql-node:latest

COPY . /app
RUN cd /app && yarn
RUN cd /app && yarn build