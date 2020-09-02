/*
 * @Author: chengyuzhang 
 * @Date: 2020-09-02 14:41:29 
 * @Last Modified by: chengyuzhang
 * @Last Modified time: 2020-09-02 19:20:58
 */

import Timeline from 'wavesurfer.js/dist/plugin/wavesurfer.timeline.min';

export default {
    container: '#waveform',
    container: '#waveform',
    waveColor: '#ccc',
    progressColor: '#1577ef',
    backgroundColor: 'rgb(242, 244, 249)',
    barHeight: 1,
    height: 200,
    autoCenter: false,
    plugins: [
        Timeline.create({
            container: '#wave-timeline',
            fontSize: 14
        })
    ]
};
