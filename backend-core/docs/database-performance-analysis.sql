-- Query Performance Analysis
-- Ejecutar estas consultas para verificar el uso de índices

-- ==========================================
-- 1. Explicar consulta de resultados
-- ==========================================
EXPLAIN ANALYZE
SELECT * FROM precount_aggregates 
WHERE scope_type = 'MESA' 
  AND scope_id = 1 
  AND election_position_id = 1
ORDER BY votos DESC;

-- Debería usar: idx_aggregates_scope o idx_aggregates_votos

-- ==========================================
-- 2. Explicar consulta de actas por estado
-- ==========================================
EXPLAIN ANALYZE
SELECT * FROM precount_records 
WHERE estado = 'REPORTADA' 
ORDER BY created_at DESC 
LIMIT 20;

-- Debería usar: idx_records_estado_created

-- ==========================================
-- 3. Explicar consulta de agregación
-- ==========================================
EXPLAIN ANALYZE
SELECT candidate_id, SUM(votos) as total_votos
FROM precount_votes v
JOIN precount_records r ON v.precount_record_id = r.id
WHERE r.estado = 'VALIDADA'
  AND r.election_position_id = 1
  AND r.polling_table_id IN (1, 2, 3, 4, 5)
GROUP BY candidate_id;

-- Debería usar: idx_records_election_mesa_estado + idx_votes_record_candidate

-- ==========================================
-- 4. Verificar estadísticas de índices
-- ==========================================
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as times_used,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes 
WHERE tablename LIKE 'precount%'
ORDER BY idx_scan DESC;

-- ==========================================
-- 5. Identificar queries lentas (si hay)
-- ==========================================
SELECT 
    query,
    calls,
    total_exec_time,
    mean_exec_time,
    rows
FROM pg_stat_statements 
WHERE query LIKE '%precount%'
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Nota: requiere extension pg_stat_statements

-- ==========================================
-- 6. Recomendaciones de optimización
-- ==========================================
-- Si las consultas de agregación son lentas, considerar:
-- - Materialized views para dashboards
-- - Particionamiento por fecha
-- - Redis cache (ya implementado)

-- ==========================================
-- 7. Mantenimiento de índices
-- ==========================================
-- Reindexar tablas grandes (ejecutar en mantenimiento)
REINDEX INDEX idx_aggregates_scope;
REINDEX INDEX idx_records_election_mesa_estado;

-- Actualizar estadísticas
ANALYZE precount_records;
ANALYZE precount_aggregates;
ANALYZE precount_votes;

-- ==========================================
-- 8. Monitoreo de tamaño
-- ==========================================
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size(tablename::regclass)) as total_size
FROM pg_tables 
WHERE tablename LIKE 'precount%'
ORDER BY pg_total_relation_size(tablename::regclass) DESC;
