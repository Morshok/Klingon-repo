package klingon.webserver;

import org.json.JSONArray;
import org.json.JSONObject;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.Scanner;

public class PumpStationAPIDataHandler
{
    //These constants are used to make an API call to the pump station service
    private static final String APP_ID = "612f222b-e5ee-4547-ac83-b191ddc283df";
    private static final String FORMAT = "Json";

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