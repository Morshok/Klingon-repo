package klingon.webserver;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PumpStationRepository extends CrudRepository<PumpStation, Long>
{
}