DROP TABLE IF EXISTS PumpStations;

CREATE TABLE PumpStations (
    INT Id PRIMARY KEY NOT NULL,
    VARCHAR(255) Address NOT NULL,
    VARCHAR(255) Comment,
    DOUBLE Latitude NOT NULL,
    DOUBLE Longitude NOT NULL,

    UNIQUE(Latitude, Longitude);
);