package klingon.webserver;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;

import java.util.List;

/**
 * The PumpStation class is essentially a Java Bean
 * class, which is used to encapsulate a number of
 * objects into a single one. Hence this class
 * encapsulates multiple PumpStation objects into
 * a single one, namely this class (the bean).
 *
 * @author Anthon Lenander
 * @version 2021-09-15
 */
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