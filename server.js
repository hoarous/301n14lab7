'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const app = express();

// get the specified port from our environmental variables
// if there is nothing specified, use port 3000
const PORT = process.env.PORT || 3000;

// tell the server to look in the public folder
// for any routes or static files such as html, images etc...
app.use(express.static('./public'));
app.use(cors());

// Weather. Return data located in data/darksky.json.
app.get('/weather', (request, response) =>{
  try{
    let weatherData = require('./data/darksky.json');
    let weather = weatherData.daily.data.map((day) => new Weather(day));
    response.send(weather);
  } catch(error){
    console.log(`There was an error getting the weather: ${error}`);
    response.status(500).send('No weather here');
  }
});

// located in our data folder
app.get('/location', (request,response) =>{
  try{
    // let locationData = require('./data/geo.json');
    // let loc = new Location (locationData.results);
    searchLatLong(request.query.data)
      .then(loc => response.send(loc));
  } catch(error){
    console.log('There was an error getting the location!');
    response.status(500).send('No location data here');
  }
});

function Location(query, data) {
  this.search_query = query;
  // this.data = data;
  this.name = data.body.results[0].formatted_address;
  this.latitude = data.body.results[0].geometry.location.lat;
  this.longitude = data.body.results[0].geometry.location.lng;
}

function searchLatLong(query){
  const url =`https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.GEOCODE_API_KEY}`;
  return superagent.get(url)
    .then(res => {
      return new Location(query, res);
    });
}

// TODO: Change to pull weather day objects.
function Weather(query) {
  // this.data = query;
  this.forecast = query.summary;
  this.time = new Date(query.time*1000).toDateString();
}

//when we connect to the port, tell us what port we are listening too
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
