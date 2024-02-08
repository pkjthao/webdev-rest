<script setup>
import { reactive, ref, onMounted, toRaw} from 'vue';
import CrimeRow from './components/CrimeRow.vue';
import Popup from './components/Popup.vue'

let filteredIncidents = ref([]);
const filteredNeighborhood = ref([]);
let filter = ref(true);
let about = ref(true);
let start_date = ref('');
let end_date = ref('');
let max_shown = ref('');
let crime_url = ref('');
let location = ref('');
let crime_data = ref([]);
let max_bounds = reactive([]);
let neighborhoods = reactive([]);
let dialog_err = ref(false); 
let loc_err = ref(false);
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

let conway = 0;
let greaterEast = 0;
let westSide = 0;
let dayton = 0;
let payne = 0;
let northEnd = 0;
let thomas = 0;
let summit = 0;
let westSeven = 0;
let como = 0;
let hamline = 0;
let stAnth = 0;
let union = 0;
let macal = 0;
let highland = 0;
let summitHill = 0;
let capitol = 0;


const getNeighborhoodName = {
        1: ['Conway/Battlecreek/Highwood', conway],
        2: ['Greater East Side', greaterEast],
        3: ['West Side', westSide],
        4: ['Dayton\'s Bluff', dayton],
        5: ['Payne/Phalen', payne],
        6: ['North End', northEnd],
        7: ['Thomas/Dale(Frogtown)', thomas],
        8: ['Summit/University', summit],
        9: ['West Seventh', westSeven],
        10: ['Como', como],
        11: ['Hamline/Midway', hamline],
        12: ['St. Anthony', stAnth],
        13: ['Union Park', union],
        14: ['Macalester-Groveland', macal],
        15: ['Highland', highland],
        16: ['Summit Hill', summitHill],
        17: ['Capitol River', capitol]
    }


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

    //Markers
    let id = 1;
    map.neighborhood_markers.forEach((latlang) => {
        latlang.marker = L.marker(latlang.location, {alt: id}).addTo(map.leaflet).bindPopup(getNeighborhoodName[id][0]);
        id++;
    })
    map.neighborhood_markers[0].marker.setPopupContent('' + dayton);
    map.leaflet.on('moveend', () => {
        let cord = map.leaflet.getCenter();
        let url = 'https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=' + cord.lat + '&lon=' + cord.lng;
        //console.log(url);
        fetch(url)
        .then((res) => {
            return res.json();
        })
        .then((loc) => {
            let locData = loc.address.road;
            console.log(locData);
            location.value = locData;
            
        })
        .catch((error) => {
            console.log(error);
        })
        
        max_bounds = [];
        neighborhoods = [];
        let bounds = map.leaflet.getBounds();
        max_bounds.push(bounds.getNorthWest());
        max_bounds.push(bounds.getSouthEast());
        let i = 1;
        map.neighborhood_markers.forEach((neighborhood) => {
            if(bounds.contains(neighborhood.location)) {
                neighborhoods.push(i);
            }
            i++;
        });
        let x = initializeCrimes();
        //console.log(neighborhoods);
        //console.log(max_bounds);
        

    });

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
            //console.log(value);
        });
    })
    .catch((error) => {
        console.log('Error:', error);
    });

    console.log(district_boundary._layers);
});
 

