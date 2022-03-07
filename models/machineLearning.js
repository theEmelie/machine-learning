const readCSVfile = require('./readCSVfile');

const machineLearning = {
    training: {mean: [], std: []},

    /**
     * Do the naive bayes algorithm.
     * @param {fileName} fileName 
     */
    naiveBayes: function(fileName) {
        var path = require("path");
        var FileReader = require('filereader');
        var fapi = require('file-api');
        
        var reader = new FileReader();
        var File = fapi.File;
        //var fileName = req.app.locals.irisDB;

        reader.onload = function(e) {
            var result = readCSVfile.readFile(e) 
            machineLearning.fit(result.matrix, result.category);   
            var classification = machineLearning.predict(result.matrix);
            machineLearning.accuracy_score(classification, result.category);
            machineLearning.confusion_matrix(classification, result.category)
            //console.log({accuracy});
            return;
        }
        reader.readAsText(new File(fileName));
    },

    /**
     * Save the mean and std onto this.training
     * @param {x} x 
     * @param {y} y 
     */
    fit: function(x, y) {
        var meanArr = [];
        var stdArr = [];

        meanArr = machineLearning.calculateMean(x, y);
        this.training.mean = meanArr;

        stdArr = machineLearning.calculateStd(x, y, meanArr);
        this.training.std = stdArr;

        //console.log(this.training);
    },

    /**
     * Calculate the standard deviation
     * @param {x} x 
     * @param {x} y 
     * @param {meanArr} meanArr 
     * @returns the standard deviation (std)
     */
    calculateStd: function(x, y, meanArr) {
        var category = "";
        var total = [];
        var count = 0;
        var std = [];
        var stdResult = [];
        var catIndex = 0;

        // iterate through all the categories
        for (var i = 0; i < y.length; i++) {
            // go through each category except the last one
            if (y[i] !== category) {
                // dont calculate the std for the first iteration
                if (i !== 0) {
                    for (var j = 0; j < x[0].length; j++) {
                        // calculate the std for each column
                        std[j] =  Math.round(Math.sqrt(total[j] / count)*1e8) / 1e8;
                    }
                    stdResult.push(std);
                    std = [];
                    catIndex++;
                }
                
                for (var j = 0; j < x[0].length; j++) {
                    // clear total and count for each column
                    total[j] = 0.0;
                    count = 0;
                }

                // set the category
                category = y[i];
            }

            for (var j = 0; j < x[0].length; j++) {
                // the sum for each column
                total[j] += (x[i][j] - meanArr[catIndex][j]) * (x[i][j] - meanArr[catIndex][j]);
            }
            count++;
        }
        catIndex++;

        for (var j = 0; j < x[0].length; j++) {
            // calculate the std for the last category for each column
            std[j] = Math.round(Math.sqrt(total[j] / count)*1e8) / 1e8;
        }
        
        stdResult.push(std);
        //console.log(stdResult);
        return stdResult;
    },

    /**
     * Calculate the mean
     * @param {x} x 
     * @param {y} y 
     * @returns the mean
     */
    calculateMean: function(x, y) {
        var category = "";
        var total = [];
        var count = 0;
        var mean = [];
        var meanResult = [];

        // iterate through all the categories
        for (var i = 0; i < y.length; i++) {
            // go through each category except the last one
            if (y[i] !== category) {
                // dont calculate the mean for the first iteration
                if (i !== 0) {
                    for (var j = 0; j < x[0].length; j++) {
                        // calculate the mean for each column
                        mean[j] = Math.round((total[j] / count)*1e8) / 1e8;
                    }
                    meanResult.push(mean);
                    mean = [];
                }
                
                for (var j = 0; j < x[0].length; j++) {
                    // clear total and count for each column
                    total[j] = 0.0;
                    count = 0;
                }

                // set the category
                category = y[i];
            }

            for (var j = 0; j < x[0].length; j++) {
                // the sum for each column
                total[j] += x[i][j];
            }
            count++;
        }

        for (var j = 0; j < x[0].length; j++) {
            // calculate the mean for the last category for each column
            mean[j] = Math.round((total[j] / count)*1e8) / 1e8;
        }
        
        meanResult.push(mean);
        //console.log(meanResult);
        return meanResult;
        

    },

    /**
     * Calculate the prediction
     * @param {x} x 
     * @returns which category is most likely to be correct.
     */
    predict: function(x) {
        var pdfArr = [];
        var pArr = [];
        var pNormArr = [];
        var pSum = 0;
        var mostLikelyCategory = [];
        var highestProb = -1;

        // iterate through each line of x
        for (var i = 0; i < x.length; i++) {
            pSum = 0;
            highestProb = -1;
            pdfArr = [];

            // iterate through each row of x
            for (var j = 0; j < x[i].length; j++) {
                var value = x[i][j];
                var row = new Array();
                
                // iterate through the rows of mean/std table
                for (var k = 0; k < this.training.std.length; k++) {
                    row[k] = machineLearning.pdf(value, this.training.mean[k][j], this.training.std[k][j])
                }
                // create an array of arrays
                pdfArr.push(row);
            }
            //console.log(pdfArr);
            // iterate through each column of pdf table
            for (var m = 0; m < pdfArr[0].length; m++) {
                pArr[m] = 1;
                // iterate through each row of pdf table
                for (var n = 0; n < pdfArr.length; n++) {
                    pArr[m] = pArr[m] * pdfArr[n][m];
                }
                pSum += pArr[m];
            }

            // normalize pArr
            for (var m = 0; m < pArr.length; m++) {
                pNormArr[m] = pArr[m] / pSum;

                if (pNormArr[m] > highestProb) {
                    highestProb = pNormArr[m];
                    mostLikelyCategory[i] = m;
                }
            }
            // console.log({pNormArr});
            
        }
        //console.log({mostLikelyCategory});
        return mostLikelyCategory;
    },

    /**
     * Calculate the probabilities of the input attributes belonging to each category 
     * using the Gaussian Probability Density Function.
     * @param {x} x 
     * @param {mean} mean 
     * @param {std} std 
     * @returns the pdf value
     */
    pdf: function(x, mean, std) {
        var pdfValue = (1 / (Math.sqrt(2 * Math.PI) * std)) * Math.E**(-((x - mean)**2) / (2 * std **2));
        
        return pdfValue;
    },

    /**
     * Calculate the accuracy
     * @param {pred} preds 
     * @param {actualCat} actualCat 
     * @returns accuracy score
     */
    accuracy_score: function(preds, actualCat) {
        var accuracy = 0.0;
        var correct = 0;

        // iterate through each prediction, 
        // and if the prediction is the same as the category,
        // increment correct by 1 each time
        for (var i = 0; i < preds.length; i++) {
            if (preds[i] == actualCat[i]) {
                correct++;
            }
        }
        // calculate the accuracy
        accuracy = (correct / preds.length) * 100;
        console.log("-----------------------------");
        console.log("Accuracy: %f\%", accuracy.toFixed(2));
        console.log("(%i/%i correctly classified)", correct, preds.length)
        console.log("-----------------------------");
        return accuracy;
    },

    /**
     * Calculate the confusion matrix
     * @param {pred} preds 
     * @param {actualCat} actualCat 
     * @returns confusion matrix score
     */
    confusion_matrix: function(preds, actualCat) {
        // add each category to a set and see how many unique categories there are 
        var totalCats = new Set(actualCat).size;
        var confMatrix = new Array(totalCats);

        // create a 2D array
        for (var i = 0; i < confMatrix.length; i++) {
            confMatrix[i] = new Array(totalCats);
            
            // iterate through the 2D array and initial each value to 0
            for (var j = 0; j < confMatrix[i].length; j++) {
                confMatrix[i][j] = 0;
            }
        }

        // iterate through the predictions
        for (var i = 0; i < preds.length; i++) {
            var actual = actualCat[i]; // the category
            var classification = preds[i]; // the prediction value

            confMatrix[actual][classification]++;
        }

        // Output Confusion Matrix to the console
        var outputStr = "Confusion Matrix\n\n";
        for (var i = 0; i < confMatrix[0].length; i++) {
            outputStr += `\t[${i}]`;
        }
        outputStr += "\n\n"

        for (var i = 0; i < confMatrix.length; i++) {
            outputStr += `[${i}]\t`;
            for (var j = 0; j < confMatrix[i].length; j++) {
                outputStr += `${confMatrix[i][j]}\t`;
            }
            outputStr += "\n\n"
        }
        
        console.log(outputStr);
        //console.log({confMatrix});

        return confMatrix;
    }
}

module.exports = machineLearning;