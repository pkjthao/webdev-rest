<script setup>
    const props = defineProps({
        data: Object,
        url: String // Ensure 'url' is passed as a prop
    });

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

    async function deleteCrime(id) {
        try {
            const response = await fetch(`${props.url}/remove-incident/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                // Remove the deleted crime from the UI
                // Update crime_data array or trigger a refresh of the crime list
            } else {
                console.error('Failed to delete crime:', response.statusText);
            }
        } catch (error) {
            console.error('Error deleting crime:', error);
        }
    }
</script>

<template>
    <tr>
        <td>{{ data.case_number }}</td>
        <td>{{ data.date }}</td>
        <td>{{ data.time }}</td>
        <span v-if="(100<= data.code && data.code<= 453) || (810<=data.code && data.code <= 863)">
        <td class="violent-crimes">{{ data.incident }}</td>
        </span>
        <span v-else-if="(500<= data.code && data.code<= 732) || (900<=data.code && data.code <= 1436)">
        <td class="property-crimes">{{ data.incident }}</td>
        </span>
        <span v-else>
        <td class="other-crimes">{{ data.incident }}</td>
        </span>
        <td>{{ data.police_grid }}</td>
        <td>{{ getNeighborhoodName[data.neighborhood_number]}}</td>
        <td>{{ data.block }}</td>
        <td><button class="button" @click="deleteCrime(data.case_number)">Delete</button></td>
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
</style>