/* @License Starts
 *
 * Copyright © 2015 - present. MongoExpUser
 *
 * License: MIT - See: https://github.com/MongoExpUser/Shale-Reservoir-DNN/blob/master/LICENSE
 *
 * @License Ends
 *
 *
 * ...Ecotert's ShaleReservoirPrediction.js (released as open-source under MIT License) implements:
 *
 * Shale Reservoir Production Performance with Tensorflow-Based Deep Neural Network (DNN).
 *
 * This module is a Tensorflow-Based DNN Model for hydraulically-fractured-driven production performance prediction of shale reservoirs in the cloud.
 * It is based on Node.js with option to use either gpu or cpu.
 * It can also be adapted for use in the browser with the tfjs-vis library enabled for browser visualization.
 *
 *
 * 1) Obtain a set of hyper-parameters for the DNN architecture per: well, pad and section/DA.
 * 2) Then: (a) compare across field-wide production and (b) generate type curves per: well, pad and section/DA.
 * 3) Target output: Cumulative production @ time, t (30 180, 365, 720, 1095, ...1825 days)
 *     a) BOE in MBoe
 *     b) Gas in MMScf
 *     c) Oil in M barrel
 * 4) Target inputs:
 *     a) Richness/OHIP-Related: so, phi, h, TOC
 *     b) Reservoir Flow Capacity-Related, Permeability and pore size (micro, nano and pico)
 *     c) Drive-Related: TVD/pressure,
 *     d) Well Completion-Related: Well lateral length, No. of stages, proppant per ft, well spacing (for multi-wells)
 *     e) Fluid Type-Related: SG/Density/API, Ro/maturity level,
 *     f) Stress Field-Related: Direction of minimum principal stress (Sm), fracture directional dispersity (90 deg is best, 0 deg is worst);
 *         Note: Hydraulic fractures tend to propagate in direction perpendicular to the directions of minimum principal stress.
 *         Note: Hence, fracture directional dispersity = Sm - Sw (well direction), correct to maximum degree of 90.
 */

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
        let tf = require('@tensorflow/tfjs');    //pure JavaScript version
        
        if(this.gpuOption === true)
        {
            tf = require('@tensorflow/tfjs-node-gpu');  //c/c++ binding, gpu option
        }
        else
        {
            tf = require('@tensorflow/tfjs-node');      //c/c++ binding, cpu option
        }

        const model = tf.sequential();
        return {fs:fs, util:util, tf:tf, tfvis:tfvis, model:model};
    }
    
    productionPerformace(batchSize, epochs, validationSplit, verbose, inputDim, inputSize, dropoutRate,
                         unitsPerHiddenLayer, unitsPerOutputLayer, inputLayerActivation, outputLayerActivation,
                         hiddenLayersActivation, numberOfHiddenLayers, optimizer, loss, metrics)
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
                x = tf.truncatedNormal ([inputDim, inputSize], 1, 0.1, "float32", 0.4);
                y = tf.truncatedNormal ([inputDim, 1], 1, 0.1, "float32", 0.4);
            }
            else
            {
                //use data from (a) "csv" file or (b) data extracted from MongoDB server
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
                    // (2) load into arrays and display/check in console, using readDataInputCSVfile() method
                    // note: readDataInputCSVfile() is a an optimised method for reading CSV data into "Tensor"
                    // note: readDataInputCSVfile() is accessible from a module on the Node.js server hosting the application
                    const fileNameX = this.inputTensorFromCSVFileX;
                    const fileNameY = this.inputTensorFromCSVFileY;
                    const pathTofileX = "./";
                    const pathTofileY = "./"
                    //x = readDataInputCSVfile(fileNameX, pathTofileX)
                    //y = readDataInputCSVfile(fileNameY, pathTofileY)
                }
                else if(this.fileOption === "MongoDB")
                {
                    // (1) pass in data extracted (with query/MapReduce) from MongoDB server
                    // (2) load into arrays and display/check in console, using readDataInputMongoDB() method
                    // note: readDataInputMongoDB() is an optimised method for reading MongoDB data into "Tensor"
                    // note: readDataInputMongoDB() is accessible from a module on the Node.js server hosting the application
                    const collectionName = this.mongDBCollectionName;
                    const specifiedDataArrayX = this.mongDBSpecifiedDataArrayX;
                    const specifiedDataArrayY = this.mongDBSpecifiedDataArrayY;
                    //x = readDataInputMongoDB(collectionName, specifiedDataArrayX)
                    //y = readDataInputMongoDB(collectionName, specifiedDataArrayY)
                }
            }
                            
            //create model (main engine) with IIFE
            //TensorFlow.js' equivalent of Keras' feed-forward DNN =>
            //"tf.layers" in JavaScript/Node.js version is equivalent to "tf.keras.layers" in Python version
            const reModel = (function createDNNRegressionModel()
            {
                //create layers.....
                const inputLayer = {units: unitsPerHiddenLayer, inputShape: [inputSize], activation: inputLayerActivation};
                let hiddenLayers = [];
                for(let i = 0; i < numberOfHiddenLayers; i ++)
                {
                    hiddenLayers.push({units: unitsPerHiddenLayer, activation: hiddenLayersActivation})
                }
                const outputLayer = {units: unitsPerOutputLayer, activation: outputLayerActivation};
                
                //add layers and dropouts......
                model.add(tf.layers.dense(inputLayer));
                model.add(tf.layers.dropout(dropoutRate));
                for(let eachLayer in hiddenLayers)
                {
                    model.add(tf.layers.dense(hiddenLayers[eachLayer]));
                    model.add(tf.layers.dropout(dropoutRate));
                }
                model.add(tf.layers.dense(outputLayer));
                
                //specify compilation options....
                const compileOptions = {optimizer: optimizer, loss: loss, metrics: [metrics]};
                
                //compile model
                model.compile(compileOptions);
                
                //return model.....
                return model;
            })();
                                   
            // begin training: train the model using the data and time the training
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
                        console.log("Epoch = ", epoch,
                                    " Loss = ",  parseFloat(logs.loss),
                                    " Acc = ", parseFloat(logs.acc),
                                    " Allocated Mem (MB) = ", (tf.memory().numBytes)/1E+6
                                    );
                    }
                }
                
            }).then(function()
            {
                console.log("........Training Ends......................................")
                ShaleReservoirProductionPerformance.runTimeDNN(beginTrainingTime, "Training Time");
                
                // begin prediction: use the model to do inference on data points
                var beginPredictingTime = new Date();
                var predictions = reModel.predict(x);
                
                // print outputs
                console.log("Expected result in Tensor format:");
                y.print(true);
                
                console.log("Actual result in Tensor format :")
                reModel.predict(x).print(true);
                
                ShaleReservoirProductionPerformance.runTimeDNN(beginPredictingTime, "Predicting Time");
                console.log("Final Model Summary");
                reModel.summary();
                
            }).catch(function(error)
            {
                if(error)
                {
                    console.log(error, " : TensorFlow error successfully intercepted and handled.");
                };
            });
        }
    }

    testProductionPerformace()
    {
        //algorithm type, computer processing option and data loading parameters
        const modelingOption = "dnn";
        const fileOption  = "default";
        const gpuOption = true;
        const inputTensorFromCSVFileX = null;
        const inputTensorFromCSVFileY = null;
        const mongDBCollectionName = null;
        const mongDBSpecifiedDataArrayX  = null;
        const mongDBSpecifiedDataArrayY  = null;
        
        //training parameters
        const batchSize = 32;
        const epochs = 50;
        const validationSplit = 0.1;
        const verbose = 0;
        
        //model contruction parameters
        const inputSize = 13;         //number of parameters (number of col - so, phi, h, TOC, perm, pore size, well length, etc.)
        const inputDim = 100;         //number of datapoint  (number of row)
        const dropoutRate = 0.02;
        const unitsPerHiddenLayer = 200;
        const unitsPerOutputLayer = 1;
        const inputLayerActivation = "softmax";
        const outputLayerActivation = "linear";
        const hiddenLayersActivation = "tanh"
        const numberOfHiddenLayers = 4;
        const optimizer = "adam";
        const loss = "meanSquaredError";
        const metrics = "accuracy";
        
        
        // NOTE:generalize to each time step: say  90, 365, 720 and 1095 days
        // ==================================================================
        // implies: xInputTensor and yInputTensor contains 5 Tensors, representing:
        // input tensors for 30, 90, 365, 720 and 1095 days, respectively
        
        //array (list) of input tensors for test
        let xInputTensor = [];
        let yInputTensor = [];
        const timeStep = 5;
        const commonModules = ShaleReservoirProductionPerformance.commonModules()
        const tf = commonModules.tf;
    
        //run model by timeStep
        for(let i = 0; i < timeStep; i++)
        {
            //first: create tensors at each timeStep for testing: format => (shape, mean, stdDev, dtype, seed)
            xInputTensor.push(tf.randomNormal([inputDim, inputSize], 0.0, 1.0, "float32", 0.1));
            yInputTensor.push(tf.truncatedNormal ([inputDim, 1], 1, 0.3, "float32", 0.05));
            
            //2nd: invoke productionPerformance() method on srpp() class
            const srpp = new ShaleReservoirProductionPerformance(modelingOption, fileOption, gpuOption, xInputTensor[i],
                                                                 yInputTensor[i], mongDBCollectionName, xInputTensor[i],
                                                                 yInputTensor[i])
            srpp.productionPerformace(batchSize, epochs, validationSplit, verbose, inputDim, inputSize,dropoutRate,
                                                                 unitsPerHiddenLayer, unitsPerOutputLayer, inputLayerActivation,
                                                                 outputLayerActivation, hiddenLayersActivation, numberOfHiddenLayers,
                                                                 optimizer, loss, metrics)
        }
    }
}


//run test
function testSRPP(test)
{
    if(test === true)
    {
        const srpp = new ShaleReservoirProductionPerformance().testProductionPerformace();
    }
    
    //note: all results at every timeStep are generated asychronically (non-blocking): beauty of TensorFlow.js/Node.js combo !!!!.....
}

testSRPP(true);
//testSRPP("doNotTest");



module.exports = {ShaleReservoirProductionPerformance};
