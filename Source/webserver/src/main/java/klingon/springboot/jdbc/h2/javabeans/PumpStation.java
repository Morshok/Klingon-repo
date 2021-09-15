package klingon.springboot.jdbc.h2.javabeans;

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
}