<template>
  <v-row>
    <SnackBar :data="snackbar_data" />
    <!-- TOP CARD -->
    <!-- <TotalsCard v-if="!add_new_product_card" :data="total_stock" type="product"  :class=" privacyMood ? 'privacyMood' : '' " /> -->

    <!-- ADD/EDIT DIALOG -->
    <v-dialog
      class="add_new_product_dialog"
      v-model="add_new_product_dialog"
      max-width="700px"
    >
      <v-card class="main_card" style="padding: 20px 30px !important">
        <v-card-title id="card-title">
          <h4 class="text--text">Select Product/Service</h4>
        </v-card-title>
        <v-card-text class="main_card_text mt-5">
          <v-list-item
            link
            class="product_type_box"
            v-for="(item, index) in product_service_list"
            :key="index"
            @click="handleSelectedProduct(item.title)"
          >
            <div class="product_type_icon">
              <InventoryIcon v-if="item.title === 'Inventory'" />
              <NonInventoryIcon v-if="item.title === 'Non-Inventory'" />
              <ServiceIcon v-if="item.title === 'Service'" />
              <BundleIcon v-if="item.title === 'Bundle'" />
            </div>
            <div class="product_type_title">
              <h4 class="text--text mb-2">{{ item.title }}</h4>
              <span class="subtext--text">{{ item.text }}</span>
            </div>
          </v-list-item>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- INACTIVE DIALOG -->
    <v-dialog v-model="inactiveDialog" class="ma-0 pa-0" max-width="500">
      <v-card id="card">
        <v-card-title id="card-title"
          >Sure you want to
          {{ product_service.status == 1 ? 'Inactive' : 'active' }} this
          product/service?</v-card-title
        >
        <v-card-text id="card-text">
          <div class="flex_row">
            <v-spacer />
            <v-btn
              class="tall__btn"
              color="subtext"
              outlined
              @click="inactiveDialog = false"
              >Cancel</v-btn
            >
            <v-btn
              class="tall__btn ml-3"
              color="primary"
              @click="handleProductStatus"
            >
              Yes
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- DELETE DIALOG -->
    <v-dialog v-model="deleteDialog" class="ma-0 pa-0" max-width="500">
      <v-card id="card">
        <v-card-title id="card-title"
          >Are you sure you want to delete this product/service?</v-card-title
        >
        <v-card-text id="card-text">
          <div class="flex_row">
            <v-spacer />
            <v-btn
              class="tall__btn"
              color="subtext"
              outlined
              @click="deleteDialog = false"
              >Cancel</v-btn
            >
            <v-btn class="tall__btn ml-3" color="error" @click="deleteProduct">
              <v-icon color="white" class="mr-2" small>fa-trash</v-icon>
              Delete
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- FILTER DIALOG -->
    <v-dialog
      id="custom_dialog"
      v-model="filterDialog"
      persistent
      max-width="500px"
    >
      <v-card id="card" style="padding: 20px 30px !important">
        <v-card-title id="card-title">
          <h4 class="text--text">Filter</h4>
          <v-icon
            small
            color="subtext"
            class="ml-5"
            @click="filterDialog = false"
            >fa-close</v-icon
          >
        </v-card-title>
        <v-card-text id="card-text">
          <v-container class="ma-0 pa-0">
            <div class="other_filters mt-2">
              <v-row>
                <v-col cols="6" class="ma-0 pa-0">
                  <v-checkbox
                    color="primary"
                    label="Type"
                    v-model="filter_checkbox"
                  />
                </v-col>
                <v-col cols="6" class="ma-0 pa-0">
                  <v-select
                    v-model="type"
                    color="primary"
                    flat
                    :items="productTypes"
                    placeholder="Type Detail"
                    item-text="name"
                    item-value="name"
                    :disabled="!filter_checkbox"
                  ></v-select
                ></v-col>
              </v-row>
            </div>
            <v-row class="action_btn mt-5">
              <v-col cols="5" class="ma-0 pa-0">
                <v-btn
                  class="tall__btn"
                  color="subtext"
                  block
                  outlined
                  @click="handleClearFilter"
                >
                  <span class="primary--text">Clear All</span></v-btn
                >
              </v-col>
              <v-spacer />
              <v-col cols="6" class="ma-0 pa-0">
                <v-btn
                  class="tall__btn"
                  color="primary"
                  block
                  @click="handleFilterData"
                  :disabled="!type"
                  >Apply</v-btn
                >
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- PRODUCT DATA TABLE -->
    <v-row class="" v-if="add_new_product_card == false">
      <v-col cols="12">
        <v-card color="card_bg" id="card">
          <v-card-text
            id="card-text"
            style="margin-top: 0 !important"
            :class="privacyMood ? 'privacyMood' : ''"
          >
            <v-data-table
              id="PRODUCTS"
              class="main__table elevation-0"
              :headers="headers"
              :items="services"
              :page="page"
              :pageCount="totalPage"
              :options.sync="options"
              :server-items-length="totalCount"
              :footer-props="{ 'items-per-page-options': [10, 20] }"
            >
              <template v-slot:item.tax_code="{ item }">
                {{ item.tax_code.code }}
              </template>
              <template v-slot:item.income_account="{ item }">
                {{ item.income_account ? item.income_account.name : '' }}
              </template>
              <template v-slot:item.status="{ item }">
                <div class="status__con">
                  <span
                    :class="
                      item.status == 1
                        ? 'light_accent4 accent4--text'
                        : 'light_accent2 accent2--text'
                    "
                    class="status"
                  >
                    {{ item.status == 1 ? 'Active' : 'InActive' }}
                  </span>
                </div>
              </template>

              <template v-slot:top>
                <div class="top__con">
                  <v-text-field
                    class="search_bar"
                    v-model="search"
                    color="outline"
                    outlined
                    solo
                    flat
                    hide-details
                    dense
                    height="45px"
                    style="min-width: 500px"
                    @keyup="handleData"
                  >
                    <template slot="prepend-inner">
                      <v-icon color="outlined" small>fa-search</v-icon>
                    </template>
                    <template slot="label">
                      <span class="subtext--text mr-5">Search </span> </template
                    >companies
                  </v-text-field>
                  <div class="action__btn">
                    <v-btn
                      class="tall__btn"
                      color="primary"
                      @click="add_new_product_dialog = true"
                    >
                      <v-icon x-small color="white" class="mr-2"
                        >fa-plus</v-icon
                      >
                      Add Product
                    </v-btn>
                    <v-btn
                      class="tall__btn ml-2 subtext--text"
                      color="subtext"
                      outlined
                      @click="filterDialog = true"
                    >
                      <v-icon class="mr-2" small>fa-filter</v-icon>
                      Filter
                    </v-btn>
                  </div>
                </div>
              </template>
              <template v-slot:item.action="{ item }">
                <td class="pa-0 ma-0" style="width: 30px">
                  <div class="actions__con">
                    <v-menu
                      transition="slide-y-transition"
                      rounded="lg"
                      offset-y
                    >
                      <template v-slot:activator="{ attrs, on }">
                        <v-btn
                          v-bind="attrs"
                          v-on="on"
                          color="subtext"
                          class="mx-2"
                          icon
                        >
                          <v-icon small>fa-solid fa-ellipsis-vertical</v-icon>
                        </v-btn>
                      </template>
                      <v-list>
                        <v-list-item>
                          <v-list-item-title class="">
                            <span
                              class="n_text text--text ml-2"
                              @click="handleActions(item, `edit`)"
                            >
                              Edit
                            </span>
                          </v-list-item-title>
                        </v-list-item>
                        <v-list-item>
                          <v-list-item-title class="">
                            <span
                              class="n_text text--text ml-2"
                              @click="handleActions(item, `delete`)"
                            >
                              Delete
                            </span>
                          </v-list-item-title>
                        </v-list-item>
                        <v-list-item>
                          <v-list-item-title class="">
                            <span
                              class="n_text text--text ml-2"
                              @click="handleActions(item, `inactive`)"
                              >{{
                                item.status == 0 ? 'Active' : 'Inactive'
                              }}</span
                            >
                          </v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </div>
                </td>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- ADDING NEW PRODUCT CARD -->
    <v-col cols="12">
      <v-card color="card_bg" id="card" v-if="add_new_product_card == true">
        <v-card-title class="main_card_title">
          <h4>{{ edit_product ? 'Edit' : 'Add' }} New {{ product_type }}</h4>
          <div class="flex_row">
            <v-btn
              class="tall__btn"
              color="subtext"
              outlined
              @click="add_new_product_card = false"
            >
              <span class="primary--text font-weight-bold">Cancel</span>
            </v-btn>
            <v-btn class="tall__btn px-7 ml-4" color="primary" @click="save()">
              <span class="px-9">Save</span>
            </v-btn>
          </div>
        </v-card-title>
        <v-card-text id="card-text" style="margin-top: 0 !important">
          <v-form ref="newProduct">
            <v-row>
              <v-col cols="12" md="4">
                <CustomInputContainer label="Company" :mandatory="true">
                  <div slot="input">
                    <v-select
                      :items="companies"
                      v-model="newProduct.company"
                      placeholder="Select Company"
                      outlined
                      dense
                      hide-details
                      item-text="name"
                      item-value="id"
                      :rules="genericRule"
                    ></v-select>
                  </div>
                </CustomInputContainer>
              </v-col>
            </v-row>
            <!-- Company Logo -->
            <v-row v-if="product_type == 'Inventory'">
              <v-col cols="4">
                <span>Upload Company Logo</span>
                <div class="upload_company_logo_container">
                  <v-img src="/logo_placeholder.png" max-width="90px" />
                  <div class="actions">
                    <div class="flex_row align-center justify-center">
                      <v-btn class="upload__btn" color="primary" outlined
                        >Upload Photo</v-btn
                      >
                      <v-btn class="remove__btn ml-3" color="subtext" outlined
                        >Remove</v-btn
                      >
                    </div>
                    <span class="subtext--text caption mt-3"
                      >You can upload jpg or png image files. Max size of
                      5mb.</span
                    >
                  </div>
                </div>
              </v-col>
            </v-row>

            <!-- Name/SUK/Category Details -->
            <v-row>
              <v-col cols="12" md="4">
                <CustomInputContainer label="Name" :mandatory="true">
                  <div slot="input">
                    <v-text-field
                      placeholder="Type Name"
                      outlined
                      dense
                      v-model="newProduct.name"
                      type="text"
                      :rules="genericRule"
                    ></v-text-field>
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="12" md="4">
                <CustomInputContainer label="SKU" :mandatory="true">
                  <div slot="input">
                    <v-text-field
                      placeholder="Type SKU"
                      outlined
                      dense
                      v-model="newProduct.sku"
                      type="text"
                      :rules="genericRule"
                    ></v-text-field>
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="12" md="4" v-if="product_type != 'Bundle'">
                <CustomInputContainer label="Category" :mandatory="true">
                  <div slot="input">
                    <v-select
                      :items="['Restaurant', 'Office', 'Warehouse']"
                      v-model="newProduct.category"
                      placeholder="Select Category"
                      outlined
                      dense
                      hide-details
                      :rules="genericRule"
                    ></v-select>
                  </div>
                </CustomInputContainer>
              </v-col>
            </v-row>

            <!-- Stock Details -->
            <div v-if="product_type == 'Inventory'">
              <v-row>
                <v-col cols="12">
                  <h6 class="mb-3 text--text s_title">Stock Details</h6>
                  <v-divider id="divider"></v-divider>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" md="4">
                  <CustomInputContainer label="Initial quantity on hand*">
                    <div slot="input">
                      <v-text-field
                        placeholder=""
                        outlined
                        dense
                        type="text"
                      ></v-text-field>
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col cols="12" md="4">
                  <CustomInputContainer label="As of date*">
                    <div slot="input">
                      <v-text-field
                        placeholder="00/00/0000"
                        outlined
                        dense
                        type="text"
                      ></v-text-field>
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col cols="12" md="4">
                  <CustomInputContainer label="Reorder point">
                    <div slot="input">
                      <v-text-field
                        placeholder=""
                        outlined
                        dense
                        type="text"
                      ></v-text-field>
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col cols="12" md="6" class="pt-0">
                  <CustomInputContainer label="Inventory asset account">
                    <div slot="input">
                      <v-select
                        items=""
                        placeholder="Select inventory asset"
                        outlined
                        hide-details
                        dense
                      />
                    </div>
                  </CustomInputContainer>
                </v-col>
              </v-row>
            </div>

            <!-- Description -->
            <div v-if="product_type != 'Bundle'">
              <v-row>
                <v-col cols="12">
                  <h6 class="mb-3 text--text s_title">Description</h6>
                  <v-divider id="divider"></v-divider>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" md="6" class="mt-0 pt-0">
                  <v-checkbox
                    dense
                    color="primary"
                    label="I sell this product/service to my customers"
                  />
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" md="4">
                  <CustomInputContainer label="Description">
                    <div slot="input">
                      <v-textarea
                        v-model="newProduct.saleDescription"
                        placeholder="Description on sales form"
                        outlined
                        dense
                        style="min-height: 10px !important"
                      ></v-textarea>
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col cols="6" md="3">
                  <v-col cols="12" class="pa-0">
                    <CustomInputContainer
                      label="Sales Price/Rate"
                      :mandatory="true"
                    >
                      <div slot="input">
                        <v-text-field
                          v-model="newProduct.salePrice"
                          :rules="genericRule"
                          placeholder="Type Price"
                          outlined
                          dense
                          type="number"
                        ></v-text-field>
                      </div>
                    </CustomInputContainer>
                  </v-col>
                  <v-col cols="12" class="pa-0">
                    <CustomInputContainer label="Tax" :mandatory="true">
                      <div slot="input">
                        <v-select
                          v-model="newProduct.saleTax"
                          :rules="genericRule"
                          :items="taxCodeList"
                          item-text="code"
                          item-value="_id"
                          placeholder="Select Tax"
                          outlined
                          hide-details
                          dense
                        />
                      </div>
                    </CustomInputContainer>
                  </v-col>
                </v-col>
                <v-col cols="6" md="3">
                  <v-col cols="12" class="pa-0">
                    <CustomInputContainer label="Markup Price Percentage">
                      <div slot="input">
                        <v-text-field
                          v-model="newProduct.saleMarkupPercentage"
                          placeholder="Type Price Percentage"
                          outlined
                          dense
                          type="number"
                        ></v-text-field>
                      </div>
                    </CustomInputContainer>
                  </v-col>
                  <v-col cols="12" class="pa-0">
                    <CustomInputContainer label="Type account">
                      <div slot="input">
                        <v-select
                          v-model="newProduct.saleAccountType"
                          :items="accountLIst"
                          item-text="name"
                          item-value="_id"
                          placeholder="Select account"
                          outlined
                          hide-details
                          dense
                        />
                      </div>
                    </CustomInputContainer>
                  </v-col>
                </v-col>
                <v-col cols="6" md="2">
                  <v-col cols="12" class="pa-0">
                    <CustomInputContainer label="Markup Price">
                      <div slot="input">
                        <v-text-field
                          v-model="newProduct.saleMarkupPrice"
                          placeholder="Type Price"
                          outlined
                          dense
                          type="number"
                        ></v-text-field>
                      </div>
                    </CustomInputContainer>
                  </v-col>
                </v-col>
              </v-row>
            </div>

            <!-- Purchasing Information -->
            <div v-if="product_type != 'Bundle'">
              <v-row>
                <v-col cols="12">
                  <h6 class="mb-3 text--text s_title">
                    Purchasing Information
                  </h6>
                  <v-divider id="divider"></v-divider>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" md="6" class="mt-0 pt-0">
                  <v-checkbox
                    dense
                    color="primary"
                    label="I purchase this product/service from a supplier"
                  />
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" md="4">
                  <CustomInputContainer label="Description">
                    <div slot="input">
                      <v-textarea
                        v-model="newProduct.purchaseDescription"
                        placeholder="Description on purchase form"
                        outlined
                        dense
                        style="min-height: 10px !important"
                      ></v-textarea>
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col cols="12" md="4">
                  <v-col cols="12" class="pa-0">
                    <CustomInputContainer label="Cost" :mandatory="true">
                      <div slot="input">
                        <v-text-field
                          v-model="newProduct.purchaseCost"
                          placeholder="Type Cost"
                          outlined
                          dense
                          type="number"
                        ></v-text-field>
                      </div>
                    </CustomInputContainer>
                    <!-- <v-checkbox
                  class="pa-0 ma-0"
                  style="max-width: 10px !important; max-height: 10px !important;"
                  color="primary"
                  dense
                  density
                  label="Inclusive of Purchase Tax"
                ></v-checkbox> -->
                  </v-col>
                  <v-col cols="12" class="pa-0">
                    <CustomInputContainer label="Purchase Tax">
                      <div slot="input">
                        <v-select
                          v-model="newProduct.purchaseTax"
                          :items="taxCodeList"
                          item-text="code"
                          item-value="_id"
                          placeholder="Select Tax"
                          outlined
                          hide-details
                          dense
                        />
                      </div>
                    </CustomInputContainer>
                  </v-col>
                </v-col>
                <v-col cols="12" md="4">
                  <v-col cols="12" class="pa-0">
                    <CustomInputContainer label="Expense account">
                      <div slot="input">
                        <v-select
                          v-model="newProduct.purchaseAccountType"
                          :items="accountLIst"
                          item-text="name"
                          item-value="_id"
                          placeholder="Type account"
                          outlined
                          dense
                        />
                      </div>
                    </CustomInputContainer>
                  </v-col>
                  <v-col cols="12" class="pa-0">
                    <CustomInputContainer label="Preferred Supplier">
                      <div slot="input">
                        <v-select
                          :items="supplierList"
                          v-model="newProduct.purchaseSupplier"
                          item-text="company_name"
                          item-value="_id"
                          placeholder="Select Supplie"
                          outlined
                          dense
                        />
                      </div>
                    </CustomInputContainer>
                  </v-col>
                </v-col>
              </v-row>
            </div>

            <!-- Bundle -->
            <div v-if="product_type === 'Bundle'">
              <v-row>
                <v-col cols="12" class="">
                  <v-checkbox
                    dense
                    color="primary"
                    label="I sell this product/service to my customers"
                  />
                </v-col>
                <v-col cols="12" md="4">
                  <CustomInputContainer label="Description">
                    <div slot="input">
                      <v-textarea
                        placeholder="Description on sales form"
                        outlined
                        dense
                        style="min-height: 10px !important"
                      ></v-textarea>
                    </div>
                  </CustomInputContainer>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12">
                  <h6 class="mb-3 text--text s_title">
                    Products/services included in the bundle
                  </h6>
                  <v-divider id="divider"></v-divider>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" md="6" class="mt-0 pt-0">
                  <v-checkbox
                    dense
                    color="primary"
                    label="Display bundle components when printing or sending transactions"
                  />
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" md="12">
                  <v-simple-table class="invoice_journal_table">
                    <template v-slot:default>
                      <thead class="">
                        <tr class="" style="height: 35px !important">
                          <th
                            v-for="item in products_included_in_bundle_headers"
                            :key="item"
                            class="text-left text--text font-weight-bold"
                            style="
                              font-size: 12px !important;
                              font-weight: 500 !important;
                            "
                          >
                            {{ item }}
                          </th>
                        </tr>
                      </thead>
                      <tbody class="">
                        <tr
                          class="invoice_journal_rows"
                          v-for="(
                            item, index
                          ) in products_included_in_bundle_data"
                          :key="index"
                        >
                          <td class="">
                            <v-select
                              class="rounded-lg"
                              :value="item.product"
                              items=""
                              :placeholder="item.product"
                              solo
                              flat
                              hide-details
                              dense
                              :rules="main_rule"
                            />
                          </td>
                          <td class="">
                            <v-text-field
                              :value="item.quantity"
                              class="rounded-lg"
                              type="text"
                              :placeholder="item.transaction_type"
                              solo
                              flat
                              hide-details
                              dense
                              :rules="main_rule"
                            />
                          </td>
                          <td class="">
                            <v-btn icon color="subtext" class="mx-0"
                              ><v-icon class="" color="subtext" x-small
                                >fa-light fa-trash-can</v-icon
                              ></v-btn
                            >
                          </td>
                        </tr>
                      </tbody>
                    </template>
                  </v-simple-table>
                </v-col>
                <v-col cols="12">
                  <div
                    class="action__btn flex_row justify-lg-space-between mt-5"
                  >
                    <v-btn
                      @click="handleAddLineInProductsIncludedInBundle()"
                      class="small__btn"
                      outlined
                      color="subtext"
                    >
                      <v-icon x-small color="subtext" class="mr-2"
                        >fa-plus</v-icon
                      >
                      <span class="text--text">Add Lines</span>
                    </v-btn>
                  </div>
                </v-col>
              </v-row>
            </div>
          </v-form>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import { mapState } from 'vuex'
