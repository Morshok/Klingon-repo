package klingon.webserver;

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
public interface PumpStationRepository extends CrudRepository<PumpStation, Long>
{
    @Query("SELECT station FROM PumpStation station WHERE station.city = ?1")
    Collection<PumpStation> findByCity(String city);
}