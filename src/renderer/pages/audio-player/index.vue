<template>
    <div
        class="audio-player"
    >
        <div id="waveform" />   
        <div id="wave-timeline" />

        <div v-if="waveSurfer" class="controls">
            <a-button
                class="button"
                icon="fast-backward"
                shape="circle"
                size="large"
                @click="back"
            />

            <a-button
                class="button"
                shape="circle"
                size="large"
                :icon="playing ? 'pause' : 'caret-right'"
                @click="playPause"
            >
            </a-button>

            <a-button
                class="button"
                icon="fast-forward"
                size="large"
                shape="circle"
                @click="forward"
            />

            <div style="width: 100px;">
                <a-slider
                    :min="0"
                    :max="100"
                    v-model="volume"
                    @change="volumeChange"
                />
            </div>
        </div>

        <a-row
            class="setting"
            :style="{width: '100%'}"
            type="flex"
            justify="space-between"
        >
            <a-col>
                <a-button
                    icon="setting"
                    type="link"
                    shape="circle"
                    size="large"
                    @click="configVisible = true"
                />
            </a-col>

            <a-col>
                <a-button
                    icon="unordered-list"
                    type="link"
                    class="list-btn"
                    size="large"
                    @click="listVisible = true"
                />
            </a-col>
        </a-row>

        <a-drawer
            title="播放列表"
            placement="left"
            width="50%"
            :closable="true"
            :visible="configVisible"
            @close="configVisible = false"
        >
            <div class="config">
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
                            :style="{width: '60px'}"
                            v-model="controlConfig.zoomRank"
                            @change="zommChange"
                        />
                    </a-col>
                </a-row>

                <a-row type="flex" justify="space-around">
                    <a-col :span="10">
                        <a-input
                            type="text"
                            addon-before="回退秒数"
                            v-model="controlConfig.backSec"
                        />
                    </a-col>

                    <a-col :span="10">
                        <a-input
                            addon-before="前进秒数"
                            type="text"
                            v-model="controlConfig.forwardSec"
                        />
                    </a-col>
                </a-row>

                <a-row type="flex" justify="center" style="margin-top: 10px">
                    <a-col :span="20">
                        <a-input
                            type="text"
                            addon-before="倍速"
                            v-model="controlConfig.speed"
                            @change="speedChange"
                        />
                    </a-col>
                </a-row>
            </div>
        </a-drawer>

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
            controlConfig: {},
            listVisible: false,
            configVisible: false,
            loading: false,
            timer: null,
            volume: 100,
            recordTime: [null, null]
        };
    },

    computed: {
        ...mapState({
            playList: ({playList: {playList}}) => playList,
            storeControlConfig: ({playList: {storeControlConfig}}) => storeControlConfig
        }),

        shortcutKeys() {
            return {
                Space: this.playPause,
                ArrowRight: this.forward,
                ArrowLeft: this.back,
                ArrowLeft: this.back,
                KeyZ: this.back,
                KeyX: this.playPause,
                KeyC: this.forward,
                KeyA: () => this.record(0),
                KeyD: () => this.record(1),
                KeyS: this.backToRecord
            };
        }

    },

    mounted() {
        this.controlConfig = _.clone(this.storeControlConfig);
        this.$watch(() => this.controlConfig, () => {
            this.saveStoreControlConfig(this.controlConfig);
        }, {deep: true});
        this.shortcutKey();
    },

    methods: {
        ...mapActions('playList', ['addAudio', 'deleteAudio', 'saveStoreControlConfig']),

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
            const {dataTransfer: {files}} = event;
            const length = files.length;
            const playList = _.clone(this.playList) || [];
            
            for(let i = 0; i < length; i++) {
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

        speedChange() {
            this.waveSurfer.setPlaybackRate(this.controlConfig.speed);
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
        },

        volumeChange(e) {
            this.waveSurfer.setVolume(e/100);
        },
        // 记录当前位置, 0开始, 1结束
        record(flag) {
            const currentTime = this.waveSurfer.getCurrentTime();
            if (flag === 0 && this.recordTime[1] && currentTime > this.recordTime[1]) {
                this.recordTime[1] = null;
            }
            this.recordTime[flag] = currentTime;
        },
        // 会到记录位置
        backToRecord() {
            const recordTime = this.recordTime;
            if (!recordTime[0]) return;
            this.waveSurfer.play(...recordTime);
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
    margin-top: 40px;
    display: flex;
    justify-content: center;

    .button {
        margin-right: 20px;
    }
}

.setting {
    position: fixed;
    bottom: 0;
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