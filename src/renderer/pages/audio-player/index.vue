<template>
    <div
        class="audio-player"
    >
        <div id="waveform" />   
        <div id="wave-timeline" />

        <div v-if="waveSurfer" class="controls">
            <a-button @click="back">
                快退
            </a-button>
            <a-button
                shape="circle"
                icon="caret-right"
                @click="playPause"
            >
            </a-button>
            <a-button @click="forward">
                快进
            </a-button>
        </div>

        <div class="config">
            <h4>设置</h4>
            <a-row type="flex" justify="space-around" align="middle">
                <a-col :span="2">缩放</a-col>
                <a-col :span="16">
                    <a-slider
                        :min="1"
                        :max="80"
                        v-model="controlConfig.zoomRank"
                        @change="zommChange"
                    />
                </a-col>

                <a-col :span="4">
                    <a-input-number
                        :min="1"
                        :max="80"
                        v-model="controlConfig.zoomRank"
                        @change="zommChange"
                    />
                </a-col>
            </a-row>

            <a-input
                type="text"
                addon-before="回退秒数"
                v-model="controlConfig.backSec"
            />

            <a-input
                addon-before="前进秒数"
                type="text"
                v-model="controlConfig.forwardSec"
            />
        </div>

        <div class="list-btn" @click="playListHandle">
            播放列表
        </div>

        <a-drawer
            title="播放列表"
            placement="right"
            :closable="true"
            :visible="listVisible"
            @close="listVisible = false"
        >
            <a-spin :spinning="loading">
                <div
                    class="list-wrapper"
                    @drop.prevent="drop"
                    @dragover.prevent
                    @dragleave.prevent
                    @dragenter.prevent
                >
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
            </a-spin>
        </a-drawer>
    </div>
</template>

<script>
import {ipcRenderer} from 'electron';
import WaveSurfer from 'wavesurfer.js';
import _ from 'underscore';
import fs from 'fs';
import path from 'path';
import {mapState, mapActions} from 'vuex'

import playerConfig from './constant/player-config';

export default {
    name: 'AudioPlayer',

    data() {
        return {
            waveSurfer: null,
            playing: false,
            filePath: '',
            playListRight: -200,
            controlConfig: {
                zoomRank: 1,
                backSec: 5,
                forwardSec: 5
            },
            listVisible: true,
            loading: false,
            timer: null
        };
    },

    computed: {
        ...mapState({
            playList: ({playList: {playList}}) => playList
        }),

        shortcutKeys() {
            return {
                Space: this.playPause,
                ArrowRight: this.forward,
                ArrowLeft: this.back
            };
        }

    },

    mounted() {
        this.shortcutKey();
    },

    methods: {
        ...mapActions('playList', ['addAudio', 'deleteAudio']),

        async init(path) {
            if (this.waveSurfer) this.waveSurfer.destroy();

            const waveSurfer = WaveSurfer.create(playerConfig);
            const data = await this.loadMedia(path);
            this.loading = true

            waveSurfer.loadBlob(new Blob([data]));

            waveSurfer.on('ready', () => {
                this.loading = false;
                this.duration = parseInt(waveSurfer.getDuration(), 10);
                waveSurfer.zoom(this.controlConfig.zoomRank);
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
            const playList = _.clone(this.playList) || [];
            
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

        playPause() {
            this.playing = !this.playing;
            this.waveSurfer.playPause();
        },

        zommChange() {
            if (this.timer) clearTimeout(this.timer);

            this.timer = setTimeout(() => {
                this.waveSurfer.zoom(this.controlConfig.zoomRank);
            }, 500);
        },

        back() {
            this.waveSurfer.skipBackward(this.controlConfig.backSec);
        },

        forward() {
            this.waveSurfer.skipForward(this.controlConfig.forwardSec);
        },

        playListHandle(flag) {
            this.listVisible = true;
        },

        shortcutKey() {
            window.addEventListener('keyup', (e) => {
                const pressKey = e.code || e.keyCode;
                const handle = this.shortcutKeys[pressKey];
                if (handle) handle();
            }, true);
        }
    }
};
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
.audio-player {
    display: border-box;
    width: 100vw;
    min-height: 100vh;
    overflow-x: hidden;
    position: relative;
}

#waveform {
    width: 100%;
}

.controls {
    display: flex;
    justify-content: center;
}

.config {
    display: flex;
    flex-direction: column;
}

.list-wrapper {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    padding: 10px;
    width: 200px;
    height: 100vh;

    .item {
        display: flex;
        justify-content: space-between;
        cursor: pointer;
        margin-top: 5px;
    }
}
</style>