<template>
    <div>
        <div id="waveform" />   
        <button
            v-if="waveSurfer"
            @click="playing ? pause() : play()"
        >
            {{ playing ? '暂停' : '播放' }}
        </button>

        <div
            class="play-list"
            @drop.prevent="drop"
            @dragover.prevent
            @dragleave.prevent
            @dragenter.prevent
        >
            列表
            <div
                class="item"
                v-for="({name, path}, index) in playList"
                :key="path"
                @click="init(path)"
            >
                <span>{{ name }}</span>
                <a @click.stop="deleteItem(index)">x</a>
            </div>
        </div>
    </div>
</template>

<script>
import {ipcRenderer} from 'electron';
import WaveSurfer from 'wavesurfer.js';
import _ from 'underscore';
import fs from 'fs';
import path from 'path';
import {mapState, mapActions} from 'vuex'

export default {
    name: 'AudioPlayer',

    data() {
        return {
            waveSurfer: null,
            playing: false,
            filePath: ''
        };
    },

    computed: {
        ...mapState({
            playList: ({playList: {playList}}) => playList
        }),
    },

    mounted() {
    },

    methods: {
        ...mapActions('playList', ['addAudio', 'deleteAudio']),

        async init(path) {
            if (this.waveSurfer) this.waveSurfer.destroy();

            const waveSurfer = WaveSurfer.create({
                container: '#waveform'
            });
            const data = await this.loadMedia(path);
            this.$app.showLoading();
            waveSurfer.loadBlob(new Blob([data]));
            waveSurfer.on('ready', () => {
                this.$app.hideLoading();
                this.duration = parseInt(waveSurfer.getDuration(), 10);
                console.log('ready')
                this.waveSurfer = waveSurfer;
            });
            waveSurfer.on('finish', () => {
                this.playing = false;
            });
        },

        async loadMedia(path) {
            const blob = fs.readFileSync(path);

            return blob;
        },

        drop(event) {
            event.preventDefault();
            console.log(event.dataTransfer.files)
            const {dataTransfer: {files}} = event;
            const length = files.length;
            const playList = [];
            
            for(let i = 0; i < length; i++) {
                console.log(files[i])
                const {name, path, type} = files[i];
                if (/mp3|m4a|wav|acc|ape/i.test(type)) playList.push({name, path});
            }
            this.addAudio(_.uniq(playList, true, _.iteratee(val => val.path)))
        },

        deleteItem(index) {
            this.deleteAudio(index);
        },

        load() {
            this.init();
        },

        play() {
            console.log(this.playing)
            this.playing = true;
            this.waveSurfer.play();
        },

        pause() {
            this.playing = false;
            this.waveSurfer.pause();
        },
    }
};
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
#waveform {
    width: 100%;
    height: 200px;
}

.play-list {
    display: flex;
    flex-direction: column;
    width: 200px;
    height: 200px;
    background: rgba(0, 0, 0, .2);

    .item {
        cursor: pointer;
    }
}
</style>