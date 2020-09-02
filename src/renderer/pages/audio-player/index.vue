<template>
    <div class="audio-player">
        <div id="waveform" />   
        <div id="wave-timeline" />
 <!-- v-if="waveSurfer" -->
        <div class="controls">
            <button @click="back">
                快退
            </button>
            <button
                @click="playing ? pause() : play()"
            >
                {{ playing ? '暂停' : '播放' }}
            </button>
            <button @click="forward">
                快进
            </button>
        </div>

        <div class="config">
            <h4>设置</h4>
            <label for="zoom">波形图缩放</label>
            <input name="zoom" type="text" v-model="controlConfig.zoomRank" @change="zommChange">

            <label for="back">回退秒数</label>
            <input name="back" type="text" v-model="controlConfig.backSec">

            <label for="forward">前进秒数</label>
            <input name="forward" type="text" v-model="controlConfig.forwardSec">
        </div>

        <div
            class="play-list"
            :style="{right: `${playListRight}px`}"
            @drop.prevent="drop"
            @dragover.prevent
            @dragleave.prevent
            @dragenter.prevent
        >
            <div class="btn" @click="playListHandle">
                播放列表
            </div>

            <div
                class="list-wrapper"
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
            }
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

            const waveSurfer = WaveSurfer.create(playerConfig);
            const data = await this.loadMedia(path);
            this.$app.showLoading();

            waveSurfer.loadBlob(new Blob([data]));

            waveSurfer.on('ready', () => {
                this.$app.hideLoading();
                this.duration = parseInt(waveSurfer.getDuration(), 10);
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
            const playList = this.playList || [];
            
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

        zommChange() {
            this.waveSurfer.zoom(this.controlConfig.zoomRank);
        },

        back() {
            this.waveSurfer.skipBackward(this.controlConfig.backSec);
        },

        forward() {
            this.waveSurfer.skipForward(this.controlConfig.forwardSec);
        },

        playListHandle() {
            this.playListRight = this.playListRight < 0 ? 0 : -200;
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
    & > button {
        margin-right: 10px;
        padding: 4px 6px;
        font-size: 14px;
        border: 0;
        outline: 0;
        background: #1890ff;
        color: #fff; 
    }
}

.config {
    display: flex;
    flex-direction: column;
}

.play-list {
    position: absolute;
    display: flex;
    align-items: center;
    top: 50%;
    transform: translateY(-50%);
    transition: right .5s 0s ease-in-out;
    z-index: 10;

    .btn {
        width: 20px;
        cursor: pointer;
    }

    .list-wrapper {
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        padding: 10px;
        width: 200px;
        height: 100vh;
        background: rgba(0, 0, 0, .8);
        color: #fff;

        .item {
            display: flex;
            justify-content: space-between;
            cursor: pointer;
        }
    }
}
</style>