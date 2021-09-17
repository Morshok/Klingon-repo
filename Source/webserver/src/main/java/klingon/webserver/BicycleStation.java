package klingon.webserver;

import javax.persistence.Entity;
import javax.persistence.Id;

/**
 * This class contains relevant variables about the bicycle station
 * and acts as a table in the database
 *
 * @author Phong Nguyen
 * @version 2021-09-15
 */


@Entity
public class BicycleStation {

    @Id
    private Long ID;
    private Double Latitude;
    private Double Longitude;
    private String Address;
    private Integer AvailableBikes;


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
     * @param Id             The Id of the bicycle station
     * @param latitude       The latitude coordination of the bicycle station
     * @param longitude      The longitude coordination of the bicycle station
     * @param address        The address of the bicycle station
     * @param availableBikes The amount of available bikes at the bicycle station
     */
    public BicycleStation(Long Id, Double latitude, Double longitude, String address, Integer availableBikes) {
        this.ID = Id;
        Latitude = latitude;
        Longitude = longitude;
        Address = address;
        AvailableBikes = availableBikes;
    }

}
