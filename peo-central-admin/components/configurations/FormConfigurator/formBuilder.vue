<template>
    <v-row>
        <v-col cols="12" md="4">
            <v-card>
                <v-tabs v-model="tab" background-color="transparent">
                    <v-tab href="#default_fields">
                        Default Fields
                    </v-tab>
                    <v-tab href="#field_settings">
                        Field Settings
                    </v-tab>
                </v-tabs>
                <v-tabs-items v-model="tab"> <!-- default fields -->
                    <v-tab-item value="default_fields">
                        <v-row class="mt-4">
                            <v-col cols="12">
                                <v-text-field v-model="search_default_field" placeholder="Search default field..." prepend-icon="mdi-magnify" class="mb-3 mt-0 mx-3 py-0" outlined dense single-line hide-details clearable></v-text-field>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-data-table :items="defaultFieldList" item-key="_id" sort-by="label" sort-asc class="elevation-1">
                                <template v-slot:body="props">
                                    <draggable :list="props.items" :options="fieldOptions" :clone="handleClone">
                                        <dataTableRowHandler v-for="(item, index) in props.items" :key="index" :item="item" :headers="fieldHeaders">
                                            <template v-slot:[`item.field`]="{ item }">
                                                <div class="my-1">
                                                    <v-btn class="ml-2 elevation-0 pa-4" text :key="index+item._id">
                                                        <v-icon color="grey" class="mr-2">{{ item.icon }}</v-icon>
                                                        <span>{{ item.label }}</span>
                                                    </v-btn>
                                                </div>
                                            </template>
                                        </dataTableRowHandler>
                                    </draggable>
                                </template>
                            </v-data-table>
                        </v-row>
                    </v-tab-item>
                    <v-tab-item value="field_settings"> <!-- field settings -->
                        <div class="d-flex justify-center align-center drag-section" v-if="!hasSelectedField">
                            <p>No selected field.</p>
                        </div>
                        <v-row v-else>
                            <v-col cols="12" class="bottom-border">
                                <h5>{{ selected_field.name }}</h5>
                            </v-col>
                            <v-col cols="12">
                                <p class="mb-1">Field Label</p>
                                <v-text-field v-model="selected_field.label" dense outlined hide-details></v-text-field>
                            </v-col>
                            <v-col cols="12">
                                <p class="mb-1">Field Name</p>
                                <v-text-field v-model="selected_field.field_name" :disabled="true" dense outlined hide-details></v-text-field>
                            </v-col>
                            <v-col cols="12">
                                <p class="mb-1">Type</p>
                                <v-select :items="field_types" v-model="selected_field.type" @change="selectFieldType" dense outlined hide-details></v-select>
                            </v-col>
                            <v-col cols="12" v-if="selected_field.type == 'SingleSelection' || selected_field.type == 'MultipleSelection'">
                                <p class="mb-1">Options <span class="instruction-label">(Separate with comma)</span></p>
                                <v-text-field v-model="selections" @keydown="addChips($event)" class="options" dense outlined hide-details>
                                    <template v-slot:prepend-inner>
                                        <span v-for="(chipText , index) in selected_field.options" :key="index">
                                            <v-chip small class="mt-1 mr-1">{{chipText}}</v-chip>
                                        </span>
                                    </template>
                                </v-text-field>
                            </v-col>
                            <v-col cols="12" v-else-if="selected_field.type == 'SingleSelectionFromEndpoint' || selected_field.type == 'MultipleSelectionFromEndpoint'">
                                <p class="mb-1">Endpoint</p>
                                <v-text-field v-model="selected_field.options" class="options" dense outlined hide-details></v-text-field>
                            </v-col>
                            <v-col>
                                <v-checkbox v-model="selected_field.is_required" :value="selected_field.is_required" :false-value="false" :true-value="true" label="Required" class="rounded-pill custom-field-checkbox" dense hide-details></v-checkbox>
                            </v-col>
                            <v-col>
                                <v-checkbox v-model="selected_field.disable_in_edit_form" :value="selected_field.disable_in_edit_form" :false-value="false" :true-value="true" label="Disable in Edit Form" class="rounded-pill custom-field-checkbox" dense hide-details></v-checkbox>
                            </v-col>
                        </v-row>
                    </v-tab-item>
                </v-tabs-items>
            </v-card>
        </v-col>
        <v-col cols="12" md="8"> <!-- drag canvas -->
            <v-card class="py-6">
                <draggable :list="cloned_fields" :options="clonedFieldOptions" @change="changeField">
                    <template v-if="!hasDraggedField">
                        <div class="d-flex justify-center align-center drag-section">
                            <v-icon large color="green" class="mr-2">mdi-gesture-tap</v-icon>
                            <h5>Drag elements here</h5>
                        </div>
                    </template>
                    <template v-for="(field, index) in cloned_fields" v-else>
                        <v-hover v-slot="{ hover }" :key="index">
                            <v-list-item class="mx-4">
                                <v-list-item-content class="my-0 pt-0">
                                    <v-list-item-title @click="selectField(field, index)" :class="'px-2 pb-2 ' +appendActiveClass(index, hover)">
                                        <div class="d-flex align-center justify-space-between">
                                            <span class="my-2">{{ field.label }}</span>
                                            <div class="ma-0 pa-0" v-show="hover">
                                                <v-tooltip top><template v-slot:activator="{ on, attrs }"><v-btn v-bind="attrs" v-on="on" icon small @click.stop="deleteField(index)"><v-icon size="20" color="primary">mdi-trash-can-outline</v-icon></v-btn></template><span>Remove</span></v-tooltip> 
                                            </div>
                                        </div>
                                        <div v-html="field.html_body"></div>
                                    </v-list-item-title>
                                </v-list-item-content>
                            </v-list-item>
                        </v-hover>
                    </template>
                </draggable>
            </v-card>
        </v-col>
    </v-row>
