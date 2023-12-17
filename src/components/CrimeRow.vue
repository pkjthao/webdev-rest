<script setup>
    defineProps(['data']);

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
    </tr>
</template>

<style scoped>
    th, td {
        border: solid 1px #000000;
    }
</style>