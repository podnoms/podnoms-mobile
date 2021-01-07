import React, {useEffect, useState} from 'react';
import {
    HubConnectionBuilder,
    HubConnectionState,
    HubConnection,
    LogLevel,
} from '@microsoft/signalr';
import getEnvVars from '../environment';
import {Divider, Paragraph, ProgressBar, Text} from 'react-native-paper';
import UserToken from '../model/UserToken';
import {StyleSheet, View} from 'react-native';
import {Logger} from '../services/logger';
const logger = Logger.getInstance();

const {hubUrl} = getEnvVars();
const getProcessingStatus = (status: number) => {
    switch (status) {
        case 0:
            return 'Accepted';
        case 1:
            return 'Parsing';
        case 2:
            return 'Processing';
        case 3:
            return 'Downloading';
        case 4:
            return 'Converting';
        case 5:
            return 'Uploading';
        case 6:
            return 'Processed';
        case 7:
            return 'Failed';
        case 8:
            return 'Deferred';
        case 9:
            return 'Caching';
        default:
            return 'Unknown';
    }
};
const ProcessingProgressControl = (props) => {
    const [indeterminateProgress, setIndeterminateProgress] = useState<boolean>(
        true,
    );
    const [progressText, setProgressText] = useState<string>(
        props.processMessage,
    );
    const [showProgressBar, setShowProgressBar] = useState<boolean>(
        props.showProgressBar,
    );

    const [processingStatus, setProcessingStatus] = useState<string>(
        'Accepted',
    );
    const [percentageProcessed, setPercentageProcessed] = useState<number>(0);

    useEffect(() => {
        setProgressText(props.processMessage);
        setShowProgressBar(props.showProgressBar);
    }, [props.processMessage, props.showProgressBar]);

    useEffect(() => {
        const hubAbortController = new AbortController();
        async function loadUserAndHub(episodeId) {
            const user = await UserToken.fromStorage();
            const con = await setUpSignalRConnection(user.token, episodeId);

            return con;
        }
        if (props.episodeId) {
            loadUserAndHub(props.episodeId);
            return function cleanup() {
                // con.close();
            };
        }
        return () => {
            hubAbortController.abort();
        };
    }, [props]);

    const setUpSignalRConnection = async (token: string, episodeId: string) => {
        const connection = new HubConnectionBuilder()
            .withUrl(`${hubUrl}/audioprocessing`, {
                accessTokenFactory: () => token,
            })
            .configureLogging(LogLevel.Debug)
            .withAutomaticReconnect()
            .build();

        connection.on(episodeId, (result) => {
            const status = getProcessingStatus(result.processingStatus);
            setProgressText(result.progress || status);
            setProcessingStatus(status);
            setIndeterminateProgress(false);

            if (
                status === 'Downloading' ||
                status === 'Caching' ||
                status === 'Uploading'
            ) {
                setPercentageProcessed(result.payload.percentage);
                // this.currentSpeed = result.payload.currentSpeed;
            } else if (status === 'Processed' || status === 'Failed') {
                connection.stop();
                setShowProgressBar(false);
                props.onEpisodeProcessed();
            }
        });

        try {
            await connection.start();
        } catch (err) {
            logger.error(
                'ProcessingProgressControl',
                'Error creating the SignalR connection',
                err,
            );
        }

        if (connection.state === HubConnectionState.Connected) {
            logger.errorlog('ProcessingProgressControl', 'SignalR Hub - Connected');
        }
        return connection;
    };

    return (
        <View style={styles.row}>
            <Paragraph style={styles.title}>{progressText}</Paragraph>
            <Divider />
            <ProgressBar
                indeterminate={indeterminateProgress}
                visible={showProgressBar}
                progress={percentageProcessed / 100}
            />
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    row: {
        marginVertical: 10,
        height: 500,
        width: '100%',
    },
    title: {
        color: '#05375a',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
export default ProcessingProgressControl;
