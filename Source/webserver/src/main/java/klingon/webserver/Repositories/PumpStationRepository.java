package klingon.webserver.Repositories;

import klingon.webserver.Beans.PumpStation;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;

/**
 * The PumpStationRepository interface is currently
 * an empty interface JPA repository, which provides
 * a way for the WebserverApplication to access the
 * h2 database.
 *
 * @author Anthon Lenander
 * @version 2021-09-15
 */
@Repository
public interface PumpStationRepository extends CrudRepository<PumpStation, Long> {
    /**
     * Method for getting pump stations by city.
     *
     * @param city the city
     * @return a collection of pump stations for given city
     */
    @Query("SELECT station FROM PumpStation station WHERE station.city = ?1")
    Collection<PumpStation> findByCity(String city);
}