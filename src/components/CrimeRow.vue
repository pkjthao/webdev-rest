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

</script>

<template>
    <tr>
        <td>{{ data.case_number }}</td>
        <td>{{ data.date }}</td>
        <td>{{ data.time }}</td>
        <td class="violent-crimes" v-if="(100<= data.code && data.code<= 453) || (810<=data.code && data.code <= 863)">{{ data.incident }}</td>
        <td class="property-crimes" v-else-if="(500<= data.code && data.code<= 732) || (900<=data.code && data.code <= 1436)">{{ data.incident }}</td>
        <td class="other-crimes" v-else>{{ data.incident }}</td>
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

    .violent-crimes{
        background-color:#b84b56;
    }

    .property-crimes{
        background-color:orange;
    }

    .other-crimes{
        background-color: #edd55a;
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
</style>
