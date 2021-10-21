package klingon.webserver;

import klingon.webserver.Beans.BicycleStand;
import klingon.webserver.Beans.BicycleStation;
import klingon.webserver.Beans.PumpStation;
import klingon.webserver.Beans.WeatherData;
import klingon.webserver.Repositories.BicycleStandRepository;
import klingon.webserver.Repositories.BicycleStationRepository;
import klingon.webserver.Repositories.PumpStationRepository;
import klingon.webserver.Repositories.WeatherDataRepository;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.event.ContextStartedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.*;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * This class is a initializer to boot up the applications backend
 * and handles different execution of the built in database
 *
 * @author Anthon Lenander, Phong Nguyen
 * @version 2021-10-01
 */
@Service
@SpringBootApplication
public class WebserverApplication {
    private static BicycleStationRepository bicycleStationRepository;
    private static PumpStationRepository pumpStationRepository;
    private static BicycleStandRepository bicycleStandRepository;
    private static WeatherDataRepository weatherDataRepository;

    public static void main(String[] args) {
        ConfigurableApplicationContext context = SpringApplication.run(WebserverApplication.class, args);
        bicycleStationRepository = context.getBean(BicycleStationRepository.class);
        pumpStationRepository = context.getBean(PumpStationRepository.class);
        bicycleStandRepository = context.getBean(BicycleStandRepository.class);
        weatherDataRepository = context.getBean(WeatherDataRepository.class);
        context.start();
    }

    /**
     * Get method that returns the repository of all bicycle stations
     *
     * @return a BicycleStationRepository
     */
    public static BicycleStationRepository getBicycleStationRepository() {
        return bicycleStationRepository;
    }

    /**
     * Get method that returns the repository of all pump stations
     *
     * @return a PumpStationRepository
     */
    public static PumpStationRepository getPumpStationRepository() {
        return pumpStationRepository;
    }

    /**
     * Method for returning the BicycleStand Repository
     *
     * @return Returns the BicycleStand Repository
     */
    public static BicycleStandRepository getBicycleStandRepository() {
        return bicycleStandRepository;
    }

    /**
     * Method for returning the WeatherData Repository
     *
     * @return Returns the WeatherData Repository
     */
    public static WeatherDataRepository getWeatherDataRepository() {
        return weatherDataRepository;
    }

    // The spring cron expression should be formatted as follows:
    // seconds minutes hours day_of_month month day(s)_of_week.

    @Scheduled(cron = "0 */5 * * * *")
    protected void updateBicycleStations() {
        populateBicycleStations();
    }

    @Scheduled(cron = "0 0 8 * * 1")
    protected void updatePumpStations() {
        populatePumpStations();
    }

    @Scheduled(cron = "0 */5 * * * *")
    protected void updateWeatherData() {
        populateWeatherData();
    }

    private void populateBicycleStations() {
        List<BicycleStation> bicycleStations = APIDataHandler.getBicycleStationData();
        bicycleStationRepository.saveAll(bicycleStations);
    }

    private void populatePumpStations() {
        List<PumpStation> allPumpStations = APIDataHandler.getPumpStationData();
        pumpStationRepository.saveAll(allPumpStations);
    }

    private void populateBicycleStands() {
        List<BicycleStand> allBicycleStands = APIDataHandler.getBicycleStandData();
        bicycleStandRepository.saveAll(allBicycleStands);
    }

    private void populateWeatherData() {
        List<WeatherData> weatherDataList = APIDataHandler.getWeatherData();
        weatherDataRepository.saveAll(weatherDataList);
    }

    private void initDatabase() {
        bicycleStationRepository.deleteAll();
        pumpStationRepository.deleteAll();
        bicycleStandRepository.deleteAll();
        weatherDataRepository.deleteAll();

        populateBicycleStations();
        populatePumpStations();
        populateBicycleStands();
        populateWeatherData();
    }

    @EventListener(ContextStartedEvent.class)
    protected void onApplicationStartup() {
        initDatabase();

        updateBicycleStations();
        updatePumpStations();
        updateWeatherData();
    }
}
