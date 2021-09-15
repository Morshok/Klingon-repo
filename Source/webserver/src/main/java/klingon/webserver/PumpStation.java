package klingon.webserver;

import javax.persistence.Entity;
import javax.persistence.Id;

@Entity
public class PumpStation
{
    @Id
    private Long id;
    private String address;
    private String comment;
    private double latitude;
    private double longitude;

    public PumpStation() { super(); }

    public PumpStation(Long id, String address, String comment, double latitude, double longitude)
    {
        super();
        this.id = id;
        this.address = address;
        this.comment = comment;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public Long getId() { return id; }
    public String getAddress() { return address; }
    public String getComment() { return comment; }
    public double getLatitude() { return latitude; }
    public double getLongitude() { return longitude; }

    public void setId(Long id) { this.id = id; }
    public void setAddress(String address) { this.address = address; }
    public void setComment(String comment) { this.comment = comment; }
    public void setLatitude(double latitude) { this.latitude = latitude; }
    public void setLongitude(double longitude) { this.longitude = longitude; }

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