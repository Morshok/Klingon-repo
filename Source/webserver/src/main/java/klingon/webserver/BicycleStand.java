package klingon.webserver;

import javax.persistence.Entity;
import javax.persistence.Id;

/**
 * This class contains relevant variables about the bicycle stand
 * and acts as a table in the database
 *
 * @author Phong Nguyen
 * @version 2021-09-27
 */
@Entity
public class BicycleStand {

    @Id
    private Long id;
    private Double latitude;
    private Double longitude;
    private String address;
    private Integer parkingSpace;

    /**
     * Constructor for initializing the bicycle station instance
     * without any parameters
     */
    public BicycleStand() {
        super();
    }

    /**
     * Constructor for initializing the bicycle station instance
     * with parameters
     *
     * @param id           The Id of the bicycle stand
     * @param latitude     The latitude coordination of the bicycle stand
     * @param longitude    The longitude coordination of the bicycle stand
     * @param address      The address of the bicycle stand
     * @param parkingSpace The amount of parking space of the bicycle stand
     */
    public BicycleStand(Long id, Double latitude, Double longitude, String address, Integer parkingSpace) {
        this.id = id;
        this.latitude = latitude;
        this.longitude = longitude;
        this.address = address;
        this.parkingSpace = parkingSpace;
    }

    /**
     * Method for getting the id from a BicycleStand object
     *
     * @return Returns the id of this BicycleStand
     */
    public Long getId() {
        return id;
    }

    /**
     * Method for getting the latitude from a BicycleStand object
     *
     * @return Returns the latitude of this BicycleStand
     */
    public Double getLatitude() {
        return latitude;
    }

    /**
     * Method for getting the longitude from a BicycleStand object
     *
     * @return Returns the longitude of this BicycleStand
     */
    public Double getLongitude() {
        return longitude;
    }

    /**
     * Method for getting the address from a BicycleStand object
     *
     * @return Returns the address of this BicycleStand
     */
    public String getAddress() {
        return address;
    }


    /**
     * Method for getting the amount of parking space from a BicycleStand object
     *
     * @return Returns a Integer of the amount parking space
     */
    public Integer getParkingSpace() {
        return parkingSpace;
    }

    public void setParkingSpace(Integer parkingSpace) {
        this.parkingSpace = parkingSpace;
    }

    @Override
    public String toString() {
        return "BicycleStand{" +
                "id=" + id +
                ", latitude=" + latitude +
                ", longitude=" + longitude +
                ", address='" + address + '\'' +
                ", parkingSpace=" + parkingSpace +
                '}';
    }
}