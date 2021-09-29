package klingon.webserver;

import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.HttpURLConnection;
import java.net.URL;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Scanner;

/**
 * The APIDataHandler is a class responsible
 * for providing the application with data from an open
 * data source. It contains two static methods, both of
 * which establishes a connection with an open data source,
 * retrieves all necessary data from the Gothenburg area
 * in the form of JSONObjects, parses the objects
 * and returns a list of parsed objects.
 *
 * @author Anthon Lenander, Phong Nguyen
 * @version 2021-09-21
 * @see <a href="https://data.goteborg.se/BikeService/v1.2/PumpStations">data.goteborg.se/BikeService/v1.2/PumpStations</a>
 * @see <a href="https://data.goteborg.se/SelfServiceBicycleService/v2.0/help/operations/GetSelfServiceBicycleStations">data.goteborg.se/SelfServiceBicycleService/v2.0/help/operations/GetSelfServiceBicycleStations</a>
 */

@RestController
@RequestMapping("/api")
public class APIDataHandler {
    //These constants are used to make an API call to the pump station service
    private static final String PUMP_STATION_APP_ID = "612f222b-e5ee-4547-ac83-b191ddc283df";
    private static final String BICYCLE_STATION_AND_STAND_APP_ID = "ad5c61b7-fc05-44b6-8762-30ba6ecda1c2";
    private static final String FORMAT = "Json";


