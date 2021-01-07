import PodcastService from '../../services/api/podcastService';
import {Logger} from '../../services/logger';
import {
    LOAD_PODCASTS_ERROR,
    LOAD_PODCASTS_STARTED,
    LOAD_PODCASTS_SUCCESS,
    ADD_PODCASTENTRY_STARTED,
    ADD_PODCASTENTRY_SUCCESS,
    ADD_PODCASTENTRY_ERROR,
    LOAD_PODCASTENTRIES_STARTED,
    LOAD_PODCASTENTRIES_SUCCESS,
    LOAD_PODCASTENTRIES_ERROR,
} from '../types';

const logger = Logger.getInstance();

const service = new PodcastService();
const getPodcasts = () => {
    return async function (dispatch: any, getState: any) {
        try {
            dispatch(request());

            const res = await service.getPodcasts();
            dispatch(success(res));
        } catch (err) {
            logger.error('podcastActions', 'getPodcasts', err);
            dispatch(failure(err));
        }
    };
    function request() {
        return {type: LOAD_PODCASTS_STARTED};
    }
    function success(podcasts) {
        return {type: LOAD_PODCASTS_SUCCESS, podcasts};
    }
    function failure(error) {
        return {type: LOAD_PODCASTS_ERROR, error};
    }
};
const addPodcastEntry = (podcastId: string, url: string) => {
    return async function (dispatch: any, getState: any) {
        logger.errorlog(
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
            logger.error('podcastActions', 'getPodcasts', err);
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

const getEntries = (podcastId: string) => {
    return async function (dispatch: any, getState: any) {
        try {
            dispatch(request());
            const res = await service.getEntries(podcastId);
            dispatch(success(res));
        } catch (err) {
            logger.error('podcastActions', 'getPodcasts', err);
            dispatch(failure(err));
        }
    };
    function request() {
        return {type: LOAD_PODCASTENTRIES_STARTED};
    }
    function success(entries) {
        return {type: LOAD_PODCASTENTRIES_SUCCESS, entries};
    }
    function failure(error) {
        return {type: LOAD_PODCASTENTRIES_ERROR, error};
    }
};
export const podcastActions = {
    getPodcasts,
    addPodcastEntry,
    getEntries,
};
