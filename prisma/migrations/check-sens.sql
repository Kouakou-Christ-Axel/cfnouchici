SELECT COUNT(*) AS mots_sans_sens FROM mot m WHERE NOT EXISTS (SELECT 1 FROM sens s WHERE s."motId" = m.id);
