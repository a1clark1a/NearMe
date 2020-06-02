"use strict"
//GLOBAL VARS
const yelpBaseUrl = "https://api.yelp.com/v3/businesses/search"
const proxyUrl = "https://cors-anywhere.herokuapp.com/"
const categoryList = "../categoryJson.json" //"https://www.yelp.com/developers/documentation/v3/all_category_list/categories.json";
let category = []
let matchedList = []

//Get CategoryList using Async function
async function getList() {
  //if URL is used to fetch the categoryList add proxyUrl at the start
  const resp = await fetch(categoryList)
  category = await resp.json()
}

//Filter the category list
function filterList(searchText) {
  //Match the users input
  matchedList = category.filter((category) => {
    const regex = new RegExp(`^${searchText}`, "gi")
    return (
      category.title.match(regex) ||
      category.alias.match(regex) ||
      category.parents.forEach((elem) => elem.match(regex))
    )
  })

  //clear list if there is no input
  if (searchText.length === 0) {
    clearCategList()
  }
  displayList(matchedList)
}

//display the list that matches the user's input
function displayList(list) {
  clearCategList()
  if (list.length > 0) {
    list.forEach((elem) => {
      const parentList = elem.parents.map((parent) => parent).join(",")
      $(".categ_list").append(
        `<div class="auto_searchList">
                    <button class="drop_list" type="button" value="${elem.title} ${parentList}">${elem.title} ${parentList}</button>
                    </div>`
      )
    })
  }
}

//function to empty the list and clear the html category list
function clearCategList() {
  matchedList = []
  $(".categ_list").empty()
}

//Check user input
function checkInput() {
  //Check the users text input
  $(".cat_input").keyup((key) => {
    filterList($(".cat_input").val())
    //If user presses enter on the category input clear the category list drop down
    if (key.keyCode === 13 || key.which === 13) {
      clearCategList()
    }
  })

  //When user clicks on an item in the category list set its value to the category input value and clear the list
  $(".categ_list").on("click", ".drop_list", (e) => {
    $(".cat_input").val($(e.target).val())
  })

  //When user clicks anywhere clear the category list
  $("html").on("click", () => {
    clearCategList()
  })

  //When user clicks more option , show more form options for more customized inputs
  $(".moreOpt_btn").on("click", () => {
    $(".label_radius").removeAttr("hidden")
    $(".label_num").removeAttr("hidden")
    $(".moreOpt_btn").hide()
  })

  //local variable to be used to check if user allowed web page to track location
  let canITrack = true
  $(".search_btn").on("click", (e) => {
    console.log("click")
    //local variables for easy access to user inputs
    const location = $(".loc_input").val()
    const srchRadius = $(".radius_input").val() * 1600 //meter per mile;
    const categoryVal = $(".cat_input").val().toLowerCase()

    //on click prevent default submit behaviour
    e.preventDefault()
    //clear the category list
    clearCategList()
    //Check for proper radius  input
    if (srchRadius > 40000) {
      alert("Can't be greater than 25 miles")
    } else if (srchRadius <= 0) {
      alert("Can'tbe a negative number")
    } else {
      //if values passed
      //Check if user allowed web page to track location
      if (canITrack) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const latitude = position.coords.latitude
            const longitude = position.coords.longitude

            //call getResults once position is taken
            getResults(latitude, longitude, srchRadius, categoryVal)
          },
          (error) => {
            //Error handling for geolocation anomalies
            switch (error.code) {
              case error.PERMISSION_DENIED:
                //MAIN error handling for when user denies tracking
                //reveal manual location input form and change canITrack variable to false
                $(".loc_input").removeAttr("hidden")
                canITrack = false
                break
              case error.POSITION_UNAVAILABLE:
                console.log("Location cannot be found")
                $(".loc_input").removeAttr("hidden")
                canITrack = false
                displayError(error)
                break
              case error.TIMEOUT:
                console.log(
                  "The request to get the user location has timed out"
                )
                $(".loc_input").removeAttr("hidden")
                canITrack = false
                displayError(error)
                break
              case error.UNKNOWN_ERROR:
                console.log("An unknown error occured")
                $(".loc_input").removeAttr("hidden")
                canITrack = false
                displayError(error)
                break
            }
          }
        )
      } else {
        //If user denies web app to get user location, check if user manually inputs location
        if (location === "" || location === null || location === undefined) {
          alert("Location input must not be empty")
        } else {
          //Manual location input call for getResults
          getResults(0, 0, srchRadius, categoryVal, location)
        }
      }
    }
  })
}

