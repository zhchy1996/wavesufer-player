<template>
    <div @click.prevent class="loading" v-show="visible">
        加载中...
    </div>
</template>

<script type="text/babel">
export default {
    name: 'Loading',

    props: {
        visible: {
            type: Boolean,
            default: false
        }
    }
};
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
.loading {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, .2);
    z-index: 99999;
}
</style>