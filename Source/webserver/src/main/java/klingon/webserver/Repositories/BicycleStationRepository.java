package klingon.webserver.Repositories;

import klingon.webserver.Beans.BicycleStation;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;

/**
 * This interface defines BicycleStation's repository for the database
 *
 * @author Phong Nguyen
 * @version 2021-09-05
 */
@Repository
public interface BicycleStationRepository extends CrudRepository<BicycleStation, Long> {
    @Query("SELECT station FROM BicycleStation station WHERE station.city = ?1")
    Collection<BicycleStation> findByCity(String city);
}