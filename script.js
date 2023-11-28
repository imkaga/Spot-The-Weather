const apiKey = "85f93b7e11258cb2617c3f745ecf3349";
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?&units=metric&q=";

const searchBox = document.querySelector(".search input");
const searchBtn = document.querySelector(".search button");
const weatherIcon = document.querySelector(".weather-icon");

        async function checkWeather(city){
            try {
                const response = await fetch(apiUrl + city + `&appid=${apiKey}`);

                // Error jeśli wpiszesz złą nazwę miejscowości

                if(response.status == 404){
                    document.querySelector(".error").style.display = "block";
                    document.querySelector(".weather").style.display = "none";
                }else{
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
    
                    const data = await response.json();
                    /* console.log(data); */
    
                    // Wyświetlanie wartości z API
                    // Miasto, temperatura, wilgotność, prędkość wiatru
                    // Pozostałe wartości dostępne z API: https://openweathermap.org/current

                    document.querySelector(".city").innerHTML = data.name;
                    document.querySelector(".temp").innerHTML = Math.round(data.main.temp) + "°C";
                    document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
                    document.querySelector(".wind").innerHTML = data.wind.speed + " km/h";
    
                    /*
                    Opis IF:
                    Jeżeli data.weather[0].main == "Warunek Pogodowy"
                    Można to dostosowac do innych bardziej specyficznych warunków lub kilka wartości np. inny mood jesli jest deszcz i gorąco/lato niż jak deszcz i zimno/jesień
                    */

                    if(data.weather[0].main == "Clouds"){
                        weatherIcon.src = "images/clouds.png"
                    }
                    else if(data.weather[0].main == "Clear"){
                        weatherIcon.src = "images/clear.png"
                    }
                    else if(data.weather[0].main == "Rain"){
                        weatherIcon.src = "images/rain.png"
                    }
                    else if(data.weather[0].main == "Drizzle"){
                        weatherIcon.src = "images/drizzle.png"
                    }
                    else if(data.weather[0].main == "Mist"){
                        weatherIcon.src = "images/mist.png"
                    }
    
                    document.querySelector(".weather").style.display = "block";
                    document.querySelector(".error").style.display = "none";
                }

                

            } catch (error) {
                console.error(error);
            }
        }


    searchBtn.addEventListener("click", ()=>{
        checkWeather(searchBox.value);
    })
