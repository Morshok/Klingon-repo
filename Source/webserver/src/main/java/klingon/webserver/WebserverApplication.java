package klingon.webserver;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;

import java.util.List;

@SpringBootApplication
public class WebserverApplication {

	public static void main(String[] args)
	{
		ConfigurableApplicationContext context = SpringApplication.run(WebserverApplication.class, args);
		PumpStationRepository pumpStationRepository = context.getBean(PumpStationRepository.class);
		List<PumpStation> allPumpStations = PumpStationAPIDataHandler.getAllPumpStations();
		pumpStationRepository.saveAll(allPumpStations);
	}

}