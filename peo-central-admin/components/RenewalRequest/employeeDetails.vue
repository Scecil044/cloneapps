<template>
  <v-card color="card_bg" id="card">
    <!-- Employee Details -->
    <v-data-table
      class="main__table elevation-0 customDataTabel th_customer mb-5"
      :headers="leadHeaders"
      :items="leadDetails"
      :footer-props="{ 'items-per-page-options': [10, 20] }"
      hide-default-footer
      default-sort="false"
    >
      <template v-slot:header.title="{ header }">
        <div class="d-flex align-center pa-0">
          <!-- <div> <InfoSVG/>  </div> -->
          <div>
            <th class="pl-2">
              <v-icon color="primary" class="mr-1" style="font-size: 16px"
                >fa-circle-info</v-icon
              >
              {{ header.text }}
            </th>
          </div>
        </div>
      </template>

      <template v-slot:item="{ item, index }">
        <tr>
          <td class="pr-0" style="width: 215px !important">
            {{ item.title }}
          </td>
          <td class="d-flex align-center">
            <div style="position: relative !important">
              <v-avatar
                class="mr-2"
                size="30px"
                style="position: absolute !important"
              >
                <v-img alt="Avatar" :src="'/1.jpg'" v-if="index === 0" />
              </v-avatar>
              <span v-if="index === 0" class="ml-9">
                <a :href="item.description">{{ item.description }}</a>
              </span>
              <span class="span_data" v-else>{{ item.description }}</span>
              <span class="span_data" style="color: #f3654a">{{
                item.contact
              }}</span>
            </div>
          </td>
          <td class=""></td>
        </tr>
      </template>
    </v-data-table>
    <!-- Visa Details -->
    <div class="d-flex flex-column" v-if="visaTable">
      <v-btn
        class="ml-1 pl-3 pr-3 align-self-end"
        color="primary"
        outlined
        :height="30"
        style="border: solid 1px #e2e7f1 !important"
      >
        <span class="pl-1">Edit</span>
      </v-btn>
      <v-data-table
        class="main__table elevation-0 customDataTabel th_customer mb-5"
        :headers="visaHeaders"
        :items="visaDetails"
        :footer-props="{ 'items-per-page-options': [10, 20] }"
        hide-default-footer
        default-sort="false"
      >
        <template v-slot:header.title="{ header }">
          <div class="d-flex align-center pa-0">
            <!-- <div> <InfoSVG/>  </div> -->
            <div>
              <th class="pl-2">
                <v-icon color="primary" class="mr-1" style="font-size: 16px"
                  >fa-circle-info</v-icon
                >
                {{ header.text }}
              </th>
            </div>
          </div>
        </template>

        <template v-slot:item="{ item, index }">
          <tr>
            <td class="pr-0" style="width: 215px !important">
              {{ item.title }}
            </td>
            <td class="d-flex align-center">
              <div style="position: relative !important">
                <span class="span_data">{{ item.description }}</span>
              </div>
            </td>
            <td class=""></td>
          </tr>
        </template>
      </v-data-table>
      <v-data-table
        class="main__table elevation-0 customDataTabel th_customer mb-5 document-table"
        :headers="documentHeaders"
        :items="documentDetails"
        :footer-props="{ 'items-per-page-options': [10, 20] }"
        hide-default-footer
        default-sort="false"
      >
        <template v-slot:item="{ item, index }">
          <tr>
            <td class="pr-0">
              <v-icon color="red" class="mr-3" small>fa-file-pdf</v-icon>
              {{ item.document }}
            </td>
            <td>
              {{ item.uploaded_on }}
            </td>
            <td class="pa-0 ma-0">
              <v-icon color="red" class="mr-3" small>fa-trash-can</v-icon>
              <v-icon color="primary" small>fa-file-arrow-down</v-icon>
            </td>
          </tr>
        </template>
      </v-data-table>
    </div>
  </v-card>
</template>

<script>
export default {
  props: {visaTable: Boolean},
  data() {
    return {
      leadHeaders: [
        {
          text: 'EMPLOYEE DETAILS',
          value: 'title',
          align: 'center',
          hideSortIcon: true,
          sortable: false,
        },
      ],
      leadDetails: [
        {
          title: 'Customer / Employer',
          description: 'Binance',
        },
        {
          title: 'First Name',
          description: 'Sam',
        },
        {
          title: 'Middle Name',
          description: '-',
        },
        {
          title: 'Last Name',
          description: '-',
        },
        {
          title: 'Visa Expiry',
          description: '31-December-2023',
          contact: '(29 Days)',
        },
      ],
      visaHeaders: [
        {
          text: 'VISA DETAILS',
          value: 'title',
          align: 'center',
          hideSortIcon: true,
          sortable: false,
        },
      ],
      visaDetails: [
        {
          title: 'Current status',
          description: 'Inside Country',
        },
        {
          title: 'Visa Type',
          description: 'Unskilled Visa',
        },
        {
          title: 'Salary Status',
          description: 'Changed',
        },
      ],
      documentHeaders: [
        {
          text: 'Document',
          value: 'document',
          hideSortIcon: true,
          sortable: false,
        },
        {
          text: 'Uploaded on',
          value: 'uploaded_on',
          hideSortIcon: true,
          sortable: false,
        },
        {
          text: 'Action',
          value: 'action',
          hideSortIcon: true,
          sortable: false,
        },
      ],
      documentDetails: [
        {
          document: 'Increment letter',
          uploaded_on: '01 Jan 2023',
        },
      ],
    }
  },
}
</script>
