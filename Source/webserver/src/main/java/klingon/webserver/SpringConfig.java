package klingon.webserver;


import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

@Configuration
@EnableScheduling
public class SpringConfig
{
    /**
     * Method for updating the BicycleStation table
     * in the h2 database every monday at 8am.
     */
    @Scheduled(cron = "0 8 * * 1")
    public void UpdatePumpStations()
    {

    }

    /**
     * Method for updating the BicycleStation table
     * in the h2 database every 5 minutes.
     */
    @Scheduled(cron = "*/5 * * * *")
    public void UpdateBicycleStations()
    {

    }
}
