import { useState, useEffect } from "react"
import './App.css'

function App() {

  const [city, setCity ] = useState('')
  const [weather, setWeather ] = useState(null)
  const [loading, setLoading ] = useState(false)
  const [error, setError ] = useState('')
  const [suggesstions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const apiKey = 'c44fdb2b916d9f5ef5689f4134191b6b'

  const fetchWeather = async() => {
    if(city === '') return;
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`)
      const data = await response.json()
      if(response.ok){
        setWeather(data)
        setError('')
      }else{
        setWeather(null)
        setError(data.message)
      }
    } catch (err) {
      setError('Something went wrong...')
    }
    setLoading(false)
  }

  const fetchWeaterbyLoc = async (lat, lon) =>{
    try {
      const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=c44fdb2b916d9f5ef5689f4134191b6b&units=metric`)
      const data = await res.json()
      setWeather(data)
      setError('')
    } catch (error) {
      setWeather(null)
      setError('Failed to fetch weather by location')
    }

    
  }

  const fetchSuggestions = async(query) =>{
    if(!query){
      setSuggestions([])
      return;
    }

    try {
      const res = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${apiKey}`)
      const data = await res.json()
      setSuggestions(data)
      setShowSuggestions(true)
    } catch (error) {
      console.error('Error fetching suggestions:',error)
    }
  }

  useEffect(()=>{
    if("geolocation" in navigator){
      navigator.geolocation.getCurrentPosition(
        (position) =>{
          fetchWeaterbyLoc(
            position.coords.latitude,
            position.coords.longitude
          )
        },
        (error) =>{
          console.warn("Location access denied or failed:", error.message);
        }
      )
    }else{
      setError("not support")
    }
  },[])

  return (

    <div className="container">
      <h1>Weather App⛅</h1>
      <div>
      <div className="search-box">
      <div className="input-location-wrapper">
        <input
          type="text"
          placeholder="Enter city"
          value={city}
          onChange={(e) => {
            const value = e.target.value;
            setCity(value);
            fetchSuggestions(value);
          }}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          onFocus={() => city && setShowSuggestions(true)}
        />

      <div className="tooltip-wrapper">
        <button
          className="location-btn"
          onClick={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (pos) => {
                  fetchWeaterbyLoc(pos.coords.latitude, pos.coords.longitude);
                },
                (err) => {
                  setError("Location access denied");
                }
              );
            } else {
              setError("Geolocation not supported");
            }
          }}
        >
          📍
        </button>
        <span className="tooltip-text">Use My Location</span>
        </div>
      </div>

      {showSuggestions && suggesstions.length > 0 && (
        <ul className="suggesstion-list">
          {suggesstions.map((item, index) => (
            <li
              key={index}
              onClick={() => {
                setCity(item.name);
                setShowSuggestions(false);
              }}
            >
              {item.name}, {item.state ? `${item.state}, ` : ''}{item.country}
            </li>
          ))}
        </ul>
      )}
    </div>
      <div className="get-weather-btn">
      <button onClick={fetchWeather}>Get Weather</button>
      </div>
      </div>


{loading && <p>Loading....</p>}
{error && <p style={{color:'red'}}>{error}</p>}

      {
        weather && weather.main && !loading &&(
          <div className="weather-card fade-in">
            <h2>{weather.name}, {weather.sys.country}</h2>
            <img src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`} alt={weather.weather[0].description} />
            <p>{weather.weather[0].main}</p>
            <p>Temperature: {weather.main.temp}°C</p>
            <p>Feels Like: {weather.main.feels_like}°C</p>
            <p>Humidity: {weather.main.humidity}%</p>
            <p>Wind Speed: {weather.wind.speed} m/s</p>
          </div>
        )
      }
    </div>
  )
}

export default App