</template>

<script>
import draggable from 'vuedraggable'
import dataTableRowHandler from './dataTableDraggableHandler.vue'

export default {
    components: {
        draggable,
        dataTableRowHandler
    },
    props: ['fields', 'cloned_fields', 'default_fields'],
    data() {
        return {
            fieldHeaders: [
                { text: '', value: 'field'}
            ],
            fieldOptions: {
                group: {
                    name: "fields",
                    pull: "clone",
                    put: false
                },
                sort: false
            },
            defaultFieldOptions: {
                group: {
                    name: "defaultfields",
                    pull: "clone",
                    put: false
                },
                sort: false
            },
            clonedFieldOptions: {
                group: "fields"
            },
            field_types: ['TextField', 'DateField', 'NumberField', 'SingleSelection', 'MultipleSelection', 'TextArea', 'SingleSelectionFromEndpoint', 'MultipleSelectionFromEndpoint'],
            selected_field: {},
            rules: {
                required: value => !!value || 'This field is required.'
            },
            tab: null,
            search_default_field: '',
            selections: ''
        }
    },
    methods: {
        handleClone(field) {
            // Create a fresh copy of item
            let cloneMe = JSON.parse(JSON.stringify(field));
            
            this.$delete(cloneMe, 'uid');

            return cloneMe;
        },
        changeField(event) {
            // console.log('changeField', this.cloned_fields)
        },
        deleteField(index) {
            this.cloned_fields.splice(index, 1)
        },
        selectField(field, index) {
            this.selected_field = field 
            this.selected_field.index = index
            this.tab = 'field_settings'
        },
        selectFieldType(type) {
            if(type == 'SingleSelection' || type == 'MultipleSelection') {
                if(this.selected_field.options) {
                    if(typeof(this.selected_field.options) == 'string') {
                        this.selected_field.options = this.selected_field.options && this.selected_field.options.length > 0 ? this.selected_field.options.split(',') : []
                    }
                } else {
                    this.selected_field.options = []
                }
            } else if(type == 'SingleSelectionFromEndpoint' || type == 'MultipleSelectionFromEndpoint') {
                this.selected_field.options = this.selected_field.options ? this.selected_field.options : ''
            } else {
                delete this.selected_field.options;
            }
        },
        appendActiveClass(index, hover) {
            let style = 'field-border'

            if(hover) {
                style = 'field-hover-border'
            }
            
            if(this.selected_field && this.selected_field.index == index) {
                style = 'field-active-border'
            }

            return style
        },
        addChips(event) {
            if(event.keyCode == 188 && event.code == 'Comma') {
                event.preventDefault();
                if(this.selections.length) {
                    this.selected_field.options.push(this.selections)
                    this.selections = ''
                }
            } else if(event.keyCode == 8 && event.code == 'Backspace') {
                if(this.selections == '') {
                    let index = this.selected_field.options.length - 1 // last index
                    this.selected_field.options.splice(index, 1)

                }
            }
        }
    },
    computed: {
        hasDraggedField() {
            if(this.cloned_fields.length > 0) {
                return true
            }
            return false
        },
        hasSelectedField() {
            if(Object.keys(this.selected_field).length == 0) {
                return false
            }
            return true
        },
        defaultFieldList() {
            let fields = _.cloneDeep(this.default_fields)

            if(this.search_default_field != null) {
                let filtered_fields = fields.filter(item => item.label.toLowerCase().indexOf(this.search_default_field) > -1 
                    || item.type.toLowerCase().indexOf(this.search_default_field) > -1
                    || item.field_name.toLowerCase().indexOf(this.search_default_field) > -1);
                return filtered_fields
            }

            return fields
        }
    },
}
</script>

<style>
.form-card {
    height: 100%;
    max-height: 800px;
    overflow: auto !important;
}
.v-btn__content {
    text-transform: capitalize !important;
}
.custom-field {
    color: #9e9e9e !important;
    padding: 8px !important;
    border: 1px solid #9e9e9e;
    border-radius: 4px;
}
.textfield {
    width: 100% !important;
    max-height: 42px;
}
.select {
    width: 100% !important;
    -webkit-appearance: menulist !important; /* override vuetify style */
    -moze-appearance: menulist !important; /* override vuetify style */
    appearance: menulist !important; /* override vuetify style */
}
.textarea {
    width: 100% !important;
    height: 80px;
}
.drag-section {
    height: 250px !important;
}
.field-border {
    border: 1px solid transparent;
}
.field-hover-border {
    border: 1px solid #0a94ff;
    border-radius: 8px;
}
.field-active-border {
    border: 1px solid #0a94ff;
    border-radius: 8px;
    background-color: #0a94ff17;
}
.bottom-border {
    border-top: 1px solid #e2e8f0;
    border-bottom: 1px solid #e2e8f0;
}
.custom-field-checkbox .v-label {
    font-size: 14px !important;
    color: #1e1e1e;
}
.instruction-label {
    font-size: 12px !important;
    font-style: italic;
}
</style>