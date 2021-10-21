package klingon.webserver.Repositories;

import klingon.webserver.Beans.BicycleStand;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * This interface defines BicycleStand's repository for the database
 *
 * @author Phong Nguyen
 * @version 2021-09-27
 */
@Repository
public interface BicycleStandRepository extends CrudRepository<BicycleStand, Long> {
}
