package klingon.webserver;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
/**
 * The WeatherDataRepository interface is currently
 * an empty interface JPA repository, which provides
 * a way for the WebserverApplication to access the
 * h2 database.
 *
 * @author Anthon Lenander
 * @version 2021-09-29
 */
@Repository
public interface WeatherDataRepository extends CrudRepository<WeatherData, Long> {

    @Query("SELECT weather FROM WeatherData weather WHERE weather.zone = ?1")
    Collection<WeatherData> findByZone(String zone);
}
