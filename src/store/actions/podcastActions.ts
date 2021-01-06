import PodcastService from '../../services/api/podcastService';
import {
    GET_PODCASTS_ERROR,
    GET_PODCASTS_STARTED,
    GET_PODCASTS_SUCCESS,
    ADD_PODCASTENTRY_STARTED,
    ADD_PODCASTENTRY_SUCCESS,
    ADD_PODCASTENTRY_ERROR,
} from '../types';

import {logger} from 'react-native-logs';
var log = logger.createLogger();

const service = new PodcastService();
const getPodcasts = () => {
    return async function (dispatch: any, getState: any) {
        try {
            dispatch(request());

            const res = await service.getPodcasts();
            dispatch(success(res));
        } catch (err) {
            log.error('podcastActions', 'getPodcasts', err);
            dispatch(failure(err));
        }
    };
    function request() {
        return {type: GET_PODCASTS_STARTED};
    }
    function success(podcasts) {
        return {type: GET_PODCASTS_SUCCESS, podcasts};
    }
    function failure(error) {
        return {type: GET_PODCASTS_ERROR, error};
    }
};
const addPodcastEntry = (podcastId: string, url: string) => {
    return async function (dispatch: any, getState: any) {
        console.log(
            'podcastActions',
            'addPodcastEntry',
            `PodcastId: ${podcastId}`,
            `Url: ${url}`,
        );
        try {
            dispatch(request());
            const res = await service.addPodcastEntry(podcastId, url);
            dispatch(success(res));
        } catch (err) {
            log.error('podcastActions', 'getPodcasts', err);
            dispatch(failure(err));
        }
    };
    function request() {
        return {type: ADD_PODCASTENTRY_STARTED};
    }
    function success(podcasts) {
        return {type: ADD_PODCASTENTRY_SUCCESS, podcasts};
    }
    function failure(error) {
        return {type: ADD_PODCASTENTRY_ERROR, error};
    }
};
export const podcastActions = {
    getPodcasts,
    addPodcastEntry,
};
