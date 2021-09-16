package klingon.webserver;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;

import java.util.List;

@SpringBootApplication
public class WebserverApplication {

    public static void main(String[] args) {

        ConfigurableApplicationContext configurableApplicationContext =
                SpringApplication.run(WebserverApplication.class, args);
        BicycleStationRepository bicycleStationRepository =
                configurableApplicationContext.getBean(BicycleStationRepository.class);
        List<BicycleStation> bicycleStations = JsonParser.getBicycleStationData();
        bicycleStationRepository.saveAll(bicycleStations);

    }


}