// FUNCTIONS
//Funciton is called when user presses button and toggles the data displayed. 
function toggle(){
    filter.value = !filter.value;
    initializeCrimes();
}
function change(){
    about.value = !about.value;
}
// Function called once user has entered REST API URL
function initializeCrimes() {
    // TODO: get code and neighborhood data
    //       get initial 1000 crimes
    let url = crime_url.value;
    url = url + "/incidents";
    //console.log(neighborhoods);
    //changed will keep track and see if any filters were selected
    let changed = ref(false);
    // if filter is not true aka filter is on
   
    if(!filter.value){
        let neighborhoodList = "neighborhood=";
        let incidentTypes = "code=";
        let start = "start_date=";
        let end = "end_date=";
        let limit = "limit="
        let neighborhoodArray = toRaw(filteredNeighborhood.value)
        
        // if no boxes were checked for neighborhoods get rid of that part from the url
        if(neighborhoodArray.length == 0){
            neighborhoodList = "";
        }
        else{
            changed.value = true;
            neighborhoodList = neighborhoodList + neighborhoodArray[0];
            for(let i = 1; i < neighborhoodArray.length; i++){
                neighborhoodList = neighborhoodList + "," + neighborhoodArray[i];        
            };
        }
        let incidentsArray = toRaw(filteredIncidents.value);
        //if not boxes were checked for incident types get rid of that part from the url;
        if(incidentsArray.length == 0){
            incidentTypes = "";
        }
        else{
            let notfirst = false;
            for(let i = 0; i < incidentsArray.length; i++){
                if(incidentsArray[i] == "Homicide"){
                    incidentTypes = incidentTypes + "100,110,120";
                    notfirst = true;
                }
                else if(incidentsArray[i] == "Rape"){
                    if(notfirst){
                        incidentTypes = incidentTypes + ",";
                    }
                    notfirst = true;
                    incidentTypes = incidentTypes + "210,220"
                }
                else if(incidentsArray[i] == "Robbery"){
                    if(notfirst){
                        incidentTypes = incidentTypes + ",";
                    }
                    notfirst = true;
                    incidentTypes = incidentTypes + "300";
                    for(let i = 300; i >= 300 && i <=374; i++){
                        incidentTypes = incidentTypes + "," + i;
                    }
                }
                else if(incidentsArray[i] == "Aggravated Assault"){
                    if(notfirst){
                        incidentTypes = incidentTypes + ",";
                    }
                    notfirst = true;
                    incidentTypes = incidentTypes + "400";
                    for(let i = 400; i >= 400 && i <=453; i++){
                        incidentTypes = incidentTypes + "," + i;
                    }
                }
                else if(incidentsArray[i] == "Burglary"){
                    if(notfirst){
                        incidentTypes = incidentTypes + ",";
                    }
                    notfirst = true;
                    incidentTypes = incidentTypes + "500";
                    for(let i = 500; i >= 500 && i <=566; i++){
                        incidentTypes = incidentTypes + "," + i;
                    }
                }
                else if(incidentsArray[i] == "Theft"){
                    if(notfirst){
                        incidentTypes = incidentTypes + ",";
                    }
                    notfirst = true;
                    incidentTypes = incidentTypes + "600";
                    for(let i = 600; i >= 600 && i <=693; i++){
                        incidentTypes = incidentTypes + "," + i;
                    }
                }
                else if(incidentsArray[i] == "Auto Theft"){
                    if(notfirst){
                        incidentTypes = incidentTypes + ",";
                    }
                    notfirst = true;
                    incidentTypes = incidentTypes + "700";
                    for(let i = 700; i >= 700 && i <=732; i++){
                        incidentTypes = incidentTypes + "," + i;
                    }
                }
                else if(incidentsArray[i] == "Domestic Assault"){
                    if(notfirst){
                        incidentTypes = incidentTypes + ",";
                    }
                    notfirst = true;
                    incidentTypes = incidentTypes + "810";
                    for(let i = 810; i >= 810 && i <=863; i++){
                        incidentTypes = incidentTypes + "," + i;
                    }
                }
                else if(incidentsArray[i] == "Arson"){
                    if(notfirst){
                        incidentTypes = incidentTypes + ",";
                    }
                    notfirst = true;
                    incidentTypes = incidentTypes + "900";
                    for(let i = 900; i >= 900 && i <=982; i++){
                        incidentTypes = incidentTypes + "," + i;
                    }
                }
                else if(incidentsArray[i] == "Criminal Damage"){
                    if(notfirst){
                        incidentTypes = incidentTypes + ",";
                    }
                    notfirst = true;
                    incidentTypes = incidentTypes + "1400";
                    for(let i = 1400; i >= 1400 && i <=1436; i++){
                        incidentTypes = incidentTypes + "," + i;
                    }
                }
                else if(incidentsArray[i] == "Narcotics"){
                    if(notfirst){
                        incidentTypes = incidentTypes + ",";
                    }
                    notfirst = true;
                    incidentTypes = incidentTypes + "1800";
                    for(let i = 1800; i >= 1800 && i <=1885; i++){
                        incidentTypes = incidentTypes + "," + i;
                    }
                }
                else if(incidentsArray[i] == "Discharging a Firearm"){
                    if(notfirst){
                        incidentTypes = incidentTypes + ",";
                    }
                    notfirst = true;
                    incidentTypes = incidentTypes + "2619";
                }
                else if(incidentsArray[i] == "Proactive Police Vist"){
                    if(notfirst){
                        incidentTypes = incidentTypes + ",";
                    }
                    notfirst = true;
                    incidentTypes = incidentTypes + "9954";
                }
                else if(incidentsArray[i] == "Community Engagement Event"){
                    if(notfirst){
                        incidentTypes = incidentTypes + ",";
                    }
                    notfirst = true;
                    incidentTypes = incidentTypes + "9959";
                }
                else{
                    if(notfirst){
                        incidentTypes = incidentTypes + ",";
                    }
                    incidentTypes = incidentTypes + "9986";
                }
            }
            if(changed.value){
                incidentTypes = "&" + incidentTypes;
            }
            changed.value = true;
        }
        // if start date is before end date good to go otherwise wipe from url
        if(start_date.value < end_date.value){
            if(changed.value){
                start = "&" + start + start_date.value;
            }
            else{
                start = start + start_date.value;
            }
            end = "&" + end + end_date.value;
            changed.value = true;
        }
        else if(start_date.value > 0 && end_date.value == ""){
            if(changed.value){
                start = "&" + start + start_date.value;
            }
            else{
                start = start + start_date.value;
            }
            changed.value = true;
        }
        else{
            start = "";
            end = "";
        }
        // if limit is less than 1 wipe from url
        if(max_shown.value > 0){
            if(changed.value){
                limit = "&" + limit + max_shown.value;
            }
            else{
                limit = limit + max_shown.value;
            }
            changed.value = true;
        }
        else{
            limit = "";
        }
        // string concatinates the filtered parameters together to make the url.
        if(changed.value){
            url = url + "?" + neighborhoodList + incidentTypes + start + end + limit;
        }
        console.log(url);
        fetch(url)
        .then((res) => {
            return res.json();
         })
        .then((data) => {
            console.log(data);
            crime_data.value = data;
        })
        .catch((error) => {
           console.log(error);
        })
    }
    else{
        //console.log(url);
        fetch(url)
        .then((res) => {
            return res.json();
        })
        .then((data) => {
            //console.log(data);
            crime_data.value = data;
        })
        .catch((error) => {
            console.log(error);
        })
    }

    let y = 1;
    for(y; y < 18; y++) {
        getNeighborhoodName[y][1] = 0;
    }

    crime_data.value.forEach((crime) => {
        let x = crime.neighborhood_number;
        getNeighborhoodName[x][1] += 1;
    });
    for(y = 0; y < 17; y++) {
        map.neighborhood_markers[y].marker.setPopupContent(getNeighborhoodName[y + 1][0] + ': ' + getNeighborhoodName[y + 1][1] + ' crimes');
    }
}

