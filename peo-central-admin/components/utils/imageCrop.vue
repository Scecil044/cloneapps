<template>
    <div>
		<client-only>
        <myUpload field="img"
            v-if="computeshow"
            @crop-success="cropSuccess"
            v-model="showEdit"
            :width="100"
            :height="100"
            :params="params"
            :headers="headers"
			:langExt="langExt"
            img-format="png"/>
		</client-only>
    </div>
</template>
<script>
import 'babel-polyfill'; // es6 shim
import Vue from 'vue';

export default {
    props:['show'],
		data() {
            return {
            showEdit:this.show,
			langExt:{
				hint: 'Click or drag the file here to upload',
				loading: 'Uploading…',
				noSupported: 'Browser is not supported, please use IE10+ or other browsers',
				success: 'Upload success',
				fail: 'Upload failed',
				preview: 'Preview',
				btn: {
					off: 'Cancel',
					close: 'Close',
					back: 'Back',
					save: 'Save'
				},
				error: {
					onlyImg: 'Image only',
					outOfSize: 'Image exceeds size limit: ',
					lowestPx: 'Image\'s size is too low. Expected at least: '
				}
			},
			params: {
				token: '123456798',
				name: 'avatar'
			},
			headers: {
				smail: '*_~'
			},
			imgDataUrl: '' // the datebase64 url of created image
		}},
		components: {myUpload: () => {if(process.client){return import('vue-image-crop-upload/upload-2.vue')}}},
		methods: {
			toggleShow() {
				this.show = !this.show;
			},
			cropSuccess(imgDataUrl, field){
				this.imgDataUrl = imgDataUrl;
                this.$emit('croped-image',this.imgDataUrl)
			},
			cropUploadSuccess(jsonData, field){
				console.log('-------- upload success --------');
				console.log(jsonData);
				console.log('field: ' + field);
			},
			cropUploadFail(status, field){
				console.log('-------- upload fail --------');
				console.log(status);
				console.log('field: ' + field);
			}
		},
        computed:{
            computeshow(){
                if(this.showEdit == false){
                    this.$emit('close-corp',this.showEdit)
                }
                return true
            }
        }
}
</script>
