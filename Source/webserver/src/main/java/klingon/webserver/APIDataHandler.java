package klingon.webserver;

import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
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
 * retrieves all necessary data from Göteborg, Malmö, Lund and Stockholm area
 * in the form of JSONObjects, parses the objects
 * and returns a list of parsed objects.
 *
 * @author Anthon Lenander, Phong Nguyen
 * @version 2021-10-07
 * @see <a href="https://data.goteborg.se/BikeService/v1.2/PumpStations">data.goteborg.se/BikeService/v1.2/PumpStations</a>
 * @see <a href="https://data.goteborg.se/SelfServiceBicycleService/v2.0/help/operations/GetSelfServiceBicycleStations">data.goteborg.se/SelfServiceBicycleService/v2.0/help/operations/GetSelfServiceBicycleStations</a>
 */

@RestController
@RequestMapping("/api")
public class APIDataHandler {

    private static final String WEATHER_APP_ID = "c25006e4f1f04463e8cd05a4d3d6008e";
    private static final String GOTHENBURG_APP_ID = "ad5c61b7-fc05-44b6-8762-30ba6ecda1c2";
    private static final String STOCKHOLM_APP_ID = "5756a82b-618e-402d-8a20-e8d48a2440c7";
    private static final String FORMAT = "Json";


