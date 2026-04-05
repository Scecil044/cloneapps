<template>
  <v-form ref="form" v-model="valid">
    <v-row class="row1" v-if="bill_pop">
      <v-col cols="12">
        <v-card color="card_bg" id="card" style="min-height: 80vh !important">
          <v-card-title id="card-title">
            <h4>
              <v-icon color="black" dense class="mr-2" @click="closeBillDialog"
                >fa-arrow-left</v-icon
              >
              Add New Bill
            </h4>
            <div>
              <v-btn
                class="tall__btn px-9 mr-2"
                min-width="150px"
                color="white"
                style="border: 1px solid #e2e7f1 !important"
              >
                Make Recuring
              </v-btn>
              <v-btn
                class="tall__btn px-9"
                color="primary"
                min-width="150px"
                :disabled="!valid"
                @click="createBill"
              >
                Create Bill
              </v-btn>
            </div>
          </v-card-title>
          <v-divider id="divider" class="my-5"></v-divider>
          <v-card-text id="card-text">
            <div class="d-flex justify-space-between">
              <v-row class="py-0 my-0 align-start" style="gap: 30px">
                <v-col cols="12" class="pa-0">
                  <v-row class="mb-0 py-0 my-0">
                    <v-col cols="3">
                      <CustomInputContainer label="Supplier">
                        <div slot="input">
                          <v-select
                            v-model="new_bill.supplier"
                            placeholder="Select Supplier"
                            :items="suppliers_data"
                            :rules="requiredRules"
                            required
                            return-object
                            outlined
                            dense
                          ></v-select>
                        </div>
                      </CustomInputContainer>
                    </v-col>
                    <v-col cols="3">
                      <CustomInputContainer label="Terms">
                        <div slot="input">
                          <v-select
                            v-model="term"
                            :items="terms_menu"
                            item-text="name"
                            placeholder="Select Terms"
                            @change="onTermsChanged"
                            return-object
                            outlined
                            hide-details
                            dense
                            append-icon="fa-chevron-down"
                          ></v-select>
                        </div>
                      </CustomInputContainer>
                    </v-col>
                    <v-col cols="3">
                      <CustomInputContainer label="Bill Date">
                        <div slot="input">
                          <v-menu
                            v-model="date_menu"
                            :close-on-content-click="false"
                            transition="scale-transition"
                            offset-y
                            min-width="auto"
                          >
                            <template v-slot:activator="{ on, attrs }">
                              <v-text-field
                                v-model="new_bill.bill_date"
                                placeholder="Enter Bill Date."
                                outlined
                                dense
                                readonly
                                v-bind="attrs"
                                v-on="on"
                              />
                            </template>
                            <v-date-picker
                              v-model="new_bill.bill_date"
                              @input="
                                date_menu = false
                                onTermsChanged(term)
                              "
                            />
                          </v-menu>
                        </div>
                      </CustomInputContainer>
                    </v-col>
                    <v-col cols="3">
                      <CustomInputContainer label="Due Date">
                        <div slot="input">
                          <v-menu
                            v-model="due_date_menu"
                            :close-on-content-click="false"
                            transition="scale-transition"
                            offset-y
                            min-width="auto"
                          >
                            <template v-slot:activator="{ on, attrs }">
                              <v-text-field
                                v-model="new_bill.due_date"
                                placeholder="Enter Due Date."
                                outlined
                                dense
                                readonly
                                v-bind="attrs"
                                v-on="on"
                              />
                            </template>
                            <v-date-picker
                              v-model="new_bill.due_date"
                              @input="due_date_menu = false"
                            />
                          </v-menu>
                        </div>
                      </CustomInputContainer>
                    </v-col>
                  </v-row>
                  <v-row class="mb-0 py-0 my-0">
                    <v-col cols="4">
                      <CustomInputContainer label="Purchase Location">
                        <div slot="input">
                          <v-textarea
                            placeholder="Enter Purchase Location"
                            outlined
                            v-model="new_bill.purchase_location"
                            :rules="requiredRules"
                            required
                            dense
                          ></v-textarea>
                        </div>
                      </CustomInputContainer>
                    </v-col>
                    <!-- <v-col cols="4">
                      <CustomInputContainer label="Bill no.">
                        <div slot="input">
                          <v-text-field
                            v-model="new_bill.bill_no"
                            placeholder="Enter Bill no."
                            outlined
                            hide-details
                            dense
                          />
                        </div>
                      </CustomInputContainer>
                    </v-col> -->
                  </v-row>
                </v-col>
                <v-col cols="3"></v-col>
              </v-row>
              <!-- <v-row class="justify-end">
                <v-col cols="4">
                  <CustomInputContainer label="Amounts are">
                    <div slot="input">
                      <v-select
                        v-model="new_bill.amounts"
                        :items="all_amounts"
                        item-text="name"
                        item-value="_id"
                        placeholder="Exclusive of tax"
                        dense
                        outlined
                      ></v-select>
                    </div>
                  </CustomInputContainer>
                </v-col>
              </v-row> -->
            </div>
            <!-- category details -->
            <v-row>
              <v-col
                cols="12"
                class="invoice_journal mt-9 flex_row justify-space-between pb-0"
              >
                <span class="text--text font-weight-bold"
                  >Category Details</span
                >
                <!-- <v-btn
                                    class="short__btn px-2 justify-end"
                                    color="subtext"
                                    outlined
                                >
                                    <v-icon x-small class="mr-1" color="subtext">fa-pen</v-icon>
                                    Edit
                                </v-btn> -->
              </v-col>
              <v-col cols="12" class="">
                <v-simple-table dense class="dynamic_table">
                  <template v-slot:default>
                    <thead class="dynamic_table_thead">
                      <tr class="" style="height: 35px !important">
                        <th
                          v-for="item in expense_table_headers"
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
                    <tbody
                      v-for="(data, index) in totalExpenseCategories"
                      :key="index"
                    >
                      <tr
                        class="dynamic_table_body_rows"
                        style="border-bottom: 0.5 solid red !important"
                      >
                        <td class="py-2 text-center">
                          <v-select
                            class="rounded-lg"
                            solo
                            flat
                            v-model="totalExpenseCategories[index].category"
                            @change="amountChange()"
                            :items="accountLIst"
                            item-text="name"
                            item-value="_id"
                            required
                            hide-details
                            dense
                          />
                        </td>
                        <td class="py-2 text-center">
                          <v-text-field
                            class="rounded-lg"
                            v-model="totalExpenseCategories[index].description"
                            solo
                            flat
                            hide-details
                            dense
                          />
                        </td>
                        <td class="py-2 text-center">
                          <v-text-field
                            class="rounded-lg"
                            v-model="totalExpenseCategories[index].amount"
                            type="number"
                            solo
                            @change="amountChange()"
                            flat
                            required
                            hide-details
                            dense
                          />
                        </td>
                        <td class="py-2 text-center">
                          <v-select
                            class="rounded-lg"
                            type="number"
                            :items="taxCodes"
                            item-text="code"
                            return-object
                            @change="amountChange()"
                            v-model="totalExpenseCategories[index].tax"
                            solo
                            flat
                            hide-details
                            dense
                          />
                        </td>
                        <td class="py-2">
                          <v-btn
                            icon
                            color="error"
                            class="mx-3"
                            @click="deleteCategory(index)"
                            ><v-icon class="" color="error" x-small
                              >fa-light fa-trash-can</v-icon
                            ></v-btn
                          >
                        </td>
                      </tr>
                      <v-divider></v-divider>
                    </tbody>
                  </template>
                </v-simple-table>
              </v-col>
              <v-col cols="3">
                <div class="action__btn flex_row">
                  <v-btn class="small__btn" outlined color="subtext">
                    <v-icon x-small color="subtext" class="mr-2"
                      >fa-plus</v-icon
                    >
                    <span class="text--text" @click="addExpenseCategory()"
                      >Add Category</span
                    >
                  </v-btn>
                </div>
              </v-col>
            </v-row>
            <!-- Sub Total details -->
            <v-row>
              <v-spacer></v-spacer>
              <v-col cols="3">
                <div class="total__container">
                  <div class="flex_column">
                    <span class="text--text font-weight-bold mb-2"
                      >Sub Total</span
                    >

                    <span class="text--text font-weight-bold mb-2"
                      >VAT Amount</span
                    >
                    <span class="text--text font-weight-bold">Total</span>
                  </div>
                  <div class="flex_column">
                    <span class="text--text font-weight-bold mb-2"
                      >AED {{ expenseSubTotal }}</span
                    >

                    <span class="text--text font-weight-bold mb-2"
                      >AED {{ expenseVatAmount }}</span
                    >
                    <span class="text--text font-weight-bold"
                      >AED {{ expenseTotal }}</span
                    >
                  </div>
                </div>
              </v-col>
            </v-row>
            <!-- Journal Entry details -->
            <v-row class="mt-6">
              <v-col
                cols="12"
                class="invoice_journal mt-9 flex_row justify-space-between pb-0"
              >
                <span class="text--text font-weight-bold">Journal Entry</span>
              </v-col>
              <v-col cols="12" class="">
                <v-simple-table class="invoice_journal_table">
                  <template v-slot:default>
                    <thead class="invoice_journal_thead">
                      <tr class="" style="height: 35px !important">
                        <th
                          v-for="item in journal_entry_headers"
                          :key="item"
                          class="text-left text--text font-weight-bold journal_entry_headers"
                          style="
                            font-size: 12px !important;
                            font-weight: 500 !important;
                          "
                        >
                          {{ item }}
                        </th>
                      </tr>
                    </thead>
                    <tbody class="invoice_journal_tbody">
                      <tr
                        class="invoice_journal_rows"
                        v-for="(item, index) in journal_entry"
                        :key="index"
                        v-if="journal_entry.length > 0"
                      >
                        <td class="">{{ journal_entry_type }}</td>
                        <td class="">
                          {{
                            journal_entry[index].account &&
                            journal_entry[index].account.name
                          }}
                        </td>
                        <td class="" style="width: 150px">
                          {{ item.debit }}
                        </td>
                        <td class="" style="width: 150px">
                          {{ item.credit }}
                        </td>
                      </tr>
                      <tr class="invoice_journal_rows" v-else>
                        <td>Nothing to Show</td>
                      </tr>
                    </tbody>
                  </template>
                </v-simple-table>
              </v-col>
              <v-col cols="3">
                <!-- <div class="action__btn flex_row">
                                <v-btn
                                class="small__btn"
                                outlined
                                color="subtext"
                                >
                                <v-icon x-small color="subtext" class="mr-2"
                                    >fa-plus</v-icon
                                >
                                <span class="text--text">Add Line</span>
                                </v-btn>
                            </div> -->
              </v-col>
              <v-spacer></v-spacer>
            </v-row>
            <!-- billing address-->
            <v-row class="mt-9">
              <v-col cols="4">
                <CustomInputContainer label="Message on invoice">
                  <div slot="input">
                    <v-textarea
                      placeholder="Enter Message"
                      outlined
                      v-model="new_bill.memo"
                      dense
                      style="min-width: 23vw !important"
                    ></v-textarea>
                  </div>
                </CustomInputContainer>
              </v-col>
              <!-- <v-col cols="4">
                <CustomInputContainer label="Message on Statement">
                  <div slot="input">
                    <v-textarea
                      placeholder="Enter Message"
                      outlined
                      v-model="new_bill.message_statement"
                      dense
                      style="min-width: 23vw !important"
                    ></v-textarea>
                  </div>
                </CustomInputContainer>
              </v-col> -->
              <v-spacer></v-spacer>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="row1" v-if="expense_pop">
      <v-col cols="12">
        <v-card color="card_bg" id="card" style="min-height: 80vh !important">
          <v-card-title id="card-title">
            <h4>
              <v-icon
                color="black"
                dense
                class="mr-2"
                @click="expense_pop = false"
                >fa-arrow-left</v-icon
              >Add New Expense
            </h4>
            <v-btn
              class="tall__btn px-9"
              color="primary"
              min-width="150px"
              @click="save()"
            >
              SAVE
            </v-btn>
          </v-card-title>
          <v-divider id="divider" class="my-5"></v-divider>
          <v-card-text id="card-text">
            <v-row class="py-0 my-0 align-start" style="gap: 30px">
              <v-col cols="9" class="pa-0">
                <v-row class="mb-0 py-0 my-0">
                  <v-col cols="4">
                    <CustomInputContainer label="Company">
                      <div slot="input">
                        <v-autocomplete
                          placeholder="Select Company"
                          v-model="new_expense.company"
                          item-text="name"
                          item-value="id"
                          :items="companies"
                          outlined
                          hide-details
                          dense
                        ></v-autocomplete>
                      </div>
                    </CustomInputContainer>
                  </v-col>
                  <v-col cols="4">
                    <CustomInputContainer label="Payee">
                      <div slot="input">
                        <v-select
                          placeholder="Payee"
                          outlined
                          :items="supplierCustomers"
                          item-text="company_name"
                          item-value="_id"
                          v-model="new_expense.payee"
                          hide-details
                          dense
                        ></v-select>
                      </div>
                    </CustomInputContainer>
                  </v-col>
                  <v-col cols="4">
                    <CustomInputContainer label="Payment Account">
                      <div slot="input">
                        <v-select
                          placeholder="Payment Account"
                          :items="accountLIst"
                          v-model="new_expense.payment_account"
                          item-text="name"
                          item-value="_id"
                          outlined
                          hide-details
                          dense
                        ></v-select>
                      </div>
                    </CustomInputContainer>
                  </v-col>
                  <!-- <v-col cols="4">
                                        <CustomInputContainer label="Bill no.">
                                            <div slot="input">
                                                <v-text-field
                                                    placeholder="Enter Bill no."
                                                    outlined
                                                    hide-details
                                                    :v-model='computedBalance'
                                                    dense
                                                    disabled
                                                />
                                            </div>
                                        </CustomInputContainer>
                                    </v-col> -->
                </v-row>
                <v-row class="mb-0 py-0 my-0" align="end">
                  <v-col cols="4">
                    <CustomInputContainer label="Payment date">
                      <div slot="input">
                        <v-menu
                          v-model="menu1"
                          :close-on-content-click="false"
                          transition="scale-transition"
                          offset-y
                          min-width="auto"
                        >
                          <template v-slot:activator="{ on, attrs }">
                            <v-text-field
                              v-model="new_expense.payment_date"
                              placeholder="Payment date"
                              outlined
                              hide-details
                              dense
                              readonly
                              v-bind="attrs"
                              v-on="on"
                            />
                          </template>
                          <v-date-picker
                            v-model="new_expense.payment_date"
                            @input="menu1 = false"
                          />
                        </v-menu>
                      </div>
                    </CustomInputContainer>
                    <!-- <CustomInputContainer label="Purchase Location">
                                            <div slot="input">
                                            <v-select
                                                placeholder="Select Purchase Location"
                                                return-object
                                                outlined
                                                hide-details
                                                dense
                                            ></v-select>
                                            </div>
                                        </CustomInputContainer> -->
                  </v-col>
                  <v-col cols="4">
                    <CustomInputContainer label="Payment Method">
                      <div slot="input">
                        <v-select
                          placeholder="Payment Method"
                          :items="paymentMethodsForExpense"
                          outlined
                          v-model="new_expense.payment_methods"
                          hide-details
                          dense
                        ></v-select>
                      </div>
                    </CustomInputContainer>
                  </v-col>
                  <v-col cols="4">
                    <CustomInputContainer label="Ref No.">
                      <div slot="input">
                        <v-text-field
                          placeholder="Ref No."
                          outlined
                          hide-details
                          v-model="new_expense.reference"
                          dense
                        />
                      </div>
                    </CustomInputContainer>
                  </v-col>
                </v-row>
                <!-- <v-row class="mt-0  py-0 my-0" >
                                    <v-col cols="12"  class="mb-0 pb-0">
                                    <CustomInputContainer label="Mailing Address">
                                        <div slot="input">
                                            <v-textarea
                                            placeholder="Enter Mailing Address"
                                            outlined
                                            dense
                                            style="min-width: 23vw !important"
                                            ></v-textarea>
                                        </div>
                                    </CustomInputContainer>
                                    </v-col>
                                </v-row> -->
              </v-col>
              <v-col cols="3"></v-col>
            </v-row>
            <v-row>
              <v-col
                cols="12"
                class="invoice_journal mt-9 flex_row justify-space-between pb-0"
              >
                <span class="text--text font-weight-bold"
                  >Category Details</span
                >
                <!-- <v-btn
                                    class="short__btn px-2 justify-end"
                                    color="subtext"
                                    outlined
                                >
                                    <v-icon x-small class="mr-1" color="subtext">fa-pen</v-icon>
                                    Edit
                                </v-btn> -->
              </v-col>
              <v-col cols="12" class="">
                <v-simple-table dense class="dynamic_table">
                  <template v-slot:default>
                    <thead class="dynamic_table_thead">
                      <tr class="" style="height: 35px !important">
                        <th
                          v-for="item in expense_table_headers"
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
                    <tbody
                      v-for="(data, index) in totalExpenseCategories"
                      :key="index"
                    >
                      <tr
                        class="dynamic_table_body_rows"
                        style="border-bottom: 0.5 solid red !important"
                      >
                        <td class="py-2 text-center">
                          <v-select
                            class="rounded-lg"
                            solo
                            flat
                            v-model="totalExpenseCategories[index].category"
                            @change="amountChange()"
                            :items="accountLIst"
                            item-text="name"
                            item-value="_id"
                            dense
                          />
                        </td>
                        <td class="py-2 text-center">
                          <v-text-field
                            class="rounded-lg"
                            v-model="totalExpenseCategories[index].description"
                            solo
                            flat
                            hide-details
                            dense
                          />
                        </td>
                        <td class="py-2 text-center">
                          <v-text-field
                            class="rounded-lg"
                            v-model="totalExpenseCategories[index].amount"
                            type="number"
                            solo
                            @change="amountChange()"
                            flat
                            dense
                          />
                        </td>
                        <td class="py-2 text-center">
                          <v-select
                            class="rounded-lg"
                            type="number"
                            :items="taxCodes"
                            item-text="code"
                            return-object
                            @change="amountChange()"
                            v-model="totalExpenseCategories[index].tax"
                            solo
                            flat
                            dense
                          />
                        </td>
                        <td class="py-2">
                          <v-btn
                            icon
                            color="error"
                            class="mx-3"
                            @click="deleteCategory(index)"
                            ><v-icon class="" color="error" x-small
                              >fa-light fa-trash-can</v-icon
                            ></v-btn
                          >
                        </td>
                      </tr>
                      <v-divider></v-divider>
                    </tbody>
                  </template>
                </v-simple-table>
              </v-col>
              <v-col cols="3">
                <div class="action__btn flex_row">
                  <v-btn class="small__btn" outlined color="subtext">
                    <v-icon x-small color="subtext" class="mr-2"
                      >fa-plus</v-icon
                    >
                    <span class="text--text" @click="addExpenseCategory()"
                      >Add Category</span
                    >
                  </v-btn>
                </div>
              </v-col>
            </v-row>
            <v-row>
              <v-spacer></v-spacer>
              <v-col cols="3">
                <div class="total__container">
                  <div class="flex_column">
                    <span class="text--text font-weight-bold mb-2"
                      >Sub Total</span
                    >

                    <span class="text--text font-weight-bold mb-2"
                      >VAT Amount</span
                    >
                    <span class="text--text font-weight-bold">Total</span>
                  </div>
                  <div class="flex_column">
                    <span class="text--text font-weight-bold mb-2"
                      >AED {{ expenseSubTotal }}</span
                    >

                    <span class="text--text font-weight-bold mb-2"
                      >AED {{ expenseVatAmount }}</span
                    >
                    <span class="text--text font-weight-bold"
                      >AED {{ expenseTotal }}</span
                    >
                  </div>
                </div>
              </v-col>
            </v-row>
            <v-row class="mt-6">
              <v-col
                cols="12"
                class="invoice_journal mt-9 flex_row justify-space-between pb-0"
              >
                <span class="text--text font-weight-bold">Journal Entry</span>
              </v-col>
              <v-col cols="12" class="">
                <v-simple-table class="invoice_journal_table">
                  <template v-slot:default>
                    <thead class="invoice_journal_thead">
                      <tr class="" style="height: 35px !important">
                        <th
                          v-for="item in journal_entry_headers"
                          :key="item"
                          class="text-left text--text font-weight-bold journal_entry_headers"
                          style="
                            font-size: 12px !important;
                            font-weight: 500 !important;
                          "
                        >
                          {{ item }}
                        </th>
                      </tr>
                    </thead>
                    <tbody class="invoice_journal_tbody">
                      <tr
                        class="invoice_journal_rows"
                        v-for="(item, index) in journal_entry"
                        :key="index"
                        v-if="journal_entry.length > 0"
                      >
                        <td class="">Expense</td>
                        <td class="">
                          {{
                            journal_entry[index].account &&
                            journal_entry[index].account.name
                          }}
                        </td>
                        <td class="" style="width: 150px">
                          {{ item.debit }}
                        </td>
                        <td class="" style="width: 150px">
                          {{ item.credit }}
                        </td>
                      </tr>
                      <tr class="invoice_journal_rows" v-else>
                        <td>Nothing to Show</td>
                      </tr>
                    </tbody>
                  </template>
                </v-simple-table>
              </v-col>
              <v-col cols="3">
                <!-- <div class="action__btn flex_row">
                                <v-btn
                                class="small__btn"
                                outlined
                                color="subtext"
                                >
                                <v-icon x-small color="subtext" class="mr-2"
                                    >fa-plus</v-icon
                                >
                                <span class="text--text">Add Line</span>
                                </v-btn>
                            </div> -->
              </v-col>
              <v-spacer></v-spacer>
            </v-row>
            <v-row class="mt-9">
              <v-col cols="4">
                <CustomInputContainer label="Address">
                  <div slot="input">
                    <v-textarea
                      placeholder="Enter billing address"
                      outlined
                      v-model="new_expense.billing_address"
                      dense
                      style="min-width: 23vw !important"
                    ></v-textarea>
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="Address">
                  <div slot="input">
                    <v-textarea
                      placeholder="Enter shipping address"
                      outlined
                      v-model="new_expense.shipping_address"
                      dense
                      style="min-width: 23vw !important"
                    ></v-textarea>
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-spacer></v-spacer>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Add Supplier -->
    <v-row class="row1" v-if="supplier_pop == true">
      <v-col cols="12">
        <v-card color="card_bg" id="card" style="min-height: 80vh !important">
          <v-card-title id="card-title">
            <h4>Supplier Information</h4>
            <div class="d-flex" style="gap: 10px">
              <v-btn
                class="tall__btn px-9"
                color="primary"
                outlined
                min-width="150px"
                @click="handleCloseAddSupplier"
              >
                Cancel
              </v-btn>
              <v-btn
                class="tall__btn px-9"
                color="primary"
                min-width="150px"
                :disabled="handleDisabled"
                @click="handleOpenCloseAddSupplierPop"
              >
                Save
              </v-btn>
            </div>
          </v-card-title>
          <v-divider id="divider" class="my-5"></v-divider>
          <v-card-text id="card-text">
            <v-row class="py-0 my-0 align-start">
              <v-col cols="12" md="6" class="pa-0">
                <v-row class="mb-0 py-0 my-0">
                  <!-- <v-col cols="3">
                                    <CustomInputContainer label="Title">
                                        <div slot="input">
                                        <v-select
                                            item-text="customer_name"
                                            placeholder="Enter Title"
                                            return-object
                                            outlined
                                            hide-details
                                            dense
                                        ></v-select>
                                        </div>
                                    </CustomInputContainer>
                                    </v-col> -->
                  <v-col cols="6" md="4">
                    <CustomInputContainer label="First Name">
                      <div slot="input">
                        <v-text-field
                          placeholder="Enter First Name"
                          outlined
                          v-model="supplier.primary_contact.first_name"
                          hide-details
                          dense
                        />
                      </div>
                    </CustomInputContainer>
                  </v-col>
                  <v-col cols="6" md="4">
                    <CustomInputContainer label="Middle Name">
                      <div slot="input">
                        <v-text-field
                          placeholder="Enter Middle Name"
                          outlined
                          v-model="supplier.primary_contact.middle_name"
                          hide-details
                          dense
                        />
                      </div>
                    </CustomInputContainer>
                  </v-col>
                  <v-col cols="6" md="4">
                    <CustomInputContainer label="Last Name">
                      <div slot="input">
                        <v-text-field
                          placeholder="Enter Last Name"
                          outlined
                          hide-details
                          v-model="supplier.primary_contact.last_name"
                          dense
                        />
                      </div>
                    </CustomInputContainer>
                  </v-col>
                  <v-col cols="12" md="6">
                    <CustomInputContainer label="Supplier Name">
                      <div slot="input">
                        <v-text-field
                          placeholder="Supplier Name"
                          outlined
                          v-model="supplier.company_name"
                          hide-details
                          dense
                        />
                      </div>
                    </CustomInputContainer>
                  </v-col>
                  <v-col cols="12" md="6">
                    <CustomInputContainer label="Company">
                      <div slot="input">
                        <v-select
                          placeholder="Select Company"
                          v-model="supplier.company"
                          item-text="name"
                          item-value="id"
                          :items="companies"
                          outlined
                          hide-details
                          dense
                          append-icon="fa-chevron-down"
                        ></v-select>
                      </div>
                    </CustomInputContainer>
                  </v-col>
                  <v-col cols="12" md="6">
                    <CustomInputContainer label="Account No.">
                      <div slot="input">
                        <v-select
                          placeholder="Select Account No."
                          return-object
                          v-model="supplier.bank_account"
                          outlined
                          hide-details
                          :items="accountLIst"
                          item-text="name"
                          item-value="_id"
                          dense
                          append-icon="fa-chevron-down"
                        ></v-select>
                      </div>
                    </CustomInputContainer>
                  </v-col>
                  <v-col cols="12" md="6">
                    <CustomInputContainer label="Nickname">
                      <div slot="input">
                        <v-text-field
                          placeholder="Enter Nickname"
                          outlined
                          v-model="supplier.nick_name"
                          hide-details
                          dense
                        />
                      </div>
                    </CustomInputContainer>
                  </v-col>
                  <v-col cols="12" class="mb-0 pb-0">
                    <CustomInputContainer label="Address">
                      <div slot="input">
                        <v-textarea
                          placeholder="Enter address"
                          outlined
                          v-model="supplier.address"
                          dense
                          style="min-width: 23vw !important"
                        ></v-textarea>
                      </div>
                    </CustomInputContainer>
                  </v-col>
                </v-row>
              </v-col>
              <v-col cols="12" md="6" class="pa-0">
                <v-row class="mb py-0 my-0">
                  <v-col cols="6">
                    <CustomInputContainer label="Email">
                      <div slot="input">
                        <v-text-field
                          placeholder="Enter Email"
                          outlined
                          v-model="supplier.email"
                          hide-details
                          dense
                        />
                      </div>
                    </CustomInputContainer>
                  </v-col>
                  <v-col cols="6">
                    <CustomInputContainer label="Phone">
                      <div slot="input">
                        <v-text-field
                          placeholder="Enter Phone"
                          outlined
                          v-model="supplier.phone"
                          hide-details
                          dense
                        />
                      </div>
                    </CustomInputContainer>
                  </v-col>
                  <v-col cols="6">
                    <CustomInputContainer label="Mobile">
                      <div slot="input">
                        <v-text-field
                          placeholder="Enter Mobile"
                          outlined
                          hide-details
                          v-model="supplier.mobile"
                          dense
                        />
                      </div>
                    </CustomInputContainer>
                  </v-col>
                  <v-col cols="6">
                    <CustomInputContainer label="Fax">
                      <div slot="input">
                        <v-text-field
                          placeholder="Enter Fax"
                          outlined
                          v-model="supplier.fax"
                          hide-details
                          dense
                        />
                      </div>
                    </CustomInputContainer>
                  </v-col>
                  <v-col cols="6">
                    <CustomInputContainer label="Website URL">
                      <div slot="input">
                        <v-text-field
                          placeholder="http://"
                          outlined
                          v-model="supplier.website"
                          hide-details
                          dense
                        />
                      </div>
                    </CustomInputContainer>
                  </v-col>
                  <v-col cols="6">
                    <CustomInputContainer label="TRN">
                      <div slot="input">
                        <v-text-field
                          placeholder="TRN "
                          v-model="supplier.trn_number"
                          outlined
                          hide-details
                          dense
                        />
                      </div>
                    </CustomInputContainer>
                  </v-col>
                  <v-col cols="12">
                    <CustomInputContainer label="Note">
                      <div slot="input">
                        <v-textarea
                          placeholder="Enter note"
                          outlined
                          dense
                          style="min-width: 23vw !important"
                        ></v-textarea>
                      </div>
                    </CustomInputContainer>
                  </v-col>
                </v-row>
                <!-- <v-row class="mb py-0 my-0" >
                                    <v-col cols="12">
                                    <CustomInputContainer label="Default Expense Account">
                                        <div slot="input">
                                        <v-select
                                            placeholder="Choose Account"
                                            return-object
                                            outlined
                                            hide-details
                                            dense
                                        ></v-select>
                                        </div>
                                    </CustomInputContainer>
                                    </v-col>
                                </v-row> -->
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <!-- </v-row> -->

    <!-- DataTable + Invoice View -->
    <!-- v-if="pops==false" -->
    <v-row v-if="!supplier_pop && !bill_pop && !expense_pop">
      <!-- Total Card -->
      <!-- <TotalsCard :data="total_expenses" /> -->

      <!-- Top Searchbar + new in invoice view -->
      <v-row
        class="row1 top-row ma-0 pa-0"
        style="
          height: 70px !important;
          max-height: 70px !important;
          min-height: 70px !important;
        "
        v-if="invoice_view === true"
      >
        <v-col cols="3">
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
            rounded
            style="min-width: 300px"
          >
            <template slot="prepend-inner">
              <v-icon color="outlined" small>fa-search</v-icon>
            </template>
            <template slot="label">
              <span class="subtext--text mr-5">Search By</span>
            </template>
            <template slot="append">
              <v-select
                class="ma-0 pa-0"
                flat
                solo
                dense
                hide-details=""
                style="font-size: 12px !important"
                :items="['Invoice Number', 'Other']"
              >
                <template slot="label">
                  <span class="" style="font-size: 12px !important"
                    >Invoice Number</span
                  >
                </template>
              </v-select>
            </template>
          </v-text-field>
        </v-col>
        <v-spacer></v-spacer>
        <v-col cols="3">
          <div class="flex_row">
            <v-btn
              class="tall__btn mr-2 primary--text"
              color="primary"
              outlined
              @click="invoice_view = false"
              >Table View</v-btn
            >
            <v-menu transition="slide-y-transition" rounded="lg" offset-y>
              <template v-slot:activator="{ attrs, on }">
                <v-btn
                  class="tall__btn"
                  color="primary"
                  v-bind="attrs"
                  v-on="on"
                >
                  New
                  <LightArrow class="ml-2" style="max-width: 10px" />
                </v-btn>
              </template>
              <v-list>
                <v-list-item
                  v-for="(item, index) in new_transaction_menu"
                  :key="index"
                  link
                >
                  <v-list-item-title class="">
                    <span class="n_text text--text ml-2">{{ item.title }}</span>
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
        </v-col>
      </v-row>

      <!-- Table View -->
      <v-row class="row1" v-if="loading">
        <v-col sm="12" md="12" lg="12">
          <v-skeleton-loader
            height="100%"
            type="table-heading, table-thead, table-tbody, table-tfoot"
          >
          </v-skeleton-loader>
        </v-col>
      </v-row>
      <v-row class="row1" v-else>
        <v-col sm="12" md="12" lg="12">
          <!-- Table View -->
          <v-card color="card_bg" id="card" v-if="invoice_view === false">
            <v-card-text id="card-text" style="margin-top: 0 !important">
              <v-data-table
                id="ALL_EXPENSES"
                class="main__table elevation-0"
                v-model="expenses_data"
                :headers="expenses_headers"
                :items="expenses_data"
                :search="expenses_search"
                hide-default-footer
              >
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
                      @input="debounceAction"
                    >
                      <template slot="prepend-inner">
                        <v-icon color="outlined" small>fa-search</v-icon>
                      </template>
                      <template slot="label">
                        <span class="subtext--text mr-5">Search By</span>
                      </template>
                      <template slot="append">
                        <v-select
                          class="ma-0 pa-0"
                          flat
                          solo
                          dense
                          hide-details=""
                          style="font-size: 12px !important"
                          :items="['Invoice Number', 'Other']"
                        >
                          <template slot="label">
                            <span class="" style="font-size: 12px !important"
                              >Invoice Number</span
                            >
                          </template>
                        </v-select>
                      </template>
                    </v-text-field>
                    <div class="action__btn">
                      <!-- <v-btn
                        class="tall__btn mr-2 subtext--text"
                        color="subtext"
                        outlined
                        @click="invoice_view = true"
                        >Invoice View</v-btn
                      > -->
                      <v-menu
                        transition="slide-y-transition"
                        rounded="lg"
                        offset-y
                      >
                        <template v-slot:activator="{ attrs, on }">
                          <v-btn
                            class="tall__btn"
                            color="primary"
                            v-bind="attrs"
                            v-on="on"
                          >
                            New
                            <LightArrow class="ml-2" style="max-width: 10px" />
                          </v-btn>
                        </template>
                        <v-list>
                          <v-list-item
                            v-for="(item, index) in new_transaction_menu"
                            :key="index"
                            link
                          >
                            <v-list-item-title
                              @click="handleOpenNewTransaction(item.value)"
                            >
                              <span class="n_text text--text ml-2">{{
                                item.title
                              }}</span>
                            </v-list-item-title>
                          </v-list-item>
                        </v-list>
                      </v-menu>
                      <v-btn
                        class="tall__btn ml-2 subtext--text"
                        color="subtext"
                        outlined
                        @click="handlePrint"
                      >
                        <v-icon class="mr-2" small>fa-print</v-icon>
                        Print
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
                <template v-slot:item="{ item, index }">
                  <tr style="">
                    <td class="pa-0 ma-0">
                      <div
                        class="flex_row align-center justify-center"
                        :style="{ borderLeft: '4px solid' + item.color }"
                      >
                        <v-checkbox
                          color="info"
                          on-icon="fa-light fa-square-check"
                          off-icon="fa-regular fa-square"
                          class="mx-auto mb-2"
                          dense
                          hide-details
                          v-model="selected"
                        ></v-checkbox>
                      </div>
                    </td>
                    <td class="pa-0 ma-0">{{ item.expense_number }}</td>
                    <td class="pa-0 ma-0">{{ item.payment_date }}</td>
                    <!-- <td class="pa-0 ma-0">{{ item.type }}</td> -->
                    <td class="pa-0 ma-0">{{ index }}</td>
                    <td class="pa-0 ma-0">{{ item.payeeInfo.name }}</td>
                    <!-- <td class="pa-0 ma-0">{{ item.category }}</td> -->
                    <!-- <td class="pa-0 ma-0">{{ item.memo }}</td> -->
                    <td class="pa-0 ma-0">{{ item.sub_total }}</td>
                    <td class="pa-0 ma-0">{{ item.vat_total }}</td>
                    <td class="pa-0 ma-0">{{ item.total }}</td>
                    <!-- <td class="pa-0 ma-0" style="width: 30px;">
                                <div class="actions__con">
                                    <span class="print primary--text">Print</span>
                                    <v-btn color="subtext" icon><v-icon small>fa-solid fa-ellipsis-vertical</v-icon></v-btn>
                                </div>
                                </td> -->
                  </tr>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>

          <!-- Invoice View -->
          <v-card
            color="card_bg"
            class="main_card"
            style="padding: 0 !important"
            v-if="invoice_view === true"
          >
            <v-row>
              <v-col cols="3" class="invoice_list__col">
                <div class="invoice_list__con">
                  <div class="flex_row">
                    <h4>Expense List</h4>
                    <v-btn class="short__btn px-2" color="text" outlined>
                      <v-icon x-small class="mr-1" color="subtext"
                        >fa-filter</v-icon
                      >
                      Filter
                    </v-btn>
                  </div>
                  <div>
                    <v-list class="invoice_list_boxes_con">
                      <v-list-item
                        link
                        class="invoice_box"
                        style="min-height: fit-content"
                      >
                        <div
                          class="pa-0 ma-0"
                          style="display: flex; flex-direction: column"
                        >
                          <v-checkbox
                            label="TYPE"
                            dense
                            color="primary"
                            class=""
                            hide-details=""
                          />
                          <span class="font-weight-bold text--text"
                            >Business Expense</span
                          >
                        </div>
                        <div
                          class="pa-0 ma-0 mt-5"
                          style="display: flex; flex-direction: column"
                        >
                          <span class="caption">DATE DUE</span>
                          <span class="font-weight-bold text--text"
                            >12-07-2022</span
                          >
                        </div>
                      </v-list-item>
                      <v-list-item
                        link
                        class="invoice_box"
                        style="min-height: fit-content"
                      >
                        <div
                          class="pa-0 ma-0"
                          style="display: flex; flex-direction: column"
                        >
                          <v-checkbox
                            label="TYPE"
                            dense
                            color="primary"
                            class=""
                            hide-details=""
                          />
                          <span class="font-weight-bold text--text"
                            >Business Expense</span
                          >
                        </div>
                        <div
                          class="pa-0 ma-0 mt-5"
                          style="display: flex; flex-direction: column"
                        >
                          <span class="caption">DATE DUE</span>
                          <span class="font-weight-bold text--text"
                            >12-07-2022</span
                          >
                        </div>
                      </v-list-item>
                      <v-list-item
                        link
                        class="invoice_box"
                        style="min-height: fit-content"
                      >
                        <div
                          class="pa-0 ma-0"
                          style="display: flex; flex-direction: column"
                        >
                          <v-checkbox
                            label="TYPE"
                            dense
                            color="primary"
                            class=""
                            hide-details=""
                          />
                          <span class="font-weight-bold text--text"
                            >Business Expense</span
                          >
                        </div>
                        <div
                          class="pa-0 ma-0 mt-5"
                          style="display: flex; flex-direction: column"
                        >
                          <span class="caption">DATE DUE</span>
                          <span class="font-weight-bold text--text"
                            >12-07-2022</span
                          >
                        </div>
                      </v-list-item>
                    </v-list>
                    <div class="invoice_box">
                      <div class="invoice_box_top">
                        <v-checkbox
                          label="TYPE"
                          dense
                          color="primary"
                          class=""
                        />
                        <span class="font-weight-bold text--text"
                          >Business Expense</span
                        >
                      </div>
                      <div class="invoice_box_bottom">
                        <span class="caption">DATE DUE</span>
                        <span class="font-weight-bold text--text"
                          >12-07-2022</span
                        >
                      </div>
                    </div>
                  </div>
                </div>
              </v-col>
              <v-col cols="5" class="invoice_pdf__col">
                <div class="invoice_pdf__con">
                  <h1>Autogenerated Invoice</h1>
                  <div class="flex_row">
                    <v-btn
                      class="short__btn mr-3 px-2"
                      dark
                      color="text"
                      outlined
                    >
                      Customize
                    </v-btn>
                    <v-btn
                      class="tall__btn mr-3 px-2"
                      dark
                      color="text"
                      outlined
                    >
                      Download
                    </v-btn>
                    <v-btn
                      class="short__btn mr-3 px-2"
                      dark
                      color="text"
                      outlined
                    >
                      <v-icon x-small class="mr-1" color="subtext"
                        >fa-print</v-icon
                      >
                      Print
                    </v-btn>
                  </div>
                </div>
                <v-img src="/invoice_sample.png" />
              </v-col>
              <v-col cols="4" class="details__col">
                <div class="details__div">
                  <h4 class="details__title">Details</h4>
                  <div class="details__con">
                    <div class="single_details">
                      <span>Payee</span>
                      <span class="font-weight-bold">Payee</span>
                    </div>
                    <div class="single_details">
                      <span>Payee</span>
                      <span class="font-weight-bold">Payee</span>
                    </div>
                    <div class="single_details">
                      <span>Payee</span>
                      <span class="font-weight-bold">Payee</span>
                    </div>
                    <div class="single_details">
                      <span>Payee</span>
                      <span class="font-weight-bold">Payee</span>
                    </div>
                    <div class="single_details">
                      <span>Payee</span>
                      <span class="font-weight-bold">Payee</span>
                    </div>
                    <div class="single_details">
                      <span>Payee</span>
                      <span class="font-weight-bold">Payee</span>
                    </div>
                    <div class="single_details">
                      <span>Payee</span>
                      <span class="font-weight-bold">Payee</span>
                    </div>
                    <div class="single_details">
                      <span>Payee</span>
                      <span class="font-weight-bold">Payee</span>
                    </div>
                  </div>
                </div>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>
    </v-row>
  </v-form>
