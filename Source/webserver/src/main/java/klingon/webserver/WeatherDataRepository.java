package klingon.webserver;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

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
public interface WeatherDataRepository extends CrudRepository<WeatherData, Long> { }
