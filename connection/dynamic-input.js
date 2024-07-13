module.exports =
{
    Create_Dynamic_Inputs: (obj,name) => {
        const nameArray = [];
        const numInputs = parseInt(obj.numInputs, 10);

        for (let i = 1; i <= numInputs-1; i++) {
            const key = `${name}${i}`;
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                nameArray.push({ [key]: parseInt(obj[key] )});
                delete obj[key]; // Remove the property from the original object
            }
        }

        // Optionally, add the array of objects back to the original object
        obj[name] = nameArray;

        return obj;
    }
}