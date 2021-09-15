package klingon.webserver;

import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;
import org.json.*;

public class JsonParser {

    
    public static ArrayList<BicycleStation> getBicycleStationData(){

        ArrayList<BicycleStation> allBicycleStations = new ArrayList<>();

        try {
            URL url = new URL("https://data.goteborg.se/SelfServiceBicycleService/v2.0/Stations/ad5c61b7-fc05-44b6-8762-30ba6ecda1c2?&format=Json");
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

                JSONObject jsonObject = new JSONObject("{ Object:" +  inline + "}" );
                JSONArray jsonArray = jsonObject.getJSONArray("Object");
                for(int i = 0; i < jsonArray.length(); i++){
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
