"use strict"
//GLOBAL VARS
const yelpBaseUrl = 'https://api.yelp.com/v3/businesses/search';
const proxyUrl = 'https://cors-anywhere.herokuapp.com/';

//ONLOAD CALL
$(checkInput());

//Check user input 
function checkInput() {

    $('.search_btn').on('click', e =>
    {
        const location = $('.loc_input').val();
        const srchRadius = $('.radius_input').val() * 1609 //meter per mile;
        const maxSrch = $('.numSearch_input').val();
        e.preventDefault();
        navigator.geolocation.getCurrentPosition(position =>
            {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                console.log(`latitude : ${latitude} and longitude: ${longitude}` )
                getResults(srchRadius, maxSrch, latitude,longitude);
            });

        
    })
}

//Format the fetch url to the correct GET request format
function formatQueryParam(param)
{
    const queryItems = Object.keys(param)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(param[key])}`)
    return queryItems.join('&');
}

//Main Function to call the GET request(fetch) to get the search result
function getResults( radius, maxSrch, lat = null, long = null)
{
    //query param object declaration and assignment
    const params = {
        //location: location,
        latitude: lat,
        longitude: long,
        radius: radius,
        limit: maxSrch
    }

    //Authorization object
    const options = {
        headers: new Headers({
            Authorization: "Bearer GeANjLFrnFDx0ZGLrvFbiIAIhxCQ_9H28KVRqlspJbtQH2uWXdCL_6SXJelFHIX8OxxWjn2XfCf56DYxRyKpWScFR056yPTxQwH0KLbdSyxY605MygXZPAbKmLu_XXYx"
        })
    };

    //Call formatQueryParam function to format url get request and assign to a variable 
    const queryString = formatQueryParam(params);
    //then set the combined variables to form the full fetch url
    const fetchUrl = `${proxyUrl}${yelpBaseUrl}?${queryString}`;

    //call the fetch function and pass the fetch url and authorization to complete the GET requests
    //handle the appropriate responeses and error handling
    //depending on respone either display search results or display error
    fetch(fetchUrl, options)
        .then(Response => {
            if(Response.ok)
            {
               
                return Response.json();
            }
            throw new Error(Response.statusText);
        })
        .then(ResponseJson =>{

            console.log(ResponseJson);
            })
}


//display search results by appending the result from the fetch to the DOM
function displayResult(jsonObj)
{

}

//display error result by appending the cause of error into the DOM to be displayed
function displayError()
{

}

//clear the result display 
function clearDisplay()
{
    
}