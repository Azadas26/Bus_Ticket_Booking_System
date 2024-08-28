module.exports =
{
    findIndicesByValue: (arr, value1, value2) => {
        console.log(arr);
        let indices = [];

        for (let i = 0; i < arr.length; i++) {
            let values = Object.values(arr[i]); // Get the values of the current object
            if (values.includes(value1) || values.includes(value2)) {
                indices.push(i); // Add the index if the value matches
            }
        }

        return indices;
    },
    findValuesBetweenIndices: (arr, index1, index2) => {
        // Ensure index1 is the smaller index
        console.log("Arrr", arr, index1, index2);
        const startIndex = Math.min(index1, index2);
        const endIndex = Math.max(index1, index2);

        let values = [];

        for (let i = startIndex; i <= endIndex; i++) {
            values.push(Object.values(arr[i])[0]); // Extract and add the value to the array
        }

        return values;
    },
    tocalculatetoataltimebusttraveled: (values,speed) => {
        console.log("speed",speed);
        var distancefromdis = 0
        values.map(i => {
            distancefromdis = distancefromdis + i;
        }
        )
        console.log("Discoo", distancefromdis);
        var days_bus_need_to_traval = Math.floor(((distancefromdis / speed) / 24) + 0.7) == 0 ? 1 : Math.floor(((distancefromdis / speed) / 24) + 0.7)
        console.log("Day Need to Travel", days_bus_need_to_traval);
        return days_bus_need_to_traval
    }
}