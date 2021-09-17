package klingon.webserver;

import org.json.JSONArray;
import org.json.JSONObject;
import java.net.HttpURLConnection;
import java.net.URL;
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
 * @version 2021-09-17
 * @see <a href="https://data.goteborg.se/BikeService/v1.2/PumpStations">data.goteborg.se</a>
 * @see <a href="https://data.goteborg.se/SelfServiceBicycleService/v2.0/help/operations/GetSelfServiceBicycleStations">data.goteborg.se</a>
 */
public class APIDataHandler
{
    //These constants are used to make an API call to the pump station service
    private static final String PUMP_STATION_APP_ID = "612f222b-e5ee-4547-ac83-b191ddc283df";
    private static final String BICYCLE_STATION_APP_ID = "ad5c61b7-fc05-44b6-8762-30ba6ecda1c2";
    private static final String FORMAT = "Json";

    /**
     * Method for returning a list of all
     * pump stations in the Gothenburg area.
     *
     * @return  Returns a list of all pump stations in the Gothenburg area.
     */
    public static ArrayList<PumpStation> getAllPumpStations()
    {
        ArrayList<PumpStation> allPumpStations = new ArrayList<>();

        try
        {
            URL url = new URL("https://data.goteborg.se/BikeService/v1.2/PumpStations/" + PUMP_STATION_APP_ID + "?&format=" + FORMAT);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.connect();

            int responseCode = connection.getResponseCode();

            if(responseCode != 200)
            {
                throw new RuntimeException("HttpResponseCode: " + responseCode);
            }
            else
            {
                StringBuilder inline = new StringBuilder();
                Scanner scanner = new Scanner(url.openStream());

                while(scanner.hasNext())
                {
                    inline.append(scanner.nextLine());
                }

                scanner.close();

                JSONObject jsonObject = new JSONObject("{Object: " + inline + "}");
                JSONArray jsonArray = jsonObject.getJSONArray("Object");

                for(int i = 0; i < jsonArray.length(); i++)
                {
                    Long id = jsonArray.getJSONObject(i).getLong("ID");
                    String address = jsonArray.getJSONObject(i).getString("Address");
                    String comment = jsonArray.getJSONObject(i).getString("Comment");
                    double latitude = jsonArray.getJSONObject(i).getDouble("Lat");
                    double longitude = jsonArray.getJSONObject(i).getDouble("Lon");

                    allPumpStations.add(new PumpStation(id, address, comment, latitude, longitude));
                }
            }

        }
        catch(Exception e)
        {
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
            URL url = new URL("https://data.goteborg.se/SelfServiceBicycleService/v2.0/Stations/" + BICYCLE_STATION_APP_ID + "?&format=" + FORMAT);
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
                    String name = jsonArray.getJSONObject(i).getString("Name");
                    BicycleStation bicycleStation = new BicycleStation(stationId, latitude, longitude, name, availableBikes);

                    allBicycleStations.add(bicycleStation);
                }

            }

        } catch (Exception e) {
            e.printStackTrace();
        }
        return allBicycleStations;
    }
}