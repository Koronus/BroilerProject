-- Привязываем демо-инциденты к партиям по совпадению workshop + house
UPDATE incidents
SET batch_id = b.id
FROM batches b
WHERE incidents.workshop = b.workshop
  AND incidents.house = b.house
  AND incidents.batch_id IS NULL
  AND incidents.code LIKE 'INC-DEMO-%';