import '@/assets/scss/_product.scss'
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'
import SnackBar from '@/components/utils/SnackBar.vue'
import TotalsCard from '@/components/Cards/TotalsCard/index.vue'
import InventoryIcon from '@/assets/images/Products/inventory_icon.svg'
import NonInventoryIcon from '@/assets/images/Products/non_inventory_icon.svg'
import ServiceIcon from '@/assets/images/Products/service_icon.svg'
import BundleIcon from '@/assets/images/Products/bundle_icon.svg'

export default {
  components: {
    CustomInputContainer,
    SnackBar,
    TotalsCard,
    InventoryIcon,
    NonInventoryIcon,
    ServiceIcon,
    BundleIcon,
  },
  props: {
    taxCodeList: Array,
    accountLIst: Array,
    supplierList: Array,
  },
  data() {
    return {
      newProduct: {
        purchaseCost: 0,
      },
      edit_product: false,
      privacyMood: false,
      product_type: null,
      add_new_product_card: false,
      add_new_product_dialog: false,
      companies: [],
      product_service_list: [
        {
          title: 'Inventory',
          text: 'Products you buy and/or sell and that you track quantities of.',
        },
        {
          title: 'Non-Inventory',
          text: 'Products you buy and/or sell but don’t need to (or can’t) track quantities of, for example, nuts and bolts used in an installation.',
        },
        {
          title: 'Service',
          text: 'Services that you provide to customers, for example, landscaping or tax preparation services.',
        },
        {
          title: 'Bundle',
          text: 'A collection of products and/or services that you sell together, for example, a gift basket of fruit, cheese, and wine.',
        },
      ],
      total_stock: [
        { name: 'Low Stock', amount: '0 items' },
        { name: 'Out of Stock', amount: '0 items' },
      ],
      deleteDialog: false,
      inactiveDialog: false,
      product_service: {}, // user select from the list
      edit: false,
      value: 0,
      options: { itemsPerPage: 10 },
      type: '',
      rules: {
        required: (value) => !!value || 'This field is required.',
      },
      // ADD PRODUCT DIALOG
      addNewProductDialog: false,
      isService: false,
      snackbar_data: { snackbar: false, text: '', color: '', timeout: 2000 },

      // FILTER DIALOG
      filterDialog: false,
      filter_checkbox: false,
      productTypes: ['Service', 'Product'],

      // DATA TABLE
      page: 1,
      totalCount: 0,
      totalPage: 0,
      search: '',
      selected: [],
      genericRule: [(v) => !!v || 'This field is Required'],
      headers: [
        { text: 'Name', value: 'name', align: 'start' },
        { text: 'SKU', value: 'sku', align: 'center' },
        { text: 'Type', value: 'type', align: 'center' },
        { text: 'Status', value: 'status', align: 'center' },
        { text: 'Sales Price', value: 'price', align: 'center' },
        { text: 'Cost', value: 'cost', align: 'center' },
        { text: 'Tax Code', value: 'tax_code', align: 'center' },
        { text: 'Account', value: 'income_account', align: 'center' },
        { text: 'QTY', value: 'quantity', align: 'center' },
        { text: 'Reorder', value: 'reorder_point', align: 'center' },
        { text: 'Action', value: 'action', sortable: false },
      ],
      services: [],
      valid: '',
    }
  },
  mounted() {
    if (this.companySelection.length > 1) {
      this.companies = this.companySelection
    } else {
      this.companies = this.companySelection[0]
    }
  },
  methods: {
    async save() {
      if (this.$refs.newProduct.validate()) {
        this.newProduct.isInventory = false
        this.newProduct.type = this.product_type
        if (this.newProduct.type == 'Inventory') {
          this.newProduct.isInventory = true
          this.newProduct.type = 'Product'
        } else if (this.newProduct.type == 'Non-Inventory') {
          this.newProduct.type = 'Product'
        }
        let updateProduct = {
          company: this.newProduct.company,
          name: this.newProduct.name,
          type: this.newProduct.type,
          sku: this.newProduct.sku,
          isInventory: this.newProduct.isInventory,
          is_purchasing_product: true,
          is_selling_product: true,
          purchaseInfo: {
            description: this.newProduct.purchaseDescription,
          },
          sellingInfo: {
            description: this.newProduct.saleDescription,
          },
          income_account: this.newProduct.saleAccountType,
          expense_account: this.newProduct.purchaseAccountType,
          price: this.newProduct.salePrice,
          cost: this.newProduct.purchaseCost.length
            ? this.newProduct.purchaseCost
            : 0,
          category: this.newProduct.category,
          tax_code: this.newProduct.saleTax,
        }
        Object.keys(updateProduct).forEach((key) => {
          if (updateProduct[key] === undefined) {
            delete updateProduct[key]
          }
        })

        const AuthStr = 'Bearer '.concat(this.$store.state.token)
        await this.$axios
          .$post(`service`, updateProduct, {
            headers: { Authorization: AuthStr },
          })
          .then(async (res) => {
            this.newProduct = {}
            this.add_new_product_card = false
            this.snackbar_data = {
              snackbar: true,
              text: 'Product/Service Added Successfully',
              color: 'success',
              icon: 'check',
              timeout: 2000,
            }
          })
          .catch((err) => {
            this.snackbar_data = {
              snackbar: true,
              text: 'Something Went Wrong',
              color: 'danger',
              icon: 'close',
              timeout: 2000,
            }
            // console.log(err)
          })
      } else {
        this.snackbar_data = {
          snackbar: true,
          text: 'Fill All Data',
          color: 'danger',
          icon: 'close',
          timeout: 2000,
        }
      }
    },
    handleSelectedProduct(value) {
      this.product_type = value
      this.add_new_product_dialog = false
      this.add_new_product_card = true
    },
    async handleData(field) {
      const { page, itemsPerPage } = this.options
      let pageNumber = page - 1
      var data = {
        type: this.type,
        page: pageNumber,
        search: this.search,
        limit: itemsPerPage,
      }
      field && (data[field.name] = field.value)
      await this.fetchProducts(data)
    },

    async fetchProducts({ page, type, search, limit }) {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      const list = this.companySelection.map((item) => item.id)

      const payload = { company: list }
      await this.$axios
        .$post(
          `service/all?type=${type}&search=${search}&limit=${limit}&page=${page}`,
          payload,
          { headers: { Authorization: AuthStr } }
        )
        .then(async (res) => {
          const { services, fields, total_page, total_count } = res.data
          this.services = services
          this.totalPage = total_page
          this.totalCount = total_count
        })
        .catch((err) => {
          this.snackbar_data = {
            snackbar: true,
            text: 'Something Went Wrong',
            color: 'danger',
            icon: 'check',
            timeout: 2000,
          }
          // console.log(err)
        })
    },
    async handleFilterData() {
      this.filterDialog = false
      await this.handleData()
    },
    async handleClearFilter() {
      this.type = ''
      this.filterDialog = false
      await this.handleData()
    },
    async handleProductStatus() {
      this.inactiveDialog = false
      const { _id, status } = this.product_service
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      const payload = { status: !status }
      await this.$axios
        .$patch('/service/by-id/' + _id, payload, {
          headers: { Authorization: AuthStr },
        })
        .then(async (res) => {
          this.snackbar_data = {
            snackbar: true,
            text: 'Status Updated Successfully',
            color: 'success',
            icon: 'check',
            timeout: 2000,
          }
          await this.handleData()
        })
        .catch((err) => {
          this.snackbar_data = {
            snackbar: true,
            text: 'something went wrong',
            color: 'danger',
            icon: 'check',
            timeout: 2000,
          }
          // console.log(err)
        })
    },
    async deleteProduct() {
      this.deleteDialog = false
      const { _id } = this.product_service
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios
        .$delete('/service/by-id/' + _id, {
          headers: { Authorization: AuthStr },
        })
        .then(async (res) => {
          this.snackbar_data = {
            snackbar: true,
            text: 'Product/Service Deleted Successfully',
            color: 'error',
            icon: 'close',
            timeout: 2000,
          }
          await this.handleData()
        })
        .catch((err) => {
          this.snackbar_data = {
            snackbar: true,
            text: 'something went wrong',
            color: 'danger',
            icon: 'check',
            timeout: 2000,
          }
          // console.log(err)
        })
    },
    async addProduct() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      var type = this.isService ? 'Service' : 'Product'
      const payload = { ...this.product_service, type: type }
      await this.$axios
        .$post(`service`, payload, { headers: { Authorization: AuthStr } })
        .then(async (res) => {
          this.product_service = {}
          this.snackbar_data = {
            snackbar: true,
            text: 'Added Successfully',
            color: 'success',
            icon: 'check',
            timeout: 2000,
          }
          await this.handleData()
        })
        .catch((err) => {
          this.snackbar_data = {
            snackbar: true,
            text: 'something went wrong',
            color: 'danger',
            icon: 'check',
            timeout: 2000,
          }
          // console.log(err)
        })
    },
    async editProduct() {
      const { _id } = this.product_service
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios
        .$patch('/service/by-id/' + _id, this.product_service, {
          headers: { Authorization: AuthStr },
        })
        .then(async (res) => {
          this.snackbar_data = {
            snackbar: true,
            text: 'Updated Successfully',
            color: 'success',
            icon: 'check',
            timeout: 2000,
          }
          await this.handleData()
        })
        .catch((err) => {
          this.snackbar_data = {
            snackbar: true,
            text: 'something went wrong',
            color: 'danger',
            icon: 'check',
            timeout: 2000,
          }
          // console.log(err)
        })
    },
    handleAdd() {
      this.edit = false
      this.addNewProductDialog = true
      this.product_service = {}
    },
    async handleAddData() {
      this.addNewProductDialog = false
      this.edit ? await this.editProduct() : await this.addProduct()
    },

    handleActions(value, action) {
      console.log(value)
      this.product_service = value
      if (action == 'edit') {
        this.edit = true
        this.addNewProductDialog = true
        if (value.type == 'Service') {
          this.isService = true
        } else {
          this.isService = false
        }
      } else if (action == 'inactive') {
        this.inactiveDialog = true
      } else if (action == 'delete') {
        this.deleteDialog = true
      }
    },
  },
  watch: {
    options: {
      handler() {
        this.handleData()
      },
    },
    companySelection: {
      handler() {
        console.log('test')
        if (this.companySelection.length > 1) {
          this.companies = this.companySelection
        } else {
          this.companies = this.companySelection[0]
        }
      },
    },
    deep: true,
  },
  computed: {
    color() {
      switch (this.value) {
        case 0:
          return 'blue-grey'
        case 1:
          return 'teal'
        case 2:
          return 'brown'
        case 3:
          return 'indigo'
        default:
          return 'blue-grey'
      }
    },
    ...mapState(['companySelection']),
  },
}
</script>
