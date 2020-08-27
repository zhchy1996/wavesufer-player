<template>
    <div>
        <div id="waveform" />   
        <input type="text" placeholder="输入路径" v-model="filePath">
        <button @click="load">加载</button>
        <button
            v-if="waveSurfer"
            @click="playing ? pause() : play()"
        >
            {{ playing ? '暂停' : '播放' }}
        </button>
    </div>
</template>

<script>
import WaveSurfer from 'wavesurfer.js';
import fs from 'fs';
import path from 'path';

export default {
    name: 'AudioPlayer',

    data() {
        return {
            waveSurfer: null,
            playing: false,
            filePath: ''
        };
    },

    async mounted() {
    },

    methods: {
        async init() {
            const waveSurfer = WaveSurfer.create({
                container: '#waveform'
            });
            const data = await this.loadMedia();
            waveSurfer.loadBlob(new Blob([data]));
            waveSurfer.on('ready', () => {
                this.duration = parseInt(waveSurfer.getDuration(), 10);
                console.log('ready')
                this.waveSurfer = waveSurfer;
            });
            waveSurfer.on('finish', () => {
                this.playing = false;
            });
        },

        async loadMedia() {
            const filePath = path.join(this.filePath);
            console.log(filePath)
            const blob = fs.readFileSync(filePath);


            return blob;
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
</style>