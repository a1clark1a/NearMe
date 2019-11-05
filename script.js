"use strict"
//GLOBAL VARS
const yelpBaseUrl = 'https://api.yelp.com/v3/businesses/search';
const proxyUrl = 'https://cors-anywhere.herokuapp.com/';

//ONLOAD CALL
$(checkInput());

//Check user input 
function checkInput() {

    //local variable to be used to check if user allowed web page to track location
    let canITrack = true;
    $('.search_btn').on('click', e =>
    {
        //local variables for easy access to user inputs
        const location = $('.loc_input').val();
        const srchRadius = $('.radius_input').val() * 1600 //meter per mile;
        const maxSrch = $('.numSearch_input').val();
        
        //on click prevent default submit behaviour
        e.preventDefault();
        
        //Check for proper radius and max search input
        if(srchRadius > 40000 || srchRadius <= 0 || maxSrch <= 0 || maxSrch > 50)
        {
            alert("Check your input values");
        }
        else
        {
            //if values passed
            //Check if user allowed web page to track location
            if(canITrack)
            {
                navigator.geolocation.getCurrentPosition(position =>
                    {
                        const latitude = position.coords.latitude;
                        const longitude = position.coords.longitude;

                        //call getResults once position is taken
                        getResults(latitude,longitude,srchRadius, maxSrch);
                    }, error =>
                    {
                        //Error handling for geolocation anomalies
                        switch(error.code)
                        {
                            case error.PERMISSION_DENIED:
                                //MAIN error handling for when user denies tracking
                                //reveal manual location input form and change canITrack variable to false
                                $('.manual_loc').removeAttr('hidden');
                                canITrack = false;
                                break;
                            case error.POSITION_UNAVAILABLE:
                                console.log("Location cannot be found");
                                displayError(error);
                                break;
                            case error.TIMEOUT:
                                console.log("The request to get the user location has timed out");
                                displayError(error);
                                break;
                            case error.UNKNOWN_ERROR:
                                console.log("An unknown error occured");
                                displayError(error);
                                break;
                        }
                    });
            }
            else{
                //Manual location input call for getResults
                getResults(0, 0,srchRadius, maxSrch, location);
                
            }
         
        }
      
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
function getResults(lat = 0, long = 0, radius, maxSrch, loc = 0)
{
    //query param object declaration and assignment
    const params = {
        latitude: lat,
        longitude: long,
        radius: radius,
        limit: maxSrch,
        location: loc
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
            displayResult(ResponseJson);
            })
        .catch(err => {
            displayError(err);
        });
}


//display search results by appending the result from the fetch to the DOM
function displayResult(jsonObj)
{
    clearDisplay();

    //look through the jsonObj.businesses
    for(let i=0; i < jsonObj.businesses.length; i++)
    {
        const businesses =  jsonObj.businesses[i];
        $('.result_list').append(
            `<li>
                <ul>
                    <li>${businesses.name}</li>
                    <li>Rating: ${businesses.rating}</li>
                    <li>Price: ${businesses.price}</li>
                    <li>
                        <div class="img_cont">
                            <a href="${businesses.url}" target="_blank">
                                <img class="result_img img${i}" src="${businesses.image_url}" alt="${businesses.alias}">
                            </a>
                        </div>
                    </li>
                </ul>
            </li>
            `
        )
    }
    $('.display').removeAttr('hidden');
}

//display error result by appending the cause of error into the DOM to be displayed
function displayError(error)
{
    clearDisplay();
    $('.error_sect').append(`<h2 class="error_txt">Uh oh Something went wrong! ${error.message}</h2>`)
    $('.error_sect').removeAttr('hidden');
}

//clear the result display 
function clearDisplay()
{
    $('.result_list').empty();
    $('.error_sect').empty();
}