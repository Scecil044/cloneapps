<template>
        <div id="app">
            <ejs-documenteditor ref="documenteditor" :isReadOnly='true' :height="height" :width="responsiveWidth" style="display:block" ></ejs-documenteditor>
        </div>
</template>
<script>
        import Vue from 'vue'
        import { registerLicense } from '@syncfusion/ej2-base';

        import { DocumentEditorPlugin} from '@syncfusion/ej2-vue-documenteditor';
        registerLicense('Mgo+DSMBaFt+QHFqVkNrXVNbdV5dVGpAd0N3RGlcdlR1fUUmHVdTRHRcQl5hTn5Xc0BhWnlYeXY=;Mgo+DSMBPh8sVXJ1S0d+X1RPd11dXmJWd1p/THNYflR1fV9DaUwxOX1dQl9gSX1RcUVnXHpcc3JcQWI=;ORg4AjUWIQA/Gnt2VFhhQlJBfV5AQmBIYVp/TGpJfl96cVxMZVVBJAtUQF1hSn5QdEJjXXpbcndSR2Ve;MTQ4MTMyNUAzMjMxMmUzMTJlMzMzNURMRU5pbWlVSGZCTGVtTjlRK01Nb21CSytUdEdDVDlLMm0wQ2JNUGtza0k9;MTQ4MTMyNkAzMjMxMmUzMTJlMzMzNUtYUy9DUk80bml1N2xPMFR6QmZMT0pHSEsvWmlCdEpWMDBpcnZncXFHL289;NRAiBiAaIQQuGjN/V0d+XU9Hc1RDX3xKf0x/TGpQb19xflBPallYVBYiSV9jS31TdUdkWXtbdXZWQWlbUw==;MTQ4MTMyOEAzMjMxMmUzMTJlMzMzNVVSQzZPR1VDNXFVbnlmWnFrWS9OMmtXV05JemJ4YnhqeTZpZmdISzJscnc9;MTQ4MTMyOUAzMjMxMmUzMTJlMzMzNVZVMEZ2MjRGVkdUaGVZK29sRzl5aExHSEVVWnBtUitibG5GSk9wN01ZaHc9;Mgo+DSMBMAY9C3t2VFhhQlJBfV5AQmBIYVp/TGpJfl96cVxMZVVBJAtUQF1hSn5QdEJjXXpbcnddQWNe;MTQ4MTMzMUAzMjMxMmUzMTJlMzMzNVhNZHU5YnFHMmJnQkJhSkZMOHFONGFGUFl1UGZod0Y0NUJMNmV5UFVjSkU9;MTQ4MTMzMkAzMjMxMmUzMTJlMzMzNUNOWEtoTWREWWdvZExzV0o1MHNzZXdvK3VMQk9ubFRVYXRGM3I1YTRsQUk9;MTQ4MTMzM0AzMjMxMmUzMTJlMzMzNVVSQzZPR1VDNXFVbnlmWnFrWS9OMmtXV05JemJ4YnhqeTZpZmdISzJscnc9');

        Vue.use(DocumentEditorPlugin);

        export default {
            props: {
                content: {
                    // type: Object,
                    default: {}
                },
                height: {
                    // type: String,
                    default: "870px"
                },
                width: {
                    // type: String,
                    default: null
                }
            },
            data: function() {
                return {
                };
            },
            provide: {
                //Inject require modules.
                DocumentEditor : []
            },
            mounted() {
                this.$nextTick(function () {

                var obj = this.$refs.documenteditor;
                let text = {
                        "sections": [
                            {
                                "blocks": [
                                    {
                                        "inlines": [
                                            {
                                                "characterFormat": {
                                                    "bold": true,
                                                    "italic": true
                                                },
                                                "text": ""
                                            }
                                        ]
                                    }
                                ],
                                "headersFooters": {
                                }
                            }
                        ]
                    }
                    let datatodisplay = (this.content == '' ||  this.content == undefined ||  this.content == null)? text : this.content
                obj.open(datatodisplay)
                obj.documentName=this.documentName;
                this.$refs.documenteditor.ej2Instances.showPropertiesPane = false
                this.$refs.documenteditor.ej2Instances.restrictEditing  = true
                this.$refs.documenteditor.ej2Instances.serviceUrl = this.hostUrl + 'api/documenteditor/';
                this.$refs.documenteditor.ej2Instances.documentChange = () => {
                    
                    this.documentChangedEvent();
                    };
                });
                setTimeout(() => {
                    this.$refs.documenteditor.fitPage('FitPageWidth');
                }, 100);
            },
            methods: {
                onInsertImage: function() {
                    if (navigator.userAgent.match('Chrome') || navigator.userAgent.match('Firefox') || navigator.userAgent.match('Edge') || navigator.userAgent.match('MSIE') || navigator.userAgent.match('.NET')) {
                        let documenteditor =this.$refs.documenteditor;
                        if (args.target.files[0]) {
                            let path = args.target.files[0];
                            let reader = new FileReader();
                            reader.onload = function (frEvent) {
                                let base64String = frEvent.target.result;
                                let image = document.createElement('img');
                                image.addEventListener('load', function () {
                                    //Insert image in Document Editor.
                                    documenteditor.ej2Instances.editor.insertImage(base64String, this.width, this.height);
                                })
                                image.src = base64String;
                            };
                            reader.readAsDataURL(path);
                        }
                        //Safari does not Support FileReader Class
                    } else {
                            let image = document.createElement('img');
                            image.addEventListener('load', function () {
                                //Insert image in Document Editor.
                                documenteditor.ej2Instances.editor.insertImage(args.target.value);
                            })
                            image.src = args.target.value;
                    }
                },
                insertImageButtonClick: function() {
                    this.$refs.insertImageButton.value = '';
                    this.$refs.insertImageButton.click();
                }
            },
            computed:{
                responsiveWidth() {
                    const currentWidth = this.$vuetify.breakpoint.width;
                    if (currentWidth === 2560) {
                        return '1080px';
                    } else if (currentWidth === 1536) {
                        return '660px';
                    } else { return '660px'}
                }
            }
            }
</script>
<style>
    @import "./material.css";
    @import "../../node_modules/@syncfusion/ej2-vue-documenteditor/styles/material.css";
</style>