CREATE TRIGGER add_app_to_purge_artifact
BEFORE DELETE ON "apps"
FOR EACH ROW
BEGIN
    INSERT INTO "purgeAppArtifact" (orgId, appId, appName, hasArtifact)
    VALUES (OLD."organizationsId", OLD."id", OLD."name", (SELECT 1 FROM "artifacts" a
        WHERE a."appsId" = OLD."id"
        LIMIT 1));
END;
