var request = require('request'); //Package For HTTP
var cheerio = require('cheerio'); //Package For Jquery-Traversing
var mongoose = require('mongoose'); //Package For MongoDB
var express = require('express'); //Package For Web Framework, RestAPI
var bodyParser = require('body-parser'); //MiddleWare

const router = express.Router(); // get an instance of the express Router
const app = express(); // set up express app

//Parsing The Incoming Request (used as Middleware)
app.use(bodyParser.json()); 

// Loading Front End Page
app.use(express.static('public'));

// Initialize routes - API
app.use(router);

//error handling middleware (e.g. - bodyparser)
app.use(function(err, req, res, next){
    console.log(err);
});

// listen for request
app.listen(4000, function(){
    console.log('listening for requests at Port 4000 on Local Host');
    console.log('Connecting to Databse');
});

//Connect to the database MongoDB
mongoose.connect('mongodb://test:test123@ds261470.mlab.com:61470/shypaldb', function()
    { console.log('Connected To Database'); });




//Creating a Schema For MongoDB (Structure in which data will be saved)
 var restSchema = new mongoose.Schema(
     {
        itemName: {
                    type: String 
                  },
        itemDesc: {
                    type: String 
                  },
        price : {
                    type: String
                },
        restName: {
                    type : String
                  },
        restDetails: {
                     type : String
                     },
        timeStamp: {
                    type : String
                    }
    });

    // Creating Index Based on Schema IN DB Inorder To Use Text Search of MongoDB
    restSchema.index({itemName: "text", itemDesc: "text"});

//  Creating Models For All Restaurants Based On Schema
    var restOneModel = mongoose.model('restaurant1', restSchema); //Model For Restaurant 1
    var restTwoModel = mongoose.model('restaurant2', restSchema); //Model For Restaurant 2
    var restThreeModel = mongoose.model('restaurant3', restSchema); //Model For Restaurant 3


//-----------------------------------------------Crawling & Database-----------------------------------------------------

// Traversing And Extracting Restaurant 1
var restaurantOne = {};

function crawlRestOneData()
{   
    // Removing The Existing Data Inorder To Update the Database With New Data
    restOneModel.remove({}, function(err)  
    {
        if(err){ throw err; }
        // else {console.log('Restaurant ONE Data removed from db');}
    });
    // restOneModel.collection.drop();

    // Crawling RestaurantOne Data
    var url = 'https://tillmanns-chemnitz.de/speisekarte'
    request(url, function (err, response, html) 
    {
        if(!err)
        {                
            var $ = cheerio.load(html);
            var dataList = $('.container #product .row');
            dataList.each(function(index)
            {
                restaurantOne.itemName = $('.col-md-10').find('h4').eq(index).text().trim();
                restaurantOne.itemDesc = $('.col-md-10').find('p').eq(index).text().trim();
                restaurantOne.price = $('.text-right').find('p').eq(index).text().trim();
                restaurantOne.restName = "TILLMANN'S";
                restaurantOne.restDetails = "TILLMANN'S. Address: In Terminal 3, Brückenstraße 17, 09111 Chemnitz. opening hours: Monday - Friday - from 11.00 am. Kontakt: 0371 355 87 63 ";
                restaurantOne.timeStamp = new Date();

                // Saving Crawled Data to Database  
                restOneModel.create(restaurantOne, function(err)
                {
                     if (err) { throw err; }                    
                });

            });
            console.log('Restaurant One Data Saved Into DB');
        }
    });

}


// Restaurant 2

// Traversing And Extracting Restaurant 2
var restaurantTwo ={};

function crawlRestTwoData()
{

    var url = 'http://www.schroedingers.de/speisekarte-schroedingers'
    request(url, function(err, response, html)
    { 
        if(!err)
        {
            // Removing The Existing Data Inorder To Update the Database With New Data            
            restTwoModel.collection.remove({}, function(err)
            {
                if(err){ throw err; }
                // else {console.log('Restaurant TWO Data removed from db');}
            });
            // restTwoModel.collection.drop();

            // Crawling RestaurantTwo Data
            var $ = cheerio.load(html);
            var dataList2 = $('.pmtitle');
            dataList2.each(function(index)
            {
                restaurantTwo.itemName = $('.pmtitle').eq(index).text().trim();
                restaurantTwo.price = $('.pmprice').eq(index).text().trim();
                restaurantTwo.restName = 'Bistro Schroeders';
                restaurantTwo.restDetails = 'Bistro Schroeders Helmholtzstrasse 23 10587 Berlin. Opening hours: Mon - Fri: 11:00 - 16:00. Phone: 0160 34 855 38';
                restaurantTwo.timeStamp = new Date();
                // console.log(restaurantTwo);

                // Saving Crawled Data to Database
                restTwoModel.create(restaurantTwo, function(err)
                {
                    if(err) { throw err; }
                });

            });
            console.log('Restaurant Two Data Saved Into DB');        
        }
    });    
}


