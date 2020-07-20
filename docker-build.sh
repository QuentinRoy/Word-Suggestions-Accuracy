#/bin/sh

docker build --build-arg APP_GIT_SHA=`git rev-parse --short HEAD` -t control-acc/typing-exp -f ./Dockerfile-typing .
docker build -t control-acc/words -f ./Dockerfile-words .
