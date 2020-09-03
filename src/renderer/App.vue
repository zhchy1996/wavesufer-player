<template>
    <div
        id="app"
        @drop.prevent
        @dragover.prevent
        @dragleave.prevent
        @dragenter.prevent
    >
        <router-view />
    </div>
</template>

<script>
import Vue from 'vue';
import loading from './components/loading';

export default {
    name: 'App',

    components: {
        loading
    },

    created() {
        Vue.prototype.$app = this;
    },

    data() {
        return {
            loadingStatus: false
        };
    },

    methods: {
        showLoading() {
            this.loadingStatus = true;
        },

        hideLoading() {
            this.loadingStatus = false;
        },
    }
  }
</script>

<style lang="scss">
    * {
        margin: 0
    }

    #app {
        min-height: 100vh;
    }
</style>