</template>

<script>
import { mapState } from 'vuex'
import '@/assets/scss/_expenses.scss'
import TotalsCard from '@/components/Cards/TotalsCard/index.vue'
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'
import LightArrow from '@/assets/images/Light-Arrow-icon.svg'
import moment from 'moment'
export default {
  components: { TotalsCard, CustomInputContainer, LightArrow },
  props: [
    'companies',
    'accountLIst',
    'supplierCustomers',
    'taxCodes',
    'vatCodes',
  ],
  data() {
    return {
      valid: true,
      journal_entry_headers: ['Type', 'Account Name', 'Debit', 'Credit'],
      journal_entry: [],
      expenseSubTotal: 0,
      expenseVatAmount: 0,
      expenseTotal: 0,
      new_expense: {},
      new_bill: {},
      suppliers_data: [],
      due_date_menu: false,
      date_menu: false,
      totalExpenseCategories: [
        {
          category: '',
          description: '',
          amount: 0,
          tax: {},
        },
      ],
      paymentMethodsForExpense: [
        'Cash',
        'Cheque',
        'Credit Card',
        'Direct Debit',
      ],
      menu1: '',
      requiredRules: [(v) => !!v || 'This field is required'],
      term: '',
      terms_menu: [],
      // all_amounts: [],
      payment_date: '',
      supplier: {
        company_name: '',
        primary_contact: {
          first_name: '',
          middle_name: '',
          last_name: '',
        },
        bank_account: '',
        nick_name: '',
        email: '',
        phone: '',
        website: '',
        mobile: '',
        fax: '',
        address: '',
        documents: [],
        company: '',
        trn_number: '',
      },
      companiesSelected: '',
      // DYNAMIC TABLE DATA
      dynamic_table_headers: [
        'Category',
        'Description',
        'Tax',
        'Amount',
        'Action',
      ],
      dynamic_table_headers2: [
        'No.',
        'Product/Service',
        'Description',
        'QTY',
        'Rate',
        'Amount',
        'Tax',
        'Action',
      ],

      // DYNAMIC TABLE DATA Expense
      expense_table_headers: [
        'Category',
        'Description',
        'Amount',
        'Tax',
        'Action',
      ],
      expense_table_headers2: [
        'Product/Service',
        'Description',
        'QTY',
        'Rate',
        'Amount',
        'Tax',
        'Action',
      ],

      pops: false,
      supplier_pop: false,
      bill_pop: false,
      expense_pop: false,
      loading: false,
      new_transaction_menu: [
        { title: 'Bill', value: 'bill' },
        // { title: 'Add Supplier', value: 'supplier' },
        { title: 'Expense', value: 'expense' },
      ],
      search: '',
      selected: '',
      // INVOICE VIEW
      invoice_view: false,
      expenses_search: '',
      expenses_selected: [],
      expenses_data: [
        {
          id: 0,
          date: '12-07-2022',
          type: 'Business Expense',
          no: '4431',
          payee: 'Payee',
          category: 'Bank',
          payeeInfo: {},
          tax: 'Exempt -0%',
          total: '1050',
          color: '#1AD598',
          memo: 'Opening Balance',
          total_before_tax: '1105.00',
          action: '',
        },
      ],
      expenses_headers: [
        { text: ' ', value: '_id' },
        { text: 'Expense Number', value: 'expense_number' },
        { text: 'Date', value: 'date' },
        // { text: 'Type', value: 'type' },
        { text: 'No.', value: 'no' },
        { text: 'Payee', value: 'payee' },
        // { text: 'Category', value: 'category' },
        // { text: 'Memo', value: 'memo' },
        { text: 'Total Before Tax', value: 'total_before_tax' },
        { text: 'Tax', value: 'tax' },
        { text: 'Total Amount', value: 'total' },
        // { text: 'Action', value: 'action', sortable: false },
      ],
      total_expenses: [
        { name: 'Total Expenses (10)', amount: '109,186' },
        { name: 'Approved Expenses (10)', amount: '540,500' },
        { name: 'Paid Expenses (5)', amount: '3,27,970.0' },
        { name: 'New expense this week (15)', amount: '540,500' },
      ],
    }
  },
  mounted() {
    this.fetchExpensense('')
    this.retrieveTerm()
    this.setDates()
    this.fetchSuppliers()
  },
  methods: {
    closeBillDialog() {
      this.bill_pop = false
      this.totalExpenseCategories = []
      this.journal_entry = []
    },
    async fetchSuppliers() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios
        .$post(
          'supplier/all?search=&limit=100&page=0',
          { company: this.companySelection.map((item) => item.id) },
          {
            headers: { Authorization: AuthStr },
          }
        )
        .then((res) => {
          console.log('suppliers',res.data.suppliers);
          this.suppliers_data = res.data.suppliers.map((item) => {
            return item.company_name
          })
        })
        .catch((err) => {
          this.snackbar_data = {
            snackbar: true,
            text: 'Failed to load Suppliers.',
            color: 'danger',
            icon: 'check',
            timeout: 2000,
          }
        })
    },
    async retrieveTerm() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios
        .$post(
          'term/all',
          {},
          {
            headers: { Authorization: AuthStr },
          }
        )
        .then((res) => {
          this.terms_menu = res.data.terms
          this.term = res.data.terms.filter(
            (item) => item.name === 'Due on Receipt'
          )[0]
        })
        .catch((err) => {
          this.snackbar_data = {
            snackbar: true,
            text: 'Failed to Retrieve Terms',
            color: 'danger',
            icon: 'check',
            timeout: 2000,
          }
        })
    },
    setDates() {
      this.new_bill.bill_date = new Date().toISOString().substr(0, 10)
      this.new_bill.due_date = new Date().toISOString().substr(0, 10)
    },
    onTermsChanged(value) {
      const bill_date = this.new_bill.bill_date
      switch (value.name) {
        case 'Net 15':
          this.new_bill.due_date = new Date(moment(bill_date).add(15, 'days'))
            .toISOString()
            .substr(0, 10)
          break
        case 'Net 30':
          this.new_bill.due_date = new Date(moment(bill_date).add(30, 'days'))
            .toISOString()
            .substr(0, 10)
          break
        case 'Net 45':
          this.new_bill.due_date = new Date(moment(bill_date).add(45, 'days'))
            .toISOString()
            .substr(0, 10)
          break
        case 'Net 60':
          this.new_bill.due_date = new Date(moment(bill_date).add(60, 'days'))
            .toISOString()
            .substr(0, 10)
          break
        case 'Due end of next month':
          this.new_bill.due_date = new Date(
            moment(bill_date).add(1, 'months').endOf('month')
          )
            .toISOString()
            .substr(0, 10)
          break
        case 'Due end of the month':
          this.new_bill.due_date = new Date(moment(bill_date).endOf('month'))
            .toISOString()
            .substr(0, 10)
          break
        case 'Due on Receipt':
          this.new_bill.due_date = this.new_bill.date
          break
        default:
          value.days !== null
            ? (this.new_bill.due_date = this.new_bill.due_date =
                new Date(moment(bill_date).add(value.days, 'days'))
                  .toISOString()
                  .substr(0, 10))
            : (this.new_bill.due_date = this.new_bill.date)

          break
      }
    },
    termHandler(term) {
      this.getTerms()
      this.dialog = false
    },
    async debounceAction() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios
        .$post(
          `/expense/all?search=${e}&limit=40&page=0`,
          { company: this.companySelection.map((item) => item.id) },
          { headers: { Authorization: AuthStr } }
        )
        .then(async (res) => {
          const expenses_data = res.data.expenses
          this.expenses_data = expenses_data
        })
    },

    async fetchExpensense(search) {
      this.loading = true
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios
        .$post(
          `/expense/all?search=${search}&limit=40&page=0`,
          { company: this.companySelection.map((item) => item.id) },
          { headers: { Authorization: AuthStr } }
        )
        .then(async (res) => {
          this.loading = false
          const expenses_data = res.data.expenses
          this.expenses_data = expenses_data
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
    async save() {
      let newObj = {
        payee: this.new_expense.payee,
        payment_account: this.new_expense.payment_account,
        payment_date: this.new_expense.payment_date,
        reference: this.new_expense.reference,
        payment_methods: this.new_expense.payment_methods,
        payment_location: 'Dubai',
        items: [],
        journal_entry: [],
        sub_total: this.expenseSubTotal,
        vat_total: this.expenseVatAmount,
        total: this.expenseTotal,
        memo: '',
        documents: [],
        company: this.new_expense.company,
        billing_address: this.new_expense.billing_address,
        shipping_address: this.new_expense.shipping_address,
      }
      for (let index = 0; index < this.totalExpenseCategories.length; index++) {
        const element = this.totalExpenseCategories[index]
        newObj.items.push({
          category: element.category,
          description: element.description,
          amount: element.amount,
          tax_code: element.tax.code,
          tax_percentage: element.tax.rate,
          class: '',
          customer: this.new_expense.payee,
        })
      }
      for (let i = 0; i < this.journal_entry.length - 1; i++) {
        const jelement = this.journal_entry[i]
        newObj.journal_entry.push({
          account: jelement.account._id,
          customer: this.new_expense.payee,
          isDebit: jelement.debit > 0 ? true : false,
          isCredit: jelement.credit > 0 ? true : false,
          amount: jelement.credit > 0 ? jelement.credit : jelement.debit,
        })
      }
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios
        .$post(`expense`, newObj, {
          headers: { Authorization: AuthStr },
        })
        .then(async (res) => {
          this.expense_pop = false
          this.fetchExpensense('')
        })
        .catch((err) => {
          this.snackbar_data = {
            snackbar: true,
            text: 'Something Went Wrong',
            color: 'danger',
            icon: 'check',
            timeout: 2000,
          }
        })
    },
    deleteCategory(index) {
      this.totalExpenseCategories.splice(index, 1)
      this.amountChange()
    },
    addExpenseCategory() {
      this.totalExpenseCategories.push({
        category: '',
        description: '',
        amount: 0,
        tax: {},
      })
    },
    handleCloseAddSupplier() {
      this.supplier_pop = false
    },
    async createBill() {
      if (this.$refs.form.validate()) {
        let newObj = {
          supplier: this.new_bill.supplier,
          bill_date: this.new_bill.bill_date,
          mailing_address: this.new_bill.purchase_location,
          payment_date: this.new_bill.bill_date,
          due_date: this.new_bill.due_date,
          terms: this.term._id,
          terms_name: this.term.name,
          items: [],
          journal_entry: [],
          sub_total: this.expenseSubTotal,
          vat_total: this.expenseVatAmount,
          total: this.expenseTotal,
          memo: this.new_bill.memo,
          documents: [],
          company: this.companySelection.map((item) => item.id)
        }
        for (
          let index = 0;
          index < this.totalExpenseCategories.length;
          index++
        ) {
          const element = this.totalExpenseCategories[index]
          newObj.items.push({
            category: element.category,
            description: element.description,
            amount: element.amount,
            tax_code: element.tax.code,
            tax_percentage: element.tax.rate,
            class: '',
            customer: this.new_expense.payee,
          })
        }
        for (let i = 0; i < this.journal_entry.length - 1; i++) {
          const jelement = this.journal_entry[i]
          newObj.journal_entry.push({
            account: jelement.account._id,
            customer: this.new_expense.payee,
            isDebit: jelement.debit > 0 ? true : false,
            isCredit: jelement.credit > 0 ? true : false,
            amount: jelement.credit > 0 ? jelement.credit : jelement.debit,
          })
        }
        const AuthStr = 'Bearer '.concat(this.$store.state.token)
        await this.$axios
          .$post(`bill`, newObj, {
            headers: { Authorization: AuthStr },
          })
          .then(async (res) => {
            this.bill_pop = false
          })
          .catch((err) => {
            this.snackbar_data = {
              snackbar: true,
              text: 'Something Went Wrong',
              color: 'danger',
              icon: 'check',
              timeout: 2000,
            }
          })
      }
    },
    async handleOpenCloseAddSupplierPop() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios
        .$post(
          `/supplier`,
          { ...this.supplier, bank_account: this.supplier.bank_account._id },
          {
            headers: { Authorization: AuthStr },
          }
        )
        .then(async (res) => {
          this.$nuxt.$emit('supplierAddFormSubmitted', true)
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
    handleOpenNewTransaction(value) {
      console.log(value)
      if (value === 'bill') {
        this.pops = true
        this.bill_pop = true
      } else if (value === 'supplier') {
        this.pops = true
        this.supplier_pop = true
      } else if (value === 'expense') {
        this.pops = true
        this.expense_pop = true
      }
    },
    handlePrint() {
      window.print()
    },
    amountChange() {
      this.journal_entry = []
      this.expenseSubTotal = 0
      this.expenseVatAmount = 0
      this.expenseTotal = 0
      if (
        this.totalExpenseCategories &&
        this.totalExpenseCategories.length > 0
      ) {
        for (
          let index = 0;
          index < this.totalExpenseCategories.length;
          index++
        ) {
          const element = this.totalExpenseCategories[index]
          this.expenseSubTotal += Number(element.amount)
          this.journal_entry.push({
            type: 'Expense',
            account: {
              name: this.accountLIst.filter(
                (item) => item._id == element.category
              )[0].name,
              _id: element.category,
            },
            debit: Number(element.amount),
            credit: 0,
          })
          if (element.tax.rate) {
            this.expenseVatAmount +=
              (element.tax.rate / 100) * Number(element.amount)
            this.expenseTotal = +(this.expenseVatAmount + this.expenseSubTotal)
          } else {
            this.expenseTotal = +this.expenseSubTotal
          }
        }

        if (this.expenseVatAmount > 0) {
          this.journal_entry.push({
            type: 'Expense',
            account: {
              name: this.vatCodes.name,
              _id: this.vatCodes.id,
            },
            debit: this.expenseVatAmount,
            credit: 0,
          })
        }
        if (this.new_expense.payment_account) {
          let acc = this.accountLIst.filter(
            (a) => a._id == this.new_expense.payment_account
          )[0]
          this.journal_entry.push({
            type: 'Expense',
            account: {
              name: acc.name,
              _id: acc._id,
            },
            debit: 0,
            credit: this.expenseTotal,
          })
        }
      }
    },
    // handleInvoiceView() {
    //     this.invoice_view = true
    // },
  },
  computed: {
    ...mapState(['companySelection']),
    journal_entry_type() {
      return this.bill_pop ? 'Bill' : 'Expense'
    },
    handleDisabled() {
      return (
        !this.supplier.company_name ||
        !this.supplier.bank_account ||
        !this.supplier.company ||
        !this.supplier.primary_contact.first_name ||
        !this.supplier.primary_contact.last_name
      )
    },
  },
}
</script>

<style lang="scss">
.mid_sec {
  /* padding: 0 !important; */
  /* background: #E2E7F1 !important; */
}

.total__container {
  background: #e2e7f180;
  border-radius: 12px;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  padding: 20px;
  // width: 400px;
  height: 150px;
}

// dynamic table (add/edit)
.dynamic_table {
  .dynamic_table_thead {
    tr {
      background: #e2e7f180 !important;
    }
  }

  .dynamic_table_tbody {
    .dynamic_table_body_rows {
      // border-bottom: 0.5 solid red !important;
      &:hover {
        background: #e2e7f142 !important;
      }
    }
  }
}
</style>
