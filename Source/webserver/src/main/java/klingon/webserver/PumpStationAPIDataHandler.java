package klingon.webserver;

import org.json.JSONArray;
import org.json.JSONObject;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.Scanner;

/**
 * The PumpStationAPIDataHandler is a class responsible
 * for providing the application with data from an open
 * data source. It contains only one static method, that
 * establishes  a connection with the open data source,
 * retrieves all pump stations in the Gothenburg area
 * in the form of a JSONObject, parses the object
 * and returns a list of said pump stations.
 *
 * @author Anthon Lenander
 * @version 2021-09-15
 * @see <a href="https://data.goteborg.se/BikeService/v1.2/PumpStations">data.goteborg.se</a>
 */
public class PumpStationAPIDataHandler
{
    //These constants are used to make an API call to the pump station service
    private static final String APP_ID = "612f222b-e5ee-4547-ac83-b191ddc283df";
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
            URL url = new URL("https://data.goteborg.se/BikeService/v1.2/PumpStations/" + APP_ID + "?&format=" + FORMAT);
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
}