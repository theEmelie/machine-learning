const readCSVfile = {
    /**
     * Read a file and turn it into a json structure.
     * @param {e} e 
     * @returns 
     */
    readFile: function(e) {
        var csv = e.target.result;
        var lines = csv.split("\n");
        var result = {};
        var headers = lines[0].split(",");
        var category = [];
        var matrix = [];
        var cat = "";

        // loop through each line in file and split the line where there is a comma.
        for (var i = 1; i < lines.length; i++) {
            if (lines[i].length > 0) {
                var obj = [];
                var currentLine = lines[i].split(",");
                currentLine[headers.length - 1] = currentLine[headers.length - 1].replace(/\r/g, "");
                var floatData = currentLine.map(v => parseFloat(v, 10));
        
                // add the splitted line into an object of arrays aka a json structure.
                for (var j = 0; j < headers.length - 1; j++) {
                    obj[j] = floatData[j];
                }

                // set the categories to be a number instead of a string
                if (currentLine[headers.length - 1] == 'Iris-setosa') {
                    cat = 0;
                } else if (currentLine[headers.length - 1] == 'Iris-versicolor') {
                    cat = 1;
                } else if (currentLine[headers.length - 1] == 'Iris-virginica') {
                    cat = 2;
                } else {
                    cat = currentLine[headers.length - 1];
                }

                category.push(cat);
                matrix.push(obj);
            }
        }
        result.matrix = matrix;
        result.category = category;
        //console.log(result);
        return result;
    }
};

module.exports = readCSVfile;
