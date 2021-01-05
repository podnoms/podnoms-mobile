import PodcastService from '../../services/api/podcastService';
import {GET_PODCASTS, GET_PODCASTS_STARTED, PODCASTS_ERROR} from '../types';

import {logger} from 'react-native-logs';
var log = logger.createLogger();

const service = new PodcastService();
const getPodcasts = () => {
    return async function (dispatch: any, getState: any) {
        try {
            log.debug('podcastActions', 'getPodcasts');
            dispatch(
                dispatch({
                    type: GET_PODCASTS_STARTED,
                }),
            );
            const res = await service.getPodcasts();

            dispatch({
                type: GET_PODCASTS,
                payload: res,
            });
        } catch (err) {
            log.error('podcastActions', 'getPodcasts', err);
            dispatch({
                type: PODCASTS_ERROR,
                payload: console.log(err),
            });
        }
    };
};

export const podcastActions = {
    getPodcasts,
};
