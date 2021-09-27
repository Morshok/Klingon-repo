package klingon.webserver;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.event.ContextStartedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.*;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * This class is a initializer to boot up the applications backend
 * and handles different execution of the built in database
 *
 * @author Anthon Lenander, Phong Nguyen
 * @version 2021-09-21
 */
@Service
@SpringBootApplication
public class WebserverApplication {
    private static BicycleStationRepository bicycleStationRepository;
    private static PumpStationRepository pumpStationRepository;
    private static BicycleStandRepository bicycleStandRepository;

    public static void main(String[] args) {
        ConfigurableApplicationContext context = SpringApplication.run(WebserverApplication.class, args);
        bicycleStationRepository = context.getBean(BicycleStationRepository.class);
        pumpStationRepository = context.getBean(PumpStationRepository.class);
        bicycleStandRepository = context.getBean(BicycleStandRepository.class);
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

    public static BicycleStandRepository getBicycleStandRepository() {
        return bicycleStandRepository;
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

    private void initDatabase() {
        bicycleStationRepository.deleteAll();
        pumpStationRepository.deleteAll();
        bicycleStandRepository.deleteAll();

        populateBicycleStations();
        populatePumpStations();
        populateBicycleStands();
    }

    @EventListener(ContextStartedEvent.class)
    protected void onApplicationStartup() {
        initDatabase();

        updateBicycleStations();
        updatePumpStations();
    }
}
