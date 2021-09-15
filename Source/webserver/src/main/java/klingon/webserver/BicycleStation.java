package klingon.webserver;

import javax.persistence.Entity;
import javax.persistence.Id;

@Entity
public class BicycleStation {

    @Id
    private Long ID;
    private Double Latitude;
    private Double Longitude;
    private String Address;
    private Integer AvailableBikes;

    public BicycleStation(){
        super();
    }

    public BicycleStation(Long Id, Double latitude, Double longitude, String address, Integer availableBikes) {
        this.ID = Id;
        Latitude = latitude;
        Longitude = longitude;
        Address = address;
        AvailableBikes = availableBikes;
    }

    public Long getID() {
        return ID;
    }

    public void setID(Long ID) {
        this.ID = ID;
    }

    public Double getLatitude() {
        return Latitude;
    }

    public void setLatitude(Double lat) {
        Latitude = lat;
    }

    public Double getLongitude() {
        return Longitude;
    }

    public void setLongitude(Double aLong) {
        Longitude = aLong;
    }

    public String getAddress() {
        return Address;
    }

    public void setAddress(String address) {
        Address = address;
    }

    public int getAvailableBikes() {
        return AvailableBikes;
    }

    public void setAvailableBikes(int availableBikes) {
        AvailableBikes = availableBikes;
    }

    @Override
    public String toString() {
        return "BicycleStation{" +
                "ID=" + ID +
                ", Latitude=" + Latitude +
                ", Longitude=" + Longitude +
                ", Address='" + Address + '\'' +
                ", AvailableBikes=" + AvailableBikes +
                '}';
    }
}
