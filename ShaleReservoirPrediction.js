class ShaleReservoirProductionPerformance
{
    constructor(modelingOption, fileOption, gpuOption, inputTensorFromCSVFileX, inputTensorFromCSVFileY,
                mongDBCollectionName, mongDBSpecifiedDataArrayX, mongDBSpecifiedDataArrayY)
    {
        this.modelingOption = modelingOption;
        this.fileOption  = fileOption;
        this.gpuOption = gpuOption;
        this.inputTensorFromCSVFileX = inputTensorFromCSVFileX;
        this.inputTensorFromCSVFileY = inputTensorFromCSVFileY;
        this.mongDBCollectionName = mongDBCollectionName;
        this.mongDBSpecifiedDataArrayX = mongDBSpecifiedDataArrayX;
        this.mongDBSpecifiedDataArrayY = mongDBSpecifiedDataArrayY;
    }
    
    static runTimeDNN(beginTime, timeOption)
    {
        console.log("========================================================>")
        console.log(timeOption, " (seconds): ", (new Date() - beginTime)/1000);
        console.log("=========================================================>")
    }
    
    static commonModules()
    {
        const fs = require('fs');
        const util = require('util');
        const tfvis = require('@tensorflow/tfjs-vis');
        const tf = require('@tensorflow/tfjs');
        
        if(this.gpuOption === true)
        {
            require('@tensorflow/tfjs-node-gpu');  //c/c++ binding, gpu option
        }
        else
        {
            require('@tensorflow/tfjs-node');      //c/c++ binding, cpu option
        }
        
        const model = tf.sequential();
        return {tf: tf, tfvis: tfvis, fs:fs,  util: util, model: model};
    }
    
    productionPerformace(batchSize, epochs, validationSplit, verbose, inputDim, inputSize)
    {
        
        if(this.modelingOption === "dnn")
        {
            //import module(s) and create model
            const commonModules = ShaleReservoirProductionPerformance.commonModules()
            const tf = commonModules.tf;
            const util = commonModules.util;
            const model = commonModules.model;
                            
            ///configure input tensor
            //option 1: create default, manually or randomly generated dataset
            //option 2: import dataset from external csv file or database (MongoDB)
            var x = null;
            var y = null;
                            
            if(this.fileOption === "default" || this.fileOption === null || this.fileOption === undefined)
            {
                console.log("")
                console.log("=================================================>")
                console.log("Using manually or randomly generated dataset.");
                console.log("=================================================>")
                x = tf.truncatedNormal ([inputDim, inputSize], 1, 0.3, "float32", 0.5);
                y = tf.truncatedNormal ([inputDim, 1], 1, 0.3, "float32", 0.5);
            }
            else
            {
                //use data from (a) "csv" file  or (b) data extracted from MongoDB server
                console.log("")
                console.log("=======================================================================>")
                console.log("Using dataset from externally loaded 'csv' file or 'MongoDB' server.")
                console.log("=======================================================================>")
            
                if(this.fileOption === "csv")
                {
          
                    console.log("")
                    console.log("=======================================================================>")
                    console.log("Not using default dataset, but dataset from externally loaded file.")
                    console.log("=======================================================================>")
                    
                    // (1) pass in csv files,
                    // (2) load into arrays and display in console, using readDataInputCSVfile() method
                    // note: readDataInputCSVfile() is a an optimised method for reading CSV data into "Tensor"
                    const fileNameX = this.inputTensorFromCSVFileX;
                    const fileNameY = this.inputTensorFromCSVFileY;
                    //x = readDataInputCSVfile(fileNameX, pathTofileX)
                    //y = readDataInputCSVfile(fileNameY, pathTofileY)
                }
                else if(this.fileOption === "MongoDB")
                {
                    // (1) pass in data extracted (with query/MapReduce) from MongoDB server
                    // (2) load into arrays and display in console, using readDataInputMongoDB() method
                    // note: readDataInputMongoDB() is an optimised method for reading MongoDB data into "Tensor"
                    const collectionName = this.mongDBCollectionName;
                    const specifiedDataArrayX = this.mongDBSpecifiedDataArrayX;
                    const specifiedDataArrayY = this.mongDBSpecifiedDataArrayY;
                    //x = readDataInputMongoDB(collectionName, specifiedDataArrayX)
                    //y = readDataInputMongoDB(collectionName, specifiedDataArrayY)
                }
                
            }
                            
            //create model (main engine) with IIFE
            const reModel = (function createDNNRegressionModel()
            {
                //create layers
                const layerOptionsOne = {units: 100, inputShape: [inputSize], activation: 'softmax'};
                const layerOptionsTwo = {units: 100, activation: 'tanh'};
                const layerOptionsThree = {units: 1, activation: 'linear'};
                const dropoutRate = 0.02;
                
                // add layers and dropouts
                model.add(tf.layers.dense(layerOptionsOne));
                model.add(tf.layers.dropout(dropoutRate));
                model.add(tf.layers.dense(layerOptionsTwo));
                model.add(tf.layers.dropout(dropoutRate));
                model.add(tf.layers.dense(layerOptionsThree));
                
                //speficy options
                const compileOptions = {optimizer: 'adam', loss: 'meanSquaredError', metrics: ['accuracy']};
                
                //compile model
                model.compile(compileOptions);
                
                //return model
                return model;
            }());
                            
                        
            // begin training: train the model using the data and time it
            const beginTrainingTime = new Date();
            console.log(" ")
            console.log("...............Training Begins.................................")
            
            reModel.fit(x, y,
            {
                batchSize: batchSize,
                epochs: epochs,
                validationSplit: validationSplit,   // for large dataset, set about 10% (0.1) aside
                verbose: verbose,                   // 1 for full logging verbosity, and 0 for none
                callbacks:                          // customized logging verbosity
                {
                    onEpochEnd: async function (epoch, logs)
                    {
                        console.log("Epoch = ", epoch, " Loss = ",  parseFloat(logs.loss), " Accuracy = ", parseFloat(logs.acc));
                    }
                }
                                
            }).then(function()
            {
                ShaleReservoirProductionPerformance.runTimeDNN(beginTrainingTime, "Training Time");
                // begin prediction: use the model to do inference on data points
                var beginPredictingTime = new Date();
                var predictions = reModel.predict(x);
                // print outputs
                console.log("Expected result in TF format:");
                y.print(true);
                console.log("Actual result in TF format :")
                reModel.predict(x).print(true);
                ShaleReservoirProductionPerformance.runTimeDNN(beginPredictingTime, "Predicting Time");
                console.log("Final Model Summary");
                reModel.summary()
            }).catch(function(err)
            {
                if(err) {console.log(err, " : Tensor flow rejection error successfully handled.");};
            });
        }
    }

    testProductionPerformace(xInputTensor, yInputTensor)
    {
        const modelingOption = "dnn";
        const fileOption  = "default";
        const gpuOption = false;
        const batchSize = 32;
        const epochs = 100;
        const validationSplit = 0.1;
        const verbose = 0;
        const inputSize = 13;
        const inputDim = 100;
        //invoke dnn for Shale Reservoir Production Performace
        const test = new ShaleReservoirProductionPerformance(modelingOption, fileOption, gpuOption, xInputTensor, yInputTensor);
        test.productionPerformace(batchSize, epochs, validationSplit, verbose, inputDim, inputSize);
    }
}

new ShaleReservoirProductionPerformance("dnn", "csv", true, null, null, null, null, null).testProductionPerformace(null, null)

module.exports = {ShaleReservoirProductionPerformance}