    /**
     * GET request that adds all bicycle station to http://localhost:8080/api/bicycleStations
     * and gives a JSONArray of the bicycle stations from the repository
     *
     * @return a ResponseEntity that contains a JSONArray and sets HttpStatus to OK
     */
    @GetMapping(path = "/bicycleStations", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Object> jsonBicycleStations() {
        Iterable<BicycleStation> allStations = WebserverApplication.getBicycleStationRepository().findAll();
        JSONArray jsonArray = new JSONArray();
        for (BicycleStation bicycleStation : allStations) {
            JSONObject jsonObject = new JSONObject();
            jsonObject.put("id", bicycleStation.getID());
            jsonObject.put("latitude", bicycleStation.getLatitude());
            jsonObject.put("longitude", bicycleStation.getLongitude());
            jsonObject.put("address", bicycleStation.getAddress());
            jsonObject.put("availableBikes", bicycleStation.getAvailableBikes());
            jsonObject.put("lastUpdated", bicycleStation.getLastUpdatedString());
            jsonArray.put(jsonObject.toMap());
        }
        return new ResponseEntity<>(jsonArray.toList(), HttpStatus.OK);
    }

    /**
     * GET request that adds all bicycle station to http://localhost:8080/api/pumpStations
     * and gives a JSONArray of the pump stations from the repository
     *
     * @return a ResponseEntity that contains a JSONArray and sets HttpStatus to OK
     */
    @GetMapping(path = "/pumpStations", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Object> jsonPumpStations() {
        Iterable<PumpStation> allStations = WebserverApplication.getPumpStationRepository().findAll();
        JSONArray jsonArray = new JSONArray();
        for (PumpStation pumpStation : allStations) {
            JSONObject jsonObject = new JSONObject();
            jsonObject.put("id", pumpStation.getId());
            jsonObject.put("comment", pumpStation.getComment());
            jsonObject.put("latitude", pumpStation.getLatitude());
            jsonObject.put("longitude", pumpStation.getLongitude());
            jsonObject.put("address", pumpStation.getAddress());
            jsonArray.put(jsonObject.toMap());
        }
        return new ResponseEntity<>(jsonArray.toList(), HttpStatus.OK);
    }

    /**
     * GET request that adds all bicycle station to http://localhost:8080/api/bicycleStands
     * and gives a JSONArray of the bicycle stands from the repository
     *
     * @return a ResponseEntity that contains a JSONArray and sets HttpStatus to OK
     */

    @GetMapping(path = "/bicycleStands", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Object> jsonBicycleStands() {
        Iterable<BicycleStand> allStations = WebserverApplication.getBicycleStandRepository().findAll();
        JSONArray jsonArray = new JSONArray();
        for (BicycleStand bicycleStand : allStations) {
            JSONObject jsonObject = new JSONObject();
            jsonObject.put("id", bicycleStand.getId());
            jsonObject.put("parkingSpaces", bicycleStand.getParkingSpace());
            jsonObject.put("latitude", bicycleStand.getLatitude());
            jsonObject.put("longitude", bicycleStand.getLongitude());
            jsonObject.put("address", bicycleStand.getAddress());
            jsonArray.put(jsonObject.toMap());
        }
        return new ResponseEntity<>(jsonArray.toList(), HttpStatus.OK);
    }

    /**
     * Method for returning a list of all
     * pump stations in the Gothenburg area.
     *
     * @return Returns a list of all pump stations in the Gothenburg area.
     */
    public static ArrayList<PumpStation> getPumpStationData() {
        ArrayList<PumpStation> allPumpStations = new ArrayList<>();

        try {
            URL url = new URL("https://data.goteborg.se/BikeService/v1.2/PumpStations/" + PUMP_STATION_APP_ID + "?&format=" + FORMAT);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.connect();

            int responseCode = connection.getResponseCode();

            if (responseCode != 200) {
                throw new RuntimeException("HttpResponseCode: " + responseCode);
            } else {
                StringBuilder inline = new StringBuilder();
                Scanner scanner = new Scanner(url.openStream());

                while (scanner.hasNext()) {
                    inline.append(scanner.nextLine());
                }

                scanner.close();

                JSONObject jsonObject = new JSONObject("{Object: " + inline + "}");
                JSONArray jsonArray = jsonObject.getJSONArray("Object");

                for (int i = 0; i < jsonArray.length(); i++) {
                    Long id = jsonArray.getJSONObject(i).getLong("ID");
                    String address = jsonArray.getJSONObject(i).getString("Address");
                    String comment = jsonArray.getJSONObject(i).getString("Comment");
                    double latitude = jsonArray.getJSONObject(i).getDouble("Lat");
                    double longitude = jsonArray.getJSONObject(i).getDouble("Lon");

                    allPumpStations.add(new PumpStation(id, address, comment, latitude, longitude));
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return allPumpStations;
    }

    /**
     * This method connects and requests data from data.goteborg.se
     * and parses the data and add each element to a list, and
     * returns the list of elements as BicycleStation
     *
     * @return a list of BicycleStation
     */
    public static ArrayList<BicycleStation> getBicycleStationData() {

        ArrayList<BicycleStation> allBicycleStations = new ArrayList<>();

        try {
            URL url = new URL("https://data.goteborg.se/SelfServiceBicycleService/v2.0/Stations/" + BICYCLE_STATION_AND_STAND_APP_ID + "?&format=" + FORMAT);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.connect();

            int responseCode = conn.getResponseCode();

            if (responseCode != 200) {
                throw new RuntimeException("HttpResponseCode: " + responseCode);
            } else {

                StringBuilder inline = new StringBuilder();
                Scanner scanner = new Scanner(url.openStream());
                while (scanner.hasNext()) {
                    inline.append(scanner.nextLine());
                }
                scanner.close();

                JSONObject jsonObject = new JSONObject("{ Object:" + inline + "}");
                JSONArray jsonArray = jsonObject.getJSONArray("Object");
                for (int i = 0; i < jsonArray.length(); i++) {
                    Long stationId = jsonArray.getJSONObject(i).getLong("StationId");
                    Double latitude = jsonArray.getJSONObject(i).getDouble("Lat");
                    Double longitude = jsonArray.getJSONObject(i).getDouble("Long");
                    Integer availableBikes = jsonArray.getJSONObject(i).getInt("AvailableBikes");
                    Timestamp timestamp = new Timestamp(System.currentTimeMillis());
                    String name = jsonArray.getJSONObject(i).getString("Name");

                    BicycleStation bicycleStation = new BicycleStation(stationId, latitude, longitude, name,
                            availableBikes, timestamp);

                    allBicycleStations.add(bicycleStation);
                }

            }

        } catch (Exception e) {
            e.printStackTrace();
        }
        return allBicycleStations;
    }


    /**
     * This method connects and requests data from data.goteborg.se
     * and parses the data and add each element to a list.
     * Filters out duplicated address and adds the amount of space to the same address
     * returns the list of elements as BicycleStand
     *
     * @return a list of BicycleStand
     */

    public static ArrayList<BicycleStand> getBicycleStandData() {

        ArrayList<BicycleStand> allBicycleStands = new ArrayList<>();

        try {
            URL url = new URL("http://data.goteborg.se/ParkingService/v2.1/BikeParkings/" + BICYCLE_STATION_AND_STAND_APP_ID + "?&format=" + FORMAT);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.connect();

            int responseCode = conn.getResponseCode();

            if (responseCode != 200) {
                throw new RuntimeException("HttpResponseCode: " + responseCode);
            } else {
                StringBuilder inline = new StringBuilder();
                Scanner scanner = new Scanner(url.openStream());
                while (scanner.hasNext()) {
                    inline.append(scanner.nextLine());
                }
                scanner.close();

                JSONArray jsonArray = new JSONArray(inline.toString());
                for (int i = 0; i < jsonArray.length(); i++) {
                    Long id = jsonArray.getJSONObject(i).getLong("Id");
                    Double latitude = jsonArray.getJSONObject(i).getDouble("Lat");
                    Double longitude = jsonArray.getJSONObject(i).getDouble("Long");
                    Integer parkingSpace = jsonArray.getJSONObject(i).getInt("Spaces");
                    String address = jsonArray.getJSONObject(i).getString("Address");

                    BicycleStand bicycleStand = new BicycleStand(id, latitude, longitude, address, parkingSpace);

                    if (bicycleStand.getParkingSpace() > 0) {
                        allBicycleStands.add(bicycleStand);
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        ArrayList<BicycleStand> noCopiesList = new ArrayList<>();

        for (BicycleStand bs : allBicycleStands) {
            if (noCopiesList.isEmpty()) {
                noCopiesList.add(bs);
            } else {
                boolean newAddress = true;
                for (BicycleStand b2 : noCopiesList) {
                    if (b2.getAddress().equals(bs.getAddress())) {
                        b2.setParkingSpace(b2.getParkingSpace() + bs.getParkingSpace());
                        newAddress = false;
                    }
                }
                if (newAddress) {
                    noCopiesList.add(bs);
                }
            }
        }
        return noCopiesList;
    }
}
