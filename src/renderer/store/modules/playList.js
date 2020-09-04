export default {
    namespaced: true,

    state: {
        playList: [],
        storeControlConfig: {
            zoomRank: 1,
            backSec: 5,
            forwardSec: 5
        }
    },

    mutations: {
        addItem(state, playList) {
            state.playList = playList;
        },

        deleteItem(state, index) {
            state.playList.splice(index, 1);
        },

        changeControlConfig(state, config) {
            state.storeControlConfig = config;
        }
    },

    actions: {
        addAudio({commit}, playList) {
            commit('addItem', playList);
        },

        deleteAudio({commit}, index) {
            commit('deleteItem', index);
        },

        saveStoreControlConfig({commit}, config) {
            commit('changeControlConfig', config);
        }
    }
}