//function to scroll smoothly when user clicks on the main button
function smoothScrollToResults() {
  const hash = $(".search_btn").parent().attr("href")
  $("html, body").animate(
    {
      scrollTop: $(hash).offset().top,
    },
    100,
    () => {
      window.location.hash = hash
    }
  )
}

//Format the fetch url to the correct GET request format
function formatQueryParam(param) {
  const queryItems = Object.keys(param).map(
    (key) => `${encodeURIComponent(key)}=${encodeURIComponent(param[key])}`
  )
  return queryItems.join("&")
}

//Main Function to call the GET request(fetch) to get the search result
function getResults(lat = 0, long = 0, radius, category, loc = 0) {
  //query param object declaration and assignment
  const params = {
    latitude: lat,
    longitude: long,
    radius: radius,
    limit: 50,
    term: category,
    location: loc,
  }

  //Authorization object
  const options = {
    headers: new Headers({
      Authorization:
        "Bearer GeANjLFrnFDx0ZGLrvFbiIAIhxCQ_9H28KVRqlspJbtQH2uWXdCL_6SXJelFHIX8OxxWjn2XfCf56DYxRyKpWScFR056yPTxQwH0KLbdSyxY605MygXZPAbKmLu_XXYx",
    }),
  }

  //Call formatQueryParam function to format url get request and assign to a variable
  const queryString = formatQueryParam(params)
  //then set the combined variables to form the full fetch url
  const fetchUrl = `${proxyUrl}${yelpBaseUrl}?${queryString}`

  //call the fetch function and pass the fetch url and authorization to complete the GET requests
  //handle the appropriate responeses and error handling
  //depending on respone either display search results or display error
  fetch(fetchUrl, options)
    .then((Response) => {
      if (Response.ok) {
        return Response.json()
      }
      throw new Error(Response.statusText)
    })
    .then((ResponseJson) => {
      displayResult(ResponseJson)
    })
    .catch((err) => {
      displayError(err)
    })
}

//display search results by appending the result from the fetch to the DOM
function displayResult(jsonObj) {
  clearDisplay()

  if (jsonObj.businesses.length === 0) {
    const TextError = {
      message: "No Search found",
    }
    displayError(TextError)
  } else {
    //look through the jsonObj.businesses
    for (let i = 0; i < jsonObj.businesses.length; i++) {
      const businesses = jsonObj.businesses[i]
      const service = businesses.transactions.join(", ")
      console.log(service)
      $(".result_list").append(
        `<li>
                    <ul class="container">
                        <li>
                            <div class="img_cont">
                                <a href="${businesses.url}" target="_blank">
                                    <img class="result_img img${i}" src="${
          businesses.image_url
        }" alt="${businesses.alias}">
                                    <h3 class="yelp_link">Read More...</h3>
                                </a>
                            </div>
                        </li>
                        <li><ul class="info_list">
                            <li><h3>${businesses.name}</h3></li>
                            <li><img class="stars" src="images/small_${
                              businesses.rating
                            }.png" alt="${businesses.rating}"></li>
                            <li>Price: <code>${businesses.price}</code></li>
                            <li>Distance: ${Math.round(
                              businesses.distance * 0.000621371
                            )} Miles</li>
                            <li>Service: ${
                              service.length > 0
                                ? service.replace("_", " ")
                                : "Dine-in"
                            }</li>
                            <li>Reviews: ${businesses.review_count}</li>
                            
                       </ul></li>
                    </ul>
                </li>
                `
      )
    }
  }

  $(".display").removeAttr("hidden")
  smoothScrollToResults()
}

//display error result by appending the cause of error into the DOM to be displayed
function displayError(error) {
  clearDisplay()
  $(".error_sect").append(
    `<h2 class="error_txt">Uh oh Something went wrong! ${error.message}</h2>`
  )
  $(".error_sect").removeAttr("hidden")
}

//clear the result display
function clearDisplay() {
  $(".result_list").empty()
  $(".error_sect").empty()
}

//ONLOAD CALL
$(checkInput(), getList())
