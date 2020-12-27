FROM neo4j:4.1.0

ENV NEO4J_AUTH=neo4j/letmein \
    APOC_VERSION=4.1.0.0

RUN sh -c 'apt-get update && apt-get -qq -y install curl'

ENV APOC_URI https://github.com/neo4j-contrib/neo4j-apoc-procedures/releases/download/${APOC_VERSION}/apoc-${APOC_VERSION}-all.jar
RUN sh -c 'cd /var/lib/neo4j/plugins && curl -L -O "${APOC_URI}"'

CMD ["neo4j"]
