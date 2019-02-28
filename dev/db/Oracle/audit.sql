ALTER SESSION SET CURRENT_SCHEMA = audit_db;

begin
INSERT INTO modules (MODULE_ID, MODULE_NAME) VALUES (1500, 'ConfigurationDirector');
exception
    when dup_val_on_index then
        null;
    when others then
        raise;
end;
/
begin
INSERT INTO sub_modules (MODULE_ID, SUB_MODULE_ID, SUB_MODULE_NAME) VALUES (1500, 1550, 'ConfigurationDirector');
exception
    when dup_val_on_index then
        null;
    when others then
        raise;
end;
/
begin
INSERT INTO sec_app_audit_event(event_id, event_severity,event_description,event_logged) VALUES('CD_Run_Manual_Backup',3,'Backup file manually','y');
exception
    when dup_val_on_index then
        null;
    when others then
        raise;
end;
/
begin
INSERT INTO sec_app_audit_event(event_id, event_severity,event_description,event_logged) VALUES('CD_Run_Manual_Restore',5,'Restore file manually','y');
exception
    when dup_val_on_index then
        null;
    when others then
        raise;
end;
/
begin
INSERT INTO sec_app_audit_event(event_id, event_severity,event_description,event_logged) VALUES('CD_Delete_File',4,'Delete files','y');
exception
    when dup_val_on_index then
        null;
    when others then
        raise;
end;
/
begin
INSERT INTO sec_app_audit_event(event_id, event_severity,event_description,event_logged) VALUES('CD_Add_Scheduled_Job',4,'Add a new scheduled job','y');
exception
    when dup_val_on_index then
        null;
    when others then
        raise;
end;
/
begin
INSERT INTO sec_app_audit_event(event_id, event_severity,event_description,event_logged) VALUES('CD_Delete_Scheduled_Job',4,'Delete a scheduled job','y');
exception
    when dup_val_on_index then
        null;
    when others then
        raise;
end;
/
begin
INSERT INTO sec_app_audit_event(event_id, event_severity,event_description,event_logged) VALUES('CD_Edit_Scheduled_Job',4,'Edit a scheduled job','y');
exception
    when dup_val_on_index then
        null;
    when others then
        raise;
end;
/
