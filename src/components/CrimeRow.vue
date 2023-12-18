<script setup>
    const props = defineProps({
        data: Object,
        url: String // Ensure 'url' is passed as a prop
    });

    const emits = defineEmits([
        'addressMarker'
    ])

    let add = true;

    const getNeighborhoodName = {
        1: 'Conway/Battlecreek/Highwood',
        2: 'Greater East Side',
        3: 'West Side',
        4: 'Dayton\'s Bluff',
        5: 'Payne/Phalen',
        6: 'North End',
        7: 'Thomas/Dale(Frogtown)',
        8: 'Summit/University',
        9: 'West Seventh',
        10: 'Como',
        11: 'Hamline/Midway',
        12: 'St. Anthony',
        13: 'Union Park',
        14: 'Macalester-Groveland',
        15: 'Highland',
        16: 'Summit Hill',
        17: 'Capitol River'
    }
    //console.log(props.url);

    function deleteCrime(case_number) {
        // DELETE request using fetch with set headers
        const element = document.querySelector('#delete-request-set-headers .status');
       // let jsonString = JSON.parse(case_num);
       // jsonString = JSON.stringify(jsonString);
        const requestOptions = {
            method: 'DELETE',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({case_number})
        };
        console.log(requestOptions);
        fetch(props.url + '/remove-incident', requestOptions)
        .then((response) => {
            if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
            }
            return response.text();
        })
        .then((res) => {
            console.log(res);
        })
        .catch((error) => {
            console.error('Error updating data:', error);
        })
    }

    function addressMarker(address) {
        if(address.includes(' AND ')) {
            let str = address.split(' AND ');
            address = str[0];
        }
        address = address + ' St Paul, MN';
        fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`)
        .then((res) => {
            return res.json();
        })
        .then((data) => {
            emits('addressMarker', {data: data[0], crimeData: props.data, delete: add});
        })
        .catch((error) => {
            console.log(error);
        })
    }

    /*
    // Define a custom icon
    const customIcon = L.icon({
    iconUrl: 'path/to/your/icon.png',
    iconSize: [38, 38], 
    iconAnchor: [19, 38], 
    popupAnchor: [0, -38]})

    async function getAddressCoordinates(address) {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`);
        const data = await response.json();

        if (data && data.length > 0) {
        return {
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon)
        };
        } else {
        console.error('No coordinates found for the address');
        return null;
        }
    } catch (error) {
        console.error('Error fetching coordinates:', error);
        return null;
    }
    }
    function showCrimeLocation() {
        const { block } = props.data;
        const modifiedBlock = block.replace(/(\d+)X/g, '$10'); // Replace 'X' with '0'

        // Assuming you have a function to get coordinates from an address
        const crimeLocation = getAddressCoordinates(modifiedBlock); // Implement this function

        if (crimeLocation) {
            // Here, you can add a marker to the map at crimeLocation coordinates
            // Use a different color/icon than other markers, and create a popup with date, time, incident, and delete button
            // Example code to add a marker (Leaflet.js)
            const crimeMarker = L.marker([crimeLocation.lat, crimeLocation.lng], { icon: customIcon }).addTo(map);
            crimeMarker.bindPopup(
            `<strong>Date:</strong> ${props.data.date}<br>
            <strong>Time:</strong> ${props.data.time}<br>
            <strong>Incident:</strong> ${props.data.incident}<br>
            <button class="button" @click.stop="deleteCrime(data.case_number)">Delete</button>`
            );
        }
    }*/

</script>

<template>
    <tr>
        <td>{{ data.case_number }}</td>
        <td>{{ data.date }}</td>
        <td>{{ data.time }}</td>
        <td>{{ data.incident }}</td>
        <td>{{ data.police_grid }}</td>
        <td>{{ getNeighborhoodName[data.neighborhood_number]}}</td>
        <td>{{ data.block }}</td>
        <td>
            <button class="button" @click="add = true; addressMarker(data.block)">Add Map Marker</button>
            <button class="button" @click="add = false; addressMarker(data.block)">Delete Marker</button>
        </td>
        <td><button class="button" @click="deleteCrime(data.case_number, crime_data)">Delete</button></td>
    </tr>
</template>

<style scoped>
    th, td {
        border: solid 1px #000000;
    }
</style>