// Restaurant 3

// Traversing And Extracting Restaurant 3
var restaurantThree = {};

function crawlRestThreeData()
{
    
    var url = 'http://www.malula-chemnitz.de/'
    request(url, function(err, response, html)
    {
        if(!err)
        {
            // Removing The Existing Data Inorder To Update the Database With New Data
            restThreeModel.remove({}, function(err)
            {
                if(err) { throw err; }
                // else {console.log('Restaurant THREE Data removed from db');}
            });
            // restThreeModel.collection.drop();

            // Crawling RestaurantThree Data
            var $ = cheerio.load(html);
            var dataList3 = $('.menu-item');
            dataList3.each(function(index)
            {
                restaurantThree.itemName = $('.menu-item-name').eq(index).text().trim();
                restaurantThree.itemDesc = $('.menu-item-description').eq(index).text().trim();
                restaurantThree.price = $('.menu-item-price').eq(index).text().trim();
                restaurantThree.restName = 'Restaurant Malula';
                restaurantThree.restDetails = 'Restaurant Malula. Georgestraße 21, 09111 Chemnitz. OPENING HOURS: Mittwoch bis Montag. 11:00 - 14:00    17:30 - 23:00. Dienstag Ruhetag. KONTAKT: Phone: +49-371-4584958. Email: info@malula-chemnitz.de'
                restaurantThree.timeStamp = new Date();

                // Saving Crawled Data to Database
                restThreeModel.create(restaurantThree, function(err)
                {
                    if(err) { throw err; }
                });
            });
            console.log('Restaurant Three Data Saved Into DB');
        
        }
    });
}

//---------------------------------------------Crawling & Database Ends-------------------------------------------------------

//------------------------------------------------REST API---------------------------------------------------------

// Retriving All Dishes from Database
router.get('/allDishes', function(req, res)
{   
    //Combining Data From all Models 
  Promise.all(             
      [
        restOneModel.find(),
        restTwoModel.find(),
        restThreeModel.find()
      ]).then(allData => 
        {
            // Concatinating the data into Single Array
            var combinedData = allData[0].concat(allData[1]).concat(allData[2]);    
            console.log('User Requested For all the Dishes from Database');   
            res.json(combinedData);
        }).catch(err => 
            {
                console.error("something is wrong",err);
            })        
});


// Retriving Dishes Based On the User Input
router.post('/search', function(req, res)
{  
    if(req.body.name)
    {
        var srcitem = req.body.name; //Input String From User
        console.log("The Submitted String is: " + srcitem);   
        
        

        //Query For Searching Based on Letters
        /* var query = {
                        $or: [
                                {"itemName": {$regex: ".*" + srcitem + ".*", $options:"i"}},
                                {"itemDesc": {$regex: ".*" + srcitem + ".*", $options:"i"}},     
                             ]
                    }
        */
        
        //Query For Searching Based on Keywords  , $language: "de"
        var query = { $text: {$search: srcitem} } ;        
           
        // Combining Data from all models based on query
        Promise.all([
                        restOneModel.find(query),
                        restTwoModel.find(query),
                        restThreeModel.find(query)
                    ]).then(allData => 
                        {
                            // Concatinating the data into Single Array
                            var combinedData = allData[0].concat(allData[1]).concat(allData[2]); 
                            // console.log(combinedData);
                            if(combinedData == '') { console.log('keywords did not Match'); }
                            res.json(combinedData);
                        }).catch(err => 
                            {
                                console.error("something is wrong",err);
                            })    
    }
    else { console.log('Empty Data! Please Insert a String'); }
    
});

//---------------------------------------REST API Ends---------------------------------------------------------------

// Crawling Every 24 Hours 
// setInterval(function(){console.log( new Date() )},60000);
// setInterval(crawlRestOneData, 86400000);
// setInterval(crawlRestTwoData, 86400000);
// setInterval(crawlRestThreeData, 86400000);

//---------------Comment the Interval Or the calling function while excution. one of these should be commented----

// Calling Crawling Function For Testing (Disable setInterval)
crawlRestOneData();
crawlRestTwoData();
crawlRestThreeData();