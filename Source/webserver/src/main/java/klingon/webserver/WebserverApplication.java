package klingon.webserver;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;

import java.util.List;

@SpringBootApplication
public class WebserverApplication
{
	public static void main(String[] args)
	{
		ConfigurableApplicationContext context = SpringApplication.run(WebserverApplication.class, args);
    BicycleStationRepository bicycleStationRepository = context.getBean(BicycleStationRepository.class);
		PumpStationRepository pumpStationRepository = context.getBean(PumpStationRepository.class);

    List<BicycleStation> bicycleStations = JsonParser.getBicycleStationData();
		List<PumpStation> allPumpStations = PumpStationAPIDataHandler.getAllPumpStations();
    
    bicycleStationRepository.saveAll(bicycleStations);
		pumpStationRepository.saveAll(allPumpStations);
	}
}