    /**
     * GET request that adds all bicycle station to http://localhost:8080/api/bicycleStations
     * and gives a JSONArray of the bicycle stations from the repository
     *
     * @return a ResponseEntity that contains a JSONArray and sets HttpStatus to OK
     */
    @GetMapping(path = "/bicycleStations", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Object> jsonBicycleStations(@RequestParam ()String city) {
        Iterable<BicycleStation> allStations = WebserverApplication.getBicycleStationRepository().findByCity(city);
        JSONArray jsonArray = new JSONArray();
        for (BicycleStation bicycleStation : allStations) {
            JSONObject jsonObject = new JSONObject();
            jsonObject.put("id", bicycleStation.getID());
            jsonObject.put("latitude", bicycleStation.getLatitude());
            jsonObject.put("longitude", bicycleStation.getLongitude());
            jsonObject.put("address", bicycleStation.getAddress());
            if (bicycleStation.getAvailableBikes() == null) {
                jsonObject.put("availableBikes", "Ingen information");
            } else {
                jsonObject.put("availableBikes", bicycleStation.getAvailableBikes());
            }
            jsonObject.put("lastUpdated", bicycleStation.getLastUpdatedString());
            jsonObject.put("city", bicycleStation.getCity());
            jsonObject.put("company", bicycleStation.getCompany());
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
    public ResponseEntity<Object> jsonPumpStations(@RequestParam ()String city) {
        Iterable<PumpStation> allStations = WebserverApplication.getPumpStationRepository().findByCity(city);
        JSONArray jsonArray = new JSONArray();
        for (PumpStation pumpStation : allStations) {
            JSONObject jsonObject = new JSONObject();
            jsonObject.put("id", pumpStation.getId());
            jsonObject.put("comment", pumpStation.getComment());
            jsonObject.put("latitude", pumpStation.getLatitude());
            jsonObject.put("longitude", pumpStation.getLongitude());
            jsonObject.put("address", pumpStation.getAddress());
            jsonObject.put("city", pumpStation.getCity());
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
    public ResponseEntity<Object> jsonWeatherData() {
        Iterable<WeatherData> weatherDataIterable = WebserverApplication.getWeatherDataRepository().findAll();
        JSONArray jsonArray = new JSONArray();

        for (WeatherData weatherData : weatherDataIterable) {
            JSONObject jsonObject = new JSONObject();

            jsonObject.put("id", weatherData.getId());
            jsonObject.put("location", weatherData.getLocation());
            jsonObject.put("iconUrl", weatherData.getIconUrl());
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
            jsonObject.put("city", bicycleStand.getCity());
            jsonArray.put(jsonObject.toMap());
        }
        return new ResponseEntity<>(jsonArray.toList(), HttpStatus.OK);
    }

    /**
     * Method for returning a list of all
     * pump stations in Göteborg and Malmö.
     *
     * @return Returns a list of all pump stations.
     */
    public static ArrayList<PumpStation> getPumpStationData() {
        ArrayList<PumpStation> allPumpStations = new ArrayList<>();

        try {
            URL url = new URL("https://data.goteborg.se/BikeService/v1.2/PumpStations/" + GOTHENBURG_APP_ID +
                    "?&format=" + FORMAT);
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

                JSONArray pumpStations = new JSONArray(inline.toString());

                for (int i = 0; i < pumpStations.length(); i++) {
                    Long id = pumpStations.getJSONObject(i).getLong("ID");
                    String address = pumpStations.getJSONObject(i).getString("Address");
                    String comment = pumpStations.getJSONObject(i).getString("Comment");
                    double latitude = pumpStations.getJSONObject(i).getDouble("Lat");
                    double longitude = pumpStations.getJSONObject(i).getDouble("Lon");
                    String city = "Göteborg";

                    allPumpStations.add(new PumpStation(id, address, comment, latitude, longitude, city));
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        try {
            URL url = new URL("https://ckan-malmo.dataplatform.se/dataset/c6051c71-4d12-4c93-9966-1ad599430d03/resource/" +
                    "071f8435-38e7-4f66-8ebf-9d10ddaa4f0f/download/cykelpumpar.geojson");
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

                JSONObject jsonObject = new JSONObject(inline.toString());
                JSONArray features = jsonObject.getJSONArray("features");

                for (int i = 0; i < features.length(); i++) {
                    JSONObject properties = features.getJSONObject(i).getJSONObject("properties");
                    JSONObject geometry = features.getJSONObject(i).getJSONObject("geometry");
                    String type = geometry.getString("type");
                    JSONArray coordinates = geometry.getJSONArray("coordinates");
                    if (type.equals("MultiPoint")) {
                        coordinates = coordinates.getJSONArray(0);
                    }

                    Long id = (long) allPumpStations.size();
                    BigDecimal longi = coordinates.getBigDecimal(0);
                    BigDecimal lati = coordinates.getBigDecimal(1);
                    double longitude = longi.doubleValue();
                    double latitude = lati.doubleValue();
                    String address = properties.getString("adress");
                    String city = "Malmö";

                    allPumpStations.add(new PumpStation(id, address, latitude, longitude, city));
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return allPumpStations;
    }

    /**
     * This method connects and requests data from göteborgsstad, citybikes and stockholmstad
     * and parses the data and add each element to a list, and
     * returns the list of elements as BicycleStation
     *
     * @return a list of BicycleStation
     */
    public static ArrayList<BicycleStation> getBicycleStationData() {

        ArrayList<BicycleStation> allBicycleStations = new ArrayList<>();

        try {
            URL url = new URL("https://data.goteborg.se/SelfServiceBicycleService/v2.0/Stations/" +
                    GOTHENBURG_APP_ID + "?&format=" + FORMAT);
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

                JSONArray bicycleStations = new JSONArray(inline.toString());
                for (int i = 0; i < bicycleStations.length(); i++) {
                    Long stationId = bicycleStations.getJSONObject(i).getLong("StationId");
                    Double latitude = bicycleStations.getJSONObject(i).getDouble("Lat");
                    Double longitude = bicycleStations.getJSONObject(i).getDouble("Long");
                    Integer availableBikes = bicycleStations.getJSONObject(i).getInt("AvailableBikes");
                    Timestamp timestamp = new Timestamp(System.currentTimeMillis());
                    String name = bicycleStations.getJSONObject(i).getString("Name");
                    String city = "Göteborg";
                    String company = "Styr & ställ";

                    BicycleStation bicycleStation = new BicycleStation(stationId, latitude, longitude, name,
                            availableBikes, timestamp, city, company);

                    allBicycleStations.add(bicycleStation);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        try {
            URL url = new URL("http://api.citybik.es/v2/networks/malmobybike");
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

                JSONObject jsonObject = new JSONObject(inline.toString());
                JSONObject network = jsonObject.getJSONObject("network");
                JSONArray jsonArray = network.getJSONArray("stations");
                for (int i = 0; i < jsonArray.length(); i++) {
                    Long id = (long) allBicycleStations.size();
                    Double latitude = jsonArray.getJSONObject(i).getDouble("latitude");
                    Double longitude = jsonArray.getJSONObject(i).getDouble("longitude");
                    Integer availableBikes = jsonArray.getJSONObject(i).getInt("free_bikes");
                    Timestamp timestamp = new Timestamp(System.currentTimeMillis());
                    JSONObject extra = jsonArray.getJSONObject(i).getJSONObject("extra");
                    Object addressObject = extra.get("address") == JSONObject.NULL ? "N/A" : extra.get("address");
                    String address = addressObject.toString();
                    String company = network.getString("name");
                    String city = network.getJSONObject("location").getString("city");

                    BicycleStation bicycleStation = new BicycleStation(id, latitude, longitude, address,
                            availableBikes, timestamp, city, company);

                    allBicycleStations.add(bicycleStation);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        try {
            URL url = new URL("http://api.citybik.es/v2/networks/lundahoj");
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

                JSONObject jsonObject = new JSONObject(inline.toString());
                JSONObject network = jsonObject.getJSONObject("network");
                JSONArray jsonArray = network.getJSONArray("stations");
                for (int i = 0; i < jsonArray.length(); i++) {
                    Long id = (long) allBicycleStations.size();
                    Double latitude = jsonArray.getJSONObject(i).getDouble("latitude");
                    Double longitude = jsonArray.getJSONObject(i).getDouble("longitude");
                    Integer availableBikes = jsonArray.getJSONObject(i).getInt("free_bikes");
                    Timestamp timestamp = new Timestamp(System.currentTimeMillis());
                    String address = jsonArray.getJSONObject(i).getString("name");
                    String company = network.getString("name");
                    String city = network.getJSONObject("location").getString("city");

                    BicycleStation bicycleStation = new BicycleStation(id, latitude, longitude, address,
                            availableBikes, timestamp, city, company);

                    allBicycleStations.add(bicycleStation);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }


        //Gather all objectIds that is needed for query the Http request for the necessary information
        StringBuilder objectIds = new StringBuilder("[");
        try {
            URL url = new URL("https://openstreetgs.stockholm.se/geoservice/api/" + STOCKHOLM_APP_ID
                    + "/wfs/?version=1.0.0&request=GetFeature&typeName=od_gis:CityBikes_Punkt&outputFormat=" + FORMAT);
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

                JSONObject jsonObject = new JSONObject(inline.toString());
                JSONArray jsonArray = jsonObject.getJSONArray("features");
                for (int i = 0; i < jsonArray.length(); i++) {

                    JSONObject properties = jsonArray.getJSONObject(i).getJSONObject("properties");
                    objectIds.append(properties.getInt("OBJECT_ID"));
                    objectIds.append(",");
                }
                objectIds.append("]");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        try {
            URL url = new URL("https://openstreetws.stockholm.se/LvWS-3.0/Lv.svc/json/" +
                    "GetFeatures?apikey=" + STOCKHOLM_APP_ID + "&objectIds=" +
                    objectIds + "&includeWktForExtents=true");
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
                    Long id = jsonArray.getJSONObject(i).getLong("ObjectId");
                    String company = jsonArray.getJSONObject(i).getString("FeatureTypeName");
                    String city = "Stockholm";
                    JSONArray attributeValues = jsonArray.getJSONObject(i).getJSONArray("AttributeValues");
                    String address = attributeValues.getJSONObject(1).getString("Value");
                    //No data found
                    Integer availableBikes = null;
                    Timestamp timestamp = new Timestamp(System.currentTimeMillis());

                    JSONArray geometries = jsonArray.getJSONObject(i).getJSONArray("Geometries");
                    String coordinates = geometries.getJSONObject(0).getString("WKT");
                    String[] coordinatesArr = coordinates.replaceAll("[^0-9.]+", " ").trim().split(" ");
                    Double longitude = Double.valueOf(coordinatesArr[0]);
                    Double latitude = Double.valueOf(coordinatesArr[1]);

                    BicycleStation bicycleStation = new BicycleStation(id, latitude, longitude, address,
                            availableBikes, timestamp, city, company);

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
            URL url = new URL("http://data.goteborg.se/ParkingService/v2.1/BikeParkings/" + GOTHENBURG_APP_ID + "?&format=" + FORMAT);
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
                    if (z < 0.0003 ) {
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

        String[] locations = new String[] { "Angered", "Göteborg", "Mölndal", "Torslanda", "Lund", "Malmö", "Stockholm" };


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
                    String iconId = jsonArray.getJSONObject(0).getJSONArray("weather").getJSONObject(0).getString("icon");
                    String iconUrl = String.format("https://openweathermap.org/img/wn/%s@2x.png", iconId);

                    String weatherDescription = jsonArray.getJSONObject(0).getJSONArray("weather").getJSONObject(0).getString("description");
                    double temperature = jsonArray.getJSONObject(0).getJSONObject("main").getDouble("temp");
                    double windSpeed = jsonArray.getJSONObject(0).getJSONObject("wind").getDouble("speed");
                    double windDegree = jsonArray.getJSONObject(0).getJSONObject("wind").getDouble("deg");
                    double cloudsPercentage = jsonArray.getJSONObject(0).getJSONObject("clouds").getDouble("all");

                    WeatherData weatherData = new WeatherData((long) i, location, iconUrl, weatherDescription, temperature, windSpeed, windDegree, cloudsPercentage);

                    weatherDataList.add(weatherData);

                }

            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        return weatherDataList;
    }
}
