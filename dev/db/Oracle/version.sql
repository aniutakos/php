/*                                                                         */
/* This procedure initializes VERSION_CONTROL database with ConfigurationFilesClient data     */
/*                                                                         */
/* (in case no rows to delete are found "DELETE" command is harmless)      */
/*                                                                         */
/*   Script should be stored in Unix format.                               */


SET SERVEROUTPUT ON;
ALTER SESSION SET CURRENT_SCHEMA = CONFIG_DB;
begin
	DBMS_OUTPUT.PUT_LINE('
	DELETE FROM VERSION_CONTROL WHERE RELEASE_NAME = "ConfigurationFilesClient" AND TTI_VERSION_NAME = "@version.full@";
	');
	DELETE FROM VERSION_CONTROL WHERE RELEASE_NAME = 'ConfigurationFilesClient' AND TTI_VERSION_NAME = '@version.full@';
	DBMS_OUTPUT.PUT_LINE('OK');
exception
	when others then
		DBMS_OUTPUT.PUT_LINE('sqlCode:' || sqlcode || ' -raise exception');
        raise;
end;
/
begin
	DBMS_OUTPUT.PUT_LINE('INSERT INTO VERSION_CONTROL (RELEASE_NAME,LEVEL_NAME,PROJECT_LEVEL_NAME,TTI_VERSION_NAME,PERFORMED_ACTION, INSTALLATION_DATE,CREATION_DATE,COMMENTS,CLIENT_BUILD,PATCH_NUMBER,SHOW_MESSAGE)');
	DBMS_OUTPUT.PUT_LINE('VALUES ("ConfigurationFilesClient","@version.123@",null,"@version.full@","B",systimestamp,TO_TIMESTAMP ("@current.date@", "YYYY-MM-DD"),"HelixUI @version.full@",null,"@version.patch@",null);');
	INSERT INTO VERSION_CONTROL (
			RELEASE_NAME,
			LEVEL_NAME,
			PROJECT_LEVEL_NAME,
			TTI_VERSION_NAME,
			PERFORMED_ACTION,
			INSTALLATION_DATE,
			CREATION_DATE,
			COMMENTS,
			CLIENT_BUILD,
			PATCH_NUMBER,
			SHOW_MESSAGE)
		VALUES (
			'ConfigurationFilesClient',
			'@version.123@',
			null,
			'@version.full@',
			'B',
			systimestamp,
			TO_TIMESTAMP ('@current.date@', 'YYYY-MM-DD'),
			'ConfigurationFilesClient @version.full@',
			null,
			'@version.patch@',
			null);
		DBMS_OUTPUT.PUT_LINE('OK');
exception
    when dup_val_on_index then
		DBMS_OUTPUT.PUT_LINE('dup_val_on_index -raise exception');
        null;
    when others then
		DBMS_OUTPUT.PUT_LINE('sqlCode:' || sqlcode || ' -raise exception');
        raise;
end;
/


COMMIT;

