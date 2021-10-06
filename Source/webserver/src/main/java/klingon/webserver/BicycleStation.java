package klingon.webserver;

import javax.persistence.Entity;
import javax.persistence.Id;
import java.sql.Timestamp;

/**
 * This class contains relevant variables about the bicycle station
 * and acts as a table in the database
 *
 * @author Phong Nguyen
 * @version 2021-09-17
 */
@Entity
public class BicycleStation {

    @Id
    private Long id;
    private Double latitude;
    private Double longitude;
    private String address;
    private Integer availableBikes;
    private Timestamp lastUpdated;
    private String city;
    private String company;


    /**
     * Constructor for initializing the bicycle station instance
     * without any parameters
     */
    public BicycleStation() {
        super();
    }

    /**
     * Constructor for initializing the bicycle station instance
     * with parameters
     *
     * @param id             The Id of the bicycle station
     * @param latitude       The latitude coordination of the bicycle station
     * @param longitude      The longitude coordination of the bicycle station
     * @param address        The address of the bicycle station
     * @param availableBikes The amount of available bikes at the bicycle station
     * @param lastUpdated    The timestamp last updated
     */
    public BicycleStation(Long id, Double latitude, Double longitude, String address, Integer availableBikes,
                          Timestamp lastUpdated, String city, String company) {
        this.id = id;
        this.latitude = latitude;
        this.longitude = longitude;
        this.address = address;
        this.availableBikes = availableBikes;
        this.lastUpdated = lastUpdated;
        this.city = city;
        this.company = company;
    }

    /**
     * Method for getting the id from a BicycleStation object
     *
     * @return Returns the id of this BicycleStation
     */
    public Long getID() {
        return id;
    }

    /**
     * Method for getting the latitude from a BicycleStation object
     *
     * @return Returns the latitude of this BicycleStation
     */
    public Double getLatitude() {
        return latitude;
    }

    /**
     * Method for getting the longitude from a BicycleStation object
     *
     * @return Returns the longitude of this BicycleStation
     */
    public Double getLongitude() {
        return longitude;
    }

    /**
     * Method for getting the address from a BicycleStation object
     *
     * @return Returns the address of this BicycleStation
     */
    public String getAddress() {
        return address;
    }

    /**
     * Method for getting the amount of available bicycle from a BicycleStation object
     *
     * @return Returns the amount of available bicycle of this BicycleStation
     */
    public int getAvailableBikes() {
        return availableBikes;
    }

    /**
     * Method for getting last updated timestamp from a BicycleStation object
     *
     * @return Returns the last updated timestamp of this BicycleStation
     */
    public Timestamp getLastUpdated() {
        return lastUpdated;
    }

    /**
     * Method for getting last updated timestamp from a BicycleStation object
     *
     * @return Returns a String of the last updated timestamp of this BicycleStation
     */
    public String getLastUpdatedString() {
        return lastUpdated.toString();
    }

    public void setAvailableBikes(Integer availableBikes) {
        this.availableBikes = availableBikes;
    }

    /**
     * Method for getting BicycleStation as a String
     *
     * @return Returns this PumpStation object represented as a String
     */
    @Override
    public String toString() {

        return "BicycleStation{" +
                "id=" + id +
                ", latitude=" + latitude +
                ", longitude=" + longitude +
                ", address='" + address + '\'' +
                ", availableBikes=" + availableBikes +
                ", lastUpdated=" + lastUpdated +
                '}';
    }
}