# Typing Efficiency and Suggestion Accuracy Influence the Benefits and Adoption of Word Suggestions: Experiment Software

This repository contains the source code used in our experiments investigating the relationship between accuracy of word suggestions, and typing efficiency.
This experiment let participants type phrases on different devices with the help of word suggestions. However, the accuracy of the word suggestions is controlled. You may learn more about this work in our [CHI 2021 paper](https://doi.org/10.1145/3411764.3445725).

## Components

This code base is composed of three different components:

- The client, located in the `/client` directory, is the most important. It contains the code source of the webpage served to participants.
- The control server, located in the `/control-server` directory, enables the experimenter to track a participant's progress. It is also used to serve the client after its compilation.
- The suggestion server, located in the `/suggestionServer` directory, is a secondary server providing a web api to computer word suggestions.

## Installation and start up

It is recommended to use docker to install and start the experiment.
Docker enables consistent build and distribution of the experiment.

To build the docker images run:

```sh
docker compose build
```

To run the experiment, then run:

```sh
docker compose up
```

## Usage

After startup, the webpage should be available at [http://localhost:5000](http://localhost:5000).

Participant should access this page directly. Instead, the experimenter should use the dashboard available from the moderation page, e.g. [http://localhost:5000/moderation](http://localhost:5000/moderation). To access the moderation controls, a password is required. By default, this password is "waterlooHCI", albeit this may be modified in `docker-compose.yaml`. (Note that little to no effort was given to make this authentication method secure, it is only designed as a simple handrail to prevent unlikely disruption of an ongoing experiment.)
