# podnoms-mobile's self-hosted GitHub Actions runner: what an EAS local Android
# build needs (Java 17, the Android SDK and NDK, Node) and the runner itself.
# Started by scripts/start-runner.sh.
FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=UTC

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates curl git gnupg jq unzip zip xz-utils \
    openjdk-17-jdk-headless \
    && rm -rf /var/lib/apt/lists/*

ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64

# Node, for anything run outside a job's own setup-node.
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

# Android SDK. The versions are the ones React Native asks for
# (node_modules/react-native/gradle/libs.versions.toml); Gradle fetches
# anything else it needs, as the runner's user owns the SDK folder.
ENV ANDROID_HOME=/opt/android-sdk
ENV ANDROID_SDK_ROOT=/opt/android-sdk
ENV PATH="$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools"

RUN mkdir -p $ANDROID_HOME/cmdline-tools \
    && curl -fsSL https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip \
       -o /tmp/cmdline-tools.zip \
    && unzip -q /tmp/cmdline-tools.zip -d /tmp/cmdline-tools \
    && mv /tmp/cmdline-tools/cmdline-tools $ANDROID_HOME/cmdline-tools/latest \
    && rm -rf /tmp/cmdline-tools.zip /tmp/cmdline-tools

RUN yes | sdkmanager --licenses > /dev/null \
    && sdkmanager \
       "platform-tools" \
       "platforms;android-36" \
       "platforms;android-37.0" \
       "build-tools;36.0.0" \
       "build-tools;37.0.0" \
       "ndk;27.1.12297006" \
       "cmake;3.22.1" \
    && rm -rf $ANDROID_HOME/.temp

# The runner. Its user has the host user's id, so the mounted folders are
# writable from both sides. No sudo: this repo is public.
ARG RUNNER_VERSION=2.338.2
ARG RUNNER_UID=1000
ENV RUNNER_HOME=/home/runner/actions-runner

RUN (userdel -r ubuntu 2>/dev/null || true) \
    && useradd -m -s /bin/bash -u $RUNNER_UID runner

# Kept beside the real folder, which is a mount that starts out empty:
# entrypoint.sh copies this into it on the first run.
RUN mkdir -p /home/runner/actions-runner-image $RUNNER_HOME \
    && cd /home/runner/actions-runner-image \
    && curl -fsSL \
       "https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz" \
       | tar xz \
    && apt-get update && ./bin/installdependencies.sh \
    && rm -rf /var/lib/apt/lists/* \
    && chown -R runner:runner /home/runner $ANDROID_HOME

COPY --chmod=755 entrypoint.sh /entrypoint.sh

USER runner
WORKDIR $RUNNER_HOME
ENTRYPOINT ["/entrypoint.sh"]
