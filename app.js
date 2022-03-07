const express = require("express");
const port = 3000;
const app = express();
//var path = require("path");
var args = process.argv.slice(2);
var fileName = 'Iris/iris.csv';

// app.locals.irisDB = 'Iris/iris.csv';
// app.locals.banknoteDB = 'Banknote/banknote_authentication.csv';

if (args[0] == 'iris') {
    fileName = 'Iris/iris.csv';
} else if (args[0] == 'banknote') {
    fileName = 'Banknote/banknote_authentication.csv';
}

const machineLearning = require('./models/machineLearning');

machineLearning.naiveBayes(fileName);

app.use(express.json());
app.use(express.urlencoded());

//app.use('/machineLearning', machineLearning);

// app.get('/', function (req, res) {
//     res.sendFile(path.resolve(__dirname + '/../frontend/index.html'));
// });

// app.use('/frontend/css', express.static('../frontend/css'));
// app.use('/frontend/js/', express.static('../frontend/js/'));

const server = app.listen(port, () => console.log(`Server is listening to ${port}!`));

module.exports = server;