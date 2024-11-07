CREATE TRIGGER add_app_to_purge_artifact
AFTER DELETE ON "apps"
FOR EACH ROW
BEGIN
    INSERT INTO "purgeAppArtifact" (orgId, appId)
    VALUES (OLD."organizationsId", OLD."id");
END;
