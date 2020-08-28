export default {
    namespaced: true,

    state: {
        playList: []
    },

    mutations: {
        addItem(state, playList) {
            state.playList = playList;
        },

        deleteItem(state, index) {
            state.playList.splice(index, 1);
        }
    },

    actions: {
        addAudio({commit}, playList) {
            commit('addItem', playList);
        },

        deleteAudio({commit}, index) {
            commit('deleteItem', index);
        }
    }
}