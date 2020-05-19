#/bin/sh

docker build --build-arg APP_GIT_SHA=`git rev-parse --short HEAD`  -t typing-exp -f ./Dockerfile-typing .
docker build -t words -f ./Dockerfile-words .
