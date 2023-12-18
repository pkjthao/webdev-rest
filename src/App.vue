<script setup>
import { reactive, ref, onMounted } from 'vue';
import CrimeRow from './components/CrimeRow.vue';

const filteredIncidents = ref([]);
const filter = ref(true);
let crime_url = ref('');
let location = ref('');
let crime_data = reactive([]);
let dialog_err = ref(false);
let map = reactive(
    {
        leaflet: null,
        center: {
            lat: 44.955139,
            lng: -93.102222,
            address: ''
        },
        zoom: 12,
        bounds: {
            nw: {lat: 45.008206, lng: -93.217977},
            se: {lat: 44.883658, lng: -92.993787}
        },
        neighborhood_markers: [
            {location: [44.942068, -93.020521], marker: null},
            {location: [44.977413, -93.025156], marker: null},
            {location: [44.931244, -93.079578], marker: null},
            {location: [44.956192, -93.060189], marker: null},
            {location: [44.978883, -93.068163], marker: null},
            {location: [44.975766, -93.113887], marker: null},
            {location: [44.959639, -93.121271], marker: null},
            {location: [44.947700, -93.128505], marker: null},
            {location: [44.930276, -93.119911], marker: null},
            {location: [44.982752, -93.147910], marker: null},
            {location: [44.963631, -93.167548], marker: null},
            {location: [44.973971, -93.197965], marker: null},
            {location: [44.949043, -93.178261], marker: null},
            {location: [44.934848, -93.176736], marker: null},
            {location: [44.913106, -93.170779], marker: null},
            {location: [44.937705, -93.136997], marker: null},
            {location: [44.949203, -93.093739], marker: null}
        ]
    }
);

// Vue callback for once <template> HTML has been added to web page
onMounted(() => {
    // Create Leaflet map (set bounds and valied zoom levels)
    map.leaflet = L.map('leafletmap').setView([map.center.lat, map.center.lng], map.zoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        minZoom: 11,
        maxZoom: 18
    }).addTo(map.leaflet);
    map.leaflet.setMaxBounds([[44.883658, -93.217977], [45.008206, -92.993787]]);

    // Get boundaries for St. Paul neighborhoods
    let district_boundary = new L.geoJson();
    district_boundary.addTo(map.leaflet);
    fetch('data/StPaulDistrictCouncil.geojson')
    .then((response) => {
        return response.json();
    })
    .then((result) => {
        result.features.forEach((value) => {
            district_boundary.addData(value);
        });
    })
    .catch((error) => {
        console.log('Error:', error);
    });
});


// FUNCTIONS
// Function called once user has entered REST API URL
function initializeCrimes() {
    // TODO: get code and neighborhood data
    //       get initial 1000 crimes
    let url = crime_url.value;

    url = url + "incidents";

    console.log(url);
    fetch(url)
    .then((res) => {
        return res.json();
    })
    .then((data) => {
        console.log(data);
        crime_data = data;
    })
    .catch((error) => {
        console.log(error);
    })
    
}

// Function called when user presses 'OK' on dialog box
function closeDialog() {
    let dialog = document.getElementById('rest-dialog');
    let url_input = document.getElementById('dialog-url');
    if (crime_url.value !== '' && url_input.checkValidity()) {
        dialog_err.value = false;
        dialog.close();
        initializeCrimes();
    }
    else {
        dialog_err.value = true;
    }
}

function getLocation() {
    console.log(location.value);
}

//Funciton is called when user presses button and toggles the data displayed. 
function toggle(){
    filter.value = !filter.value;
}

/*
Function is called when user has entered fitering values
Param0 is a array that will have the incident type/types that are to be displayed
Param1 is a array with selected neighborhood names
Param2 and 3 is a selected start and end date
Param4 is a int with the amount of incidents that it will show
*/
function filteredcrimes(param0, param1, param2, param3, param4) {
    url = url + "incidents";//param0 + param1 + param2 + param3 + param4;
    fetch(url)
    .then((res) => {
        return res.json();
    })
    .then((data) => {
       console.log(data);
        crime_data = data;
    })
    .catch((error) => {
        console.log(error);
    })
}

</script>

<template>
    <dialog id="rest-dialog" open>
        <h1 class="dialog-header">St. Paul Crime REST API</h1>
        <label class="dialog-label">URL: </label>
        <input id="dialog-url" class="dialog-input" type="url" v-model="crime_url" placeholder="http://localhost:8000" />
        <p class="dialog-error" v-if="dialog_err">Error: must enter valid URL</p>
        <br/>
        <button class="button" type="button" @click="closeDialog">OK</button>
    </dialog>
    <div class="grid-container ">
        <div class="grid-x grid-padding-x">
            <div id="leafletmap" class="cell auto"></div>
        </div>
        <br>
        <div class="grid-x grid-padding-x">
            <label>Location: </label>
            <input id="loc" type="text" v-model="location" placeholder="Enter location"/>
            <button class="button" type="button" @click="getLocation">Go</button>
        </div>
        <br>
        <div class="grid-x grid-padding-x">
            <div class="cell">
                <h1> Filters </h1>
            </div>
            <div class="cell auto">
            <button v-if="filter" class="button" type="button" @click="toggle">Apply</button>
            <button v-else class="button" type="button" @click="toggle">Reset</button>
            </div>
            <div class="cell auto">
                <p>Select Incident Type(s)</p>
                <input type="checkbox" id="incidenttypes" value="type1" v-model="filteredIncidents">
                <label for="type1">Type1</label>
            </div>
            <div class="cell auto">
                <p>Select Neighborhood(s)</p>
                <input type="checkbox" id="neighborhood" value="type1" v-model="neighborhood">
                <label for="type1">Type1</label>
            </div>
            <div class="cell auto">
                <p>Start Date</p>
                <input v-model="start" placeholder="No Start Date Selected">
                <p>End Date</p>
                <input v-model="start" placeholder="No end Date Selected">
            </div>
            <div class="cell auto">
                <p>Max Cases Shown</p>
                <input v-model="max" placeholder="No Max Selected">
            </div>
        </div>
        <br>
        <div class="grid-x grid-padding-x">
            <table>
                <thead>
                    <th>Case Number</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Incident</th>
                    <th>Police Grid</th>
                    <th>Neighborhood</th>
                    <th>Block</th>
                </thead>
                <tbody v-if="filter">
                    <CrimeRow v-for="crime in crime_data" :data="crime"></CrimeRow>
                </tbody>
                 <tbody v-else>
                    <CrimeRow v-for="crime in crime_data" :data="crime"></CrimeRow>
                </tbody>
            </table>
        </div>
    </div>
</template>

<style>
#rest-dialog {
    width: 20rem;
    margin-top: 1rem;
    z-index: 1000;
}

#leafletmap {
    height: 500px;
}

.dialog-header {
    font-size: 1.2rem;
    font-weight: bold;
}

.dialog-label {
    font-size: 1rem;
}

.dialog-input {
    font-size: 1rem;
    width: 100%;
}

.dialog-error {
    font-size: 1rem;
    color: #D32323;
}
</style>
