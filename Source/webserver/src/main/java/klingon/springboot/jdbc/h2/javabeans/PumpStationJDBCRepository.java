package klingon.springboot.jdbc.h2.javabeans;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.stereotype.Repository;

@Repository
public class PumpStationJDBCRepository
{
    @Autowired
    JdbcTemplate jdbcTemplate;

    public PumpStation findById(Long id)
    {
        return jdbcTemplate.queryForObject(
                "SELECT * FROM PumpStation WHERE id =?",
                new Object[] { id },
                new BeanPropertyRowMapper<PumpStation>(PumpStation.class)
        );
    }

    public PumpStation findByCoordinates(double latitude, double longitude)
    {
        return jdbcTemplate.queryForObject(
                "SELECT * FROM PumpStation WHERE latitude =? AND longitude =?",
                new Object[] { latitude, longitude },
                new BeanPropertyRowMapper<PumpStation>(PumpStation.class)
        );
    }
}