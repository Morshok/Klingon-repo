package klingon.webserver;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

import javax.annotation.PostConstruct;
import java.util.Date;
import java.util.List;

@SpringBootApplication
public class WebserverApplication
{
	private static BicycleStationRepository bicycleStationRepository;
	private static PumpStationRepository pumpStationRepository;

	public static void main(String[] args)
	{
		ConfigurableApplicationContext context = SpringApplication.run(WebserverApplication.class, args);
    	bicycleStationRepository = context.getBean(BicycleStationRepository.class);
		pumpStationRepository = context.getBean(PumpStationRepository.class);

		// Initial population of the h2 database tables
		List<BicycleStation> bicycleStations = APIDataHandler.getBicycleStationData();
		bicycleStationRepository.saveAll(bicycleStations);

		List<PumpStation> allPumpStations = APIDataHandler.getAllPumpStations();
		pumpStationRepository.saveAll(allPumpStations);
	}

	// The spring cron expression should be formatted as follows:
	// seconds minutes hours day_of_month month day(s)_of_week.

	/**
	 * Method for updating the BicycleStation table
	 * in the h2 database every 5 minutes.
	 */
	@Async
	@Scheduled(cron = "* */5 * * * *")
	public void updateBicycleStations()
	{
		List<BicycleStation> bicycleStations = APIDataHandler.getBicycleStationData();
		bicycleStationRepository.saveAll(bicycleStations);
	}

	/**
	 * Method for updating the BicycleStation table
	 * in the h2 database every monday at 8am.
	 */
	@Async
	@Scheduled(cron = "* 0 8 * * 1")
	public void updatePumpStations()
	{
		List<PumpStation> allPumpStations = APIDataHandler.getAllPumpStations();
		pumpStationRepository.saveAll(allPumpStations);
	}
}

@Configuration
@EnableScheduling
class SchedulingConfiguration
{
}