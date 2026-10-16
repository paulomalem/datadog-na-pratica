--CRIAÇÃO DO USUÁRIO DO DATADOG--
CREATE USER datadog WITH PASSWORD 'datadog_lab';
GRANT pg_monitor TO datadog;
GRANT SELECT ON pg_stat_database TO datadog;