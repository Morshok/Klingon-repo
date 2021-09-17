package klingon.webserver;

import javax.persistence.Entity;
import javax.persistence.Id;

/**
 * The PumpStation class is essentially a Java Bean
 * class, which is used to encapsulate a number of
 * objects into a single one. Hence this class
 * encapsulates multiple PumpStation objects into
 * a single one, namely this class (the bean).
 *
 * @author Anthon Lenander
 * @version 2021-09-15
 */
@Entity
public class PumpStation
{
    @Id
    private Long id;
    private String address;
    private String comment;
    private double latitude;
    private double longitude;

    /**
     * A zero argument constructor, as per the definition of a bean
     */
    public PumpStation() { super(); }

    /**
     * Constructor for initializing a PumpStation instance.
     *
     * @param id        The id of this PumpStation
     * @param address   The address of this PumpStation
     * @param comment   A comment associated with this PumpStation, often times left empty
     * @param latitude  The latitude component of the geographical coordinate at which this PumpStation is located
     * @param longitude The longitude component of the geographical coordinate at which this PumpStation is located
     */
    public PumpStation(Long id, String address, String comment, double latitude, double longitude)
    {
        super();
        this.id = id;
        this.address = address;
        this.comment = comment;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    /**
     * Method for getting the id from a PumpStation object
     *
     * @return Returns the id of this PumpStation
     */
    public Long getId() { return id; }

    /**
     * Method for getting the address from a PumpStation object
     *
     * @return Returns the address of this PumpStation
     */
    public String getAddress() { return address; }

    /**
     * Method for getting the comment from a PumpStation object
     *
     * @return Returns the comment of this PumpStation
     */
    public String getComment() { return comment; }

    /**
     * Method for getting the latitude from a PumpStation object
     *
     * @return Returns the latitude of this PumpStation
     */
    public double getLatitude() { return latitude; }

    /**
     * Method for getting the longitude from a PumpStation object
     *
     * @return Returns the longitude of this PumpStation
     */
    public double getLongitude() { return longitude; }

    /**
     * Method for setting the id of a PumpStation object
     *
     * @param id        The id of this PumpStation
     */
    public void setId(Long id) { this.id = id; }
    /**
     * Method for setting the address of a PumpStation object
     *
     * @param address   The address of this PumpStation
     */
    public void setAddress(String address) { this.address = address; }
    /**
     * Method for setting the comment of a PumpStation object
     *
     * @param comment   The comment of this PumpStation
     */
    public void setComment(String comment) { this.comment = comment; }
    /**
     * Method for setting the latitude of a PumpStation object
     *
     * @param latitude  The latitude of this PumpStation
     */
    public void setLatitude(double latitude) { this.latitude = latitude; }
    /**
     * Method for setting the longitude of a PumpStation object
     *
     * @param longitude The longitude of this PumpStation
     */
    public void setLongitude(double longitude) { this.longitude = longitude; }

    /**
     * Method for getting PumpStation as a String
     *
     * @return Returns this PumpStation object represented as a String
     */
    @Override
    public String toString()
    {
        return ("Pump Station{ " +
               "id: " + id + ", " +
               "address: " + address + ", " +
               "comment: " + comment + ", " +
               "latitude: " + latitude + ", " +
               "longitude: " + longitude + "}"
        );
    }
}