package klingon.webserver;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

/**
 * The PumpStation class is essentially a Java Bean
 * class, which is used to encapsulate a number of
 * objects into a single one. Hence this class
 * encapsulates multiple WeatherData objects into
 * a single one, namely this class (the bean).
 *
 * @author Anthon Lenander
 * @version 2021-09-30
 */
@Entity
public class WeatherData
{
    @Id
    private Long id;
    private String location;
    private String weatherDescription;
    private double temperature;
    private double windSpeed;
    private double windDegree;
    private double cloudsPercentage;

    /**
     * A zero argument constructor, as per the definition of a bean
     */
    public WeatherData() { super(); }

    /**
     * Constructor for initializing a WeatherData instance.
     *
     * @param location              the location
     * @param weatherDescription    the description of the weather
     * @param temperature           the temperature
     * @param windSpeed             the wind speed
     * @param windDegree            the degree at which the wind is blowing, in degrees
     * @param cloudsPercentage      the percentage of the sky covered by clouds
     */
    public WeatherData(
            Long id, String location, String weatherDescription, double temperature,
            double windSpeed, double windDegree, double cloudsPercentage
    )
    {
        super();
        this.id = id;
        this.location = location;
        this.weatherDescription = weatherDescription;
        this.temperature = temperature;
        this.windSpeed = windSpeed;
        this.windDegree = windDegree;
        this.cloudsPercentage = cloudsPercentage;
    }

    /**
     * Method for getting the id of the WeatherData object
     *
     * @return  returns the id of the WeatherData object
     */
    public Long getId() { return this.id; }

    /**
     * Method for getting the location of the WeatherData object
     *
     * @return  returns the location of the WeatherData object
     */
    public String getLocation() { return this.location; }

    /**
     * Method for getting the weatherDescription of the WeatherData object
     *
     * @return  returns the weatherDescription of the WeatherData object
     */
    public String getWeatherDescription() { return this.weatherDescription; }

    /**
     * Method for getting the temperature of the WeatherData object
     *
     * @return  returns the temperature of the WeatherData object
     */
    public double getTemperature() { return this.temperature; }

    /**
     * Method for getting the windSpeed of the WeatherData object
     *
     * @return  returns the windSpeed of the WeatherData object
     */
    public double getWindSpeed() { return this.windSpeed; }

    /**
     * Method for getting the windDegree of the WeatherData object
     *
     * @return  returns the windDegree of the WeatherData object
     */
    public double getWindDegree() { return this.windDegree; }

    /**
     * Method for getting the cloudsPercentage of the WeatherData object
     *
     * @return  returns the cloudsPercentage of the WeatherData object
     */
    public double getCloudsPercentage() { return this.cloudsPercentage; }

    /**
     * Method for getting the WeatherData object in String format
     *
     * @return  returns the WeatherData object in String format
     */
    @Override
    public String toString()
    {
        return ("WeatherData{ " +
                "location: " + location + ", " +
                "weatherDescription: " + weatherDescription + ", " +
                "temperature: " + temperature + ", " +
                "windSpeed: " + windSpeed + ", " +
                "windDegree: " + windDegree + ", " +
                "cloudsPercentage: " + cloudsPercentage + "}");
    }
}