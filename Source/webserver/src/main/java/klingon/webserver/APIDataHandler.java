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
 * @version 2021-09-30
 * @see <a href="https://data.goteborg.se/BikeService/v1.2/PumpStations">data.goteborg.se/BikeService/v1.2/PumpStations</a>
 * @see <a href="https://data.goteborg.se/SelfServiceBicycleService/v2.0/help/operations/GetSelfServiceBicycleStations">data.goteborg.se/SelfServiceBicycleService/v2.0/help/operations/GetSelfServiceBicycleStations</a>
 */

@RestController
@RequestMapping("/api")
public class APIDataHandler {
    //These constants are used to make an API call to the pump station service
    private static final String PUMP_STATION_APP_ID = "612f222b-e5ee-4547-ac83-b191ddc283df";
    private static final String WEATHER_APP_ID = "c25006e4f1f04463e8cd05a4d3d6008e";
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
     * GET request that adds all weather data to http://localhost:8080/api/weatherData
     * and gives a JSONArray of the weather data from the repository
     *
     * @return a ResponseEntity that contains a JSONArray and sets HttpStatus to OK
     */
    @GetMapping(path = "/weatherData", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Object> jsonWeatherData()
    {
        Iterable<WeatherData> weatherDataIterable = WebserverApplication.getWeatherDataRepository().findAll();
        JSONArray jsonArray = new JSONArray();

        for(WeatherData weatherData : weatherDataIterable)
        {
            JSONObject jsonObject = new JSONObject();

            jsonObject.put("id", weatherData.getId());
            jsonObject.put("location", weatherData.getLocation());
            jsonObject.put("weatherDescription", weatherData.getWeatherDescription());
            jsonObject.put("temperature", weatherData.getTemperature());
            jsonObject.put("windSpeed", weatherData.getWindSpeed());
            jsonObject.put("windDegree", weatherData.getWindDegree());
            jsonObject.put("cloudPercentage", weatherData.getCloudsPercentage());

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
                    String city = "Göteborg";

                    allPumpStations.add(new PumpStation(id, address, comment, latitude, longitude, city));
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
                    String city = "Göteborg";

                    if (name.startsWith("BIKE")) {
                        name = "Bike on the loose";
                    }
                    BicycleStation bicycleStation = new BicycleStation(stationId, latitude, longitude, name,
                            availableBikes, timestamp, city);

                    allBicycleStations.add(bicycleStation);
                }

            }

        } catch (Exception e) {
            e.printStackTrace();
        }
        return mergeCloseBicycleStations(allBicycleStations);
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
                    String city = "Göteborg";

                    BicycleStand bicycleStand = new BicycleStand(id, latitude, longitude, address, parkingSpace, city);

                    if (bicycleStand.getParkingSpace() > 0) {
                        allBicycleStands.add(bicycleStand);
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return mergeCloseBicycleStand(allBicycleStands);
    }

    private static ArrayList<BicycleStation> mergeCloseBicycleStations(ArrayList<BicycleStation> allBicycleStation) {
        ArrayList<BicycleStation> newList = new ArrayList<>();

        for (BicycleStation bicycleStation : allBicycleStation) {
            if (newList.isEmpty()) {
                newList.add(bicycleStation);
            } else {
                boolean newAddress = true;
                for (BicycleStation bicycleStation2 : newList) {
                    double x = Math.pow(bicycleStation2.getLatitude() - bicycleStation.getLatitude(), 2);
                    double y = Math.pow(bicycleStation2.getLongitude() - bicycleStation.getLongitude(), 2);
                    double z = Math.sqrt(x + y);
                    if (z < 0.0002 && (bicycleStation.getAddress().equals(bicycleStation2.getAddress()))) {
                        bicycleStation2.setAvailableBikes(bicycleStation2.getAvailableBikes() + bicycleStation.getAvailableBikes());
                        newAddress = false;
                        break;
                    }
                }
                if (newAddress) {
                    newList.add(bicycleStation);
                }
            }
        }
        return newList;
    }

    private static ArrayList<BicycleStand> mergeCloseBicycleStand(ArrayList<BicycleStand> allBicycleStands) {
        ArrayList<BicycleStand> newList = new ArrayList<>();

        for (BicycleStand bicycleStand : allBicycleStands) {
            if (newList.isEmpty()) {
                newList.add(bicycleStand);
            } else {
                boolean newAddress = true;
                for (BicycleStand bicycleStand2 : newList) {
                    double x = Math.pow(bicycleStand2.getLatitude() - bicycleStand.getLatitude(), 2);
                    double y = Math.pow(bicycleStand2.getLongitude() - bicycleStand.getLongitude(), 2);
                    double z = Math.sqrt(x + y);
                    if (z < 0.0003 || (bicycleStand.getAddress().equals(bicycleStand2.getAddress()))) {
                        bicycleStand2.setParkingSpace(bicycleStand2.getParkingSpace() + bicycleStand.getParkingSpace());
                        newAddress = false;
                        break;
                    }
                }
                if (newAddress) {
                    newList.add(bicycleStand);
                }
            }
        }
        return newList;
    }

    /**
     * Method for returning weather data
     * from selected locations, preferably
     * withing the Gothenburg area.
     *
     * @return Returns a list weather data for select locations in the Gothenburg area.
     */
    public static ArrayList<WeatherData> getWeatherData() {
        ArrayList<WeatherData> weatherDataList = new ArrayList<>();

        // List of all locations we want to fetch weather data from.
        // Should probably be made private final static at the top
        // of this file though.
        String[] locations = new String[]{"Angered", "Göteborg", "Mölndal", "Torslanda"};

        for (int i = 0; i < locations.length; i++) {
            try {
                URL url = new URL("https://api.openweathermap.org/data/2.5/weather?q=" + locations[i] + "&units=metric&lang=sv&appid=" + WEATHER_APP_ID);
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

                    JSONObject jsonObject = new JSONObject("{ Object:[" + inline + "]}");
                    JSONArray jsonArray = jsonObject.getJSONArray("Object");

                    String location = locations[i];
                    String weatherDescription = jsonArray.getJSONObject(0).getJSONArray("weather").getJSONObject(0).getString("description");
                    double temperature = jsonArray.getJSONObject(0).getJSONObject("main").getDouble("temp");
                    double windSpeed = jsonArray.getJSONObject(0).getJSONObject("wind").getDouble("speed");
                    double windDegree = jsonArray.getJSONObject(0).getJSONObject("wind").getDouble("deg");
                    double cloudsPercentage = jsonArray.getJSONObject(0).getJSONObject("clouds").getDouble("all");

                    WeatherData weatherData = new WeatherData(Long.valueOf(i), location, weatherDescription, temperature, windSpeed, windDegree, cloudsPercentage);

                    weatherDataList.add(weatherData);

                }

            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        return weatherDataList;
    }

    public static String objectIdInterval(int from, int to){
        StringBuilder result = new StringBuilder("[");
        for(int i = 0 ; i <= to - from; i++){
            result.append((from + i));
            result.append(",");
        }
        result.append("]");

        return result.toString();
    }

}