let marker = null;
function addressMarker(data) {
    if(data.delete) {
    var greenIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
    //console.log(data);
    let info = "Date: " + data.crimeData.date + ', Time: ' + data.crimeData.time + ', Incident: ' + data.crimeData.incident;
    marker = L.marker([data.data.lat, data.data.lon], {icon: greenIcon}).addTo(map.leaflet).bindPopup(info);
    }
    else {
        map.leaflet.removeLayer(marker);
    }
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
   // console.log(location.value);
    let address = location.value + ' St.Paul MN';
    let url = 'https://nominatim.openstreetmap.org/search?q=' + address + '&format=json&&limit=1';
    fetch(url)
    .then((res) => {
        return res.json();
    })
    .then((loc) => {
        loc_err.value = false;
        let locData = loc[0];
        //console.log(locData);
        map.leaflet.zoomIn(16);
        map.leaflet.panTo([locData.lat, locData.lon]);
        map.leaflet.zoomIn(16);
    })
    .catch((error) => {
        console.log(error);
        loc_err.value = true;
    })

}

//data for the neighborhood checkboxes
const checkNeighborhood = ref([
        {message: 'Conway/Battlecreek/Highwood',},
        {message: 'Greater East Side'},
        {message: 'West Side'},
        {message: 'Dayton\'s Bluff'},
        {message: 'Payne/Phalen'},
        {message: 'North End'},
        {message: 'Thomas/Dale(Frogtown)'},
        {message: 'Summit/University'},
        {message: 'West Seventh'},
        {message: 'Como'},
        {message: 'Hamline/Midway'},
        {message: 'St. Anthony'},
        {message: 'Union Park'},
        {message: 'Macalester-Groveland',},
        {message: 'Highland'},
        {message: 'Summit Hill'},
        {message: 'Capitol River'}
])
const checkIncidents = ref([
    {message: "Homicide", id:"100,110,120"},
    {message: "Rape"},
    {message: "Robbery"},
    {message: "Aggravated Assault"},
    {message: "Burglary"},
    {message: "Theft"},
    {message: "Auto Theft"},
    {message: "Domestic Assault"},
    {message: "Arson"},
    {message: "Criminal Damage"},
    {message: "Narcotics"},
    {message: "Discharging a Firearm"},
    {message: "Proactive Police Visit"},
    {message: "Community Engagement Event"},
    {message: "proactive Foot Patrol"}
])

