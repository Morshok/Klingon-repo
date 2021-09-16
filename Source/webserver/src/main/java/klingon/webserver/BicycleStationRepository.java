package klingon.webserver;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;


/**
 * This interface defines BicycleStation's repository for the database
 *
 * @author Phong Nguyen
 * @version 2021-09-05
 */

@Repository
public interface BicycleStationRepository extends CrudRepository<BicycleStation, Long> {
}
