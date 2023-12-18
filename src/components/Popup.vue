<script setup>
import { ref } from 'vue'

const props = defineProps({
  url: String
})

const open = ref(false)
let case_num = ref('');
let date = ref('');
let time = ref('');
let code = ref('');
let incident = ref('');
let police_grid = ref('');
let neigh_num = ref('');
let block = ref('');
let form_error = ref(false);
let newReport = [];

function sendNewCrimeReport() {
    if (case_num.value == '' || 
    date.value == '' || 
    time.value == '' || 
    code.value == '' || 
    incident.value == '' || 
    police_grid.value == '' || 
    neigh_num.value == '' || 
    block.value == '') {
        form_error.value = true;
    } 
    else {
        form_error.value = false;
        newReport.push(case_num.value);
        newReport.push(date.value);
        newReport.push(time.value);
        newReport.push(code.value);
        newReport.push(incident.value);
        newReport.push(police_grid.value);
        newReport.push(neigh_num.value);
        newReport.push(block.value);

        let report = '{"case_number":"' 
        + newReport[0] + '","date":"' 
        + newReport[1] + '","time":"' 
        + newReport[2] + '","code":' 
        + newReport[3] + ',"incident":"'
        + newReport[4] + '","police_grid":' 
        + newReport[5] + ',"neighborhood_number":' 
        + newReport[6] + ',"block":"' 
        + newReport[7] + '"}';

        console.log(props.url);
        let crime_url = props.url + '/new-incident';
        let jsonString = JSON.parse(report);
        jsonString = JSON.stringify(jsonString);
        console.log(jsonString);
        const options = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: jsonString
        };

        fetch(crime_url, options)
        .then(response => {
            if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
            }
            return response.text();
        })
        .then(updatedData => {
            console.log('Data updated:', updatedData);
            case_num.value = '';
            date.value = '';
            time.value = '';
            code.value = '';
            incident.value = '';
            police_grid.value = '';
            neigh_num.value = '';
            block.value = '';
        })
        .catch(error => {
            console.error('Error updating data:', error);
        });

    }
}
</script>

<template>
  <button class="button" @click="open = true">New Crime Report</button>

  <div v-if="open" class="modal">
    <div class="grid-container">
        <div class="grid-x grid-padding-x align-center-middle text-center">
            <div class="cell auto">
                <p>Enter New Crime Report</p>
            </div>
            <button  @click="open = false" style="padding-right: 1rem;">&#10006</button>
            
        </div>
        <div class="grid-x grid-padding-x align-center-middle">
            <div class="grid-x grid-padding-x align-center-middle">
                <div class="cell auto">
                    <label for="case_num">Case Number:</label>
                    <input placeholder="12345678" v-model="case_num">
                </div>
                <div class="cell auto">
                    <label for="date">Date:</label>
                    <input placeholder="XXXX-XX-XX" v-model="date">
                </div>
            </div>
            <div class="grid-x grid-padding-x align-center-middle">
                <div class="cell auto">
                    <label for="time">Time:</label>
                    <input placeholder="00:00:00" v-model="time">
                </div>
                <div class="cell auto">
                    <label for="code">Code:</label>
                    <input placeholder="000" v-model="code">
                </div>
            </div>
            <div class="grid-x grid-padding-x align-center-middle">
                <div class="cell auto">
                    <label for="inc">Incident:</label>
                    <input placeholder="Murder" v-model="incident">
                </div>
                <div class="cell auto">
                    <label for="grid">Police Grid:</label>
                    <input placeholder="182" v-model="police_grid">
                </div>
            </div>
            <div class="grid-x grid-padding-x align-center-middle">
                <div class="cell auto">
                    <label for="neigh_num">Neighborhood Number:</label>
                    <input placeholder="1" v-model="neigh_num">
                </div>
                <div class="cell auto">
                    <label for="block">Block:</label>
                    <input placeholder="LAWSON AVE W AND KENT" v-model="block">
                </div>
            </div>
            
        </div>
        <div class="grid-x grid-padding-x align-center-middle">
                <p class="error" v-if="form_error">Error: Must fill all entries</p>
        </div>
        <br>
        <div class="grid-x grid-padding-x align-center-middle text-center">
            <div class="cell auto">
                <button class="button" @click="sendNewCrimeReport">Send</button>
            </div>         
        </div>
    </div>
  </div>
</template>

<style scoped>
.modal {
  position: fixed;
  z-index: 999;
  top: 20%;
  left: 35%;
  width: 700px;
  margin-left: -150px;
  background-color: white;
  border-color: black;
  border-width: 0.5rem;
  border-style: solid;
}

.error {
    font-size: 1rem;
    color: #D32323;
}
</style>