</script>
<template>
    <div class="grid-x grid-padding-x">
        <span v-if="about">
            <button class="button large" type="button" @click="change">About</button>
        </span>
        <span v-else>
            <a href="/"><button class="button large" type="button" @click="change">Home</button></a>
        </span>
    </div>
    <div v-if="about">
    <dialog id="rest-dialog" open>
        <h1 class="dialog-header">St. Paul Crime REST API</h1>
        <label class="dialog-label">URL: </label>
        <input id="dialog-url" class="dialog-input" type="url" v-model="crime_url" placeholder="http://localhost:8000" />
        <p class="dialog-error" v-if="dialog_err">Error: must enter valid URL</p>
        <br/>
        <button class="button" type="button" @click="closeDialog">OK</button>
    </dialog>
    <div class="grid-container ">
        <br>
        <br>
        <br>
        <div class="grid-x grid-padding-x">
            <div id="leafletmap" class="cell auto"></div>
        </div>
        <br>
        <div class="grid-x grid-padding-x">
            <label>Location: </label>
            <input id="loc" type="text" v-model="location" placeholder="Enter location" style="width: 25rem;"/>
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
                <span v-for="incident in checkIncidents">
                <input type="checkbox" :value="incident.message" v-model="filteredIncidents">
                <label>{{ incident.message }}</label>
                <br>
                </span>
            </div>
            <div class="cell auto">
                <p>Select Neighborhood(s)</p>
                <span v-for="(item, index) in checkNeighborhood">
                <input type="checkbox" :value="index + 1" v-model="filteredNeighborhood">
                <label>{{item.message}}</label>
                <br>
                </span>
            </div>
            <div class="cell auto">
                <p>Start Date</p>
                <input v-model="start_date" placeholder="No Start Date Selected">
                <p>End Date</p>
                <input v-model="end_date" placeholder="No end Date Selected">
            </div>
            <div class="cell auto">
                <p>Max Cases Shown</p>
                <input v-model="max_shown" placeholder="No Max Selected">
            </div>
        </div>
        <div class="grid-x grid-padding-x">
            <p class="dialog-error" v-if="loc_err">Error: must enter valid address</p>
        </div>
        <br>
        <div class="grid-x grid-padding-x">
            <Popup :url="crime_url"/>
            <div class="cell auto">
                <label class="violent-crimes">Violent Crimes</label>
            </div>
            <div class="cell auto">
                <label class="property-crimes">Property Crimes</label>
            </div>
            <div class="cell auto">
                <label class="other-crimes">Other Crimes</label>
            </div>
        </div>
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
                    <th></th>
                    <th></th>
                </thead>
                <tbody>
                    <CrimeRow v-for="crime in crime_data" @addressMarker="addressMarker" :data="crime" :url="crime_url"></CrimeRow>
                </tbody>
            </table>
        </div>
    </div>
    </div>
    <div v-else>
        <div class="grid-x grid-padding-x">
            <div class="cell small-12">
                <h1>About our St. Paul Crime Map</h1>
                <video width="1000" height="500" controls><source src="\src\video4751396828.mp4" type="video/mp4"></video>
            </div>
            <div class="cell small-12"><h1>Our Team</h1></div>
            <div class="cell small-2"><img src="\src\headshot.jpg" alt="Picture of Paku"></div>
            <div class="cell small-10"><p class="bio">My name is Paku Thao and I am a junior at the University of St. Thomas.</p></div>
            <div class="cell small-10"><p class="bio">Rafay Malik, a junior Computer Science major, excels in coding, hackathons, and collaborative problem-solving. My passion for tech innovation drives a quest for impactful contributions in the field.</p></div>
            <div class="cell small-2"><img src="\src\ProjectPicture.jpeg" alt="Picture of Rafay"></div>
            <div class="cell small-2"><img src="\src\headshot.png" alt="Picture of Russell"></div>
            <div class="cell small-10"><p class="bio">My name is Russell Ostergaard and I am a senior at the University of St. Thomas.</p></div>
            
        </div>
        <div class="grid-x grid-padding-x spacing">
            <div class="cell small-12"><h1>Tools Used</h1></div>
            <div class="cell small-2"><img src="\src\vue.png" alt="Picture of vue logo"></div>
            <div class="cell small-10">
                <h2>Vue</h2>
                <p class="bio">We used vue to create our single page application and tie all the other tools that we used together.</p>
            </div>
            <div class="cell small-2"><img src="\src\customAPI.png" alt="Picture of Custom API"></div>
            <div class="cell small-10">
                <h2>Custom Rest Api</h2>
                <p class="bio">We used our custom API to get data in and out of are database by using rest commands.</p>
            </div>
            <div class="cell small-12"><h1>Interesting Findings</h1></div>
            <div class="cell small-12">
                <p class="bio">How you are able to make checklists in vue, if you store the value in a ref array then it will be a proxy array which you will
                    have use methods on it to get the values.
                </p>
            </div>
            <div class="cell small-12">
                <p class="bio">When making a table that updates as the data is updated if you have the data stored in a reactive array it will not update properly but if
                    you use a ref array and do .value on it then it will actually update properly.
                </p>
            </div>
            <div class="cell small-12">
                <p class="bio">While looking at the crime stats there was less violent crimes than we thought there would be</p>
            </div>
            <div class="cell small-12">
                <p class="bio">It was interesting looking at the different crimes in all the different neighborhoods especially when you filtered it down to look at specific
                    crimes in spicific neighborhoods.
                </p>
            </div>
            <div class="cell small-12">
                <p class="bio">How well the API communicated with the vue and how the amount of work it took to set up was not a lot.</p>
            </div>
            <div class="cell small-12">
                <p class="bio">The amount of built rendering help that vue has like v-if's and v-for which are little things that save so much time when it comes to coding.</p>
            </div>
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

.violent-crimes{
        background-color:#b84b56;
    }

.property-crimes{
        background-color:orange;
}

.other-crimes{
    background-color: #edd55a;
}

.bio{
    font-size: 2rem;
}
.spacing{
    grid-gap: 0.5rem;
}
</style>
