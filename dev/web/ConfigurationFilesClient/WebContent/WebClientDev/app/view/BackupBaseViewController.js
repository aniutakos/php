Ext.define('ConfigurationFilesClient.view.BackupBaseViewController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.backupbase',

    getSourceTypeText: function(value) {
        var sourceTypeObj = {};

        switch (value.toLowerCase()) {
            case 'manual':
                sourceTypeObj.styleName = 'source-manual-cell';
                sourceTypeObj.translateKey = 'ConfigurationFilesClient.BackupRestoreView.BackupFilesView.ManualSource';
                sourceTypeObj.backgroundImageHtml = Ext.String.format("url({0}) no-repeat left center", Ext.getResourcePath('icons/source_manual.svg'));
                break;
            case 'alarm':
                sourceTypeObj.styleName = 'source-alarm-cell';
                sourceTypeObj.translateKey = 'ConfigurationFilesClient.BackupRestoreView.BackupFilesView.AlarmSource';
                sourceTypeObj.backgroundImageHtml = Ext.String.format("url({0}) no-repeat left center", Ext.getResourcePath('icons/source_alarm.svg'));
                break;
            case 'schedule':
            case 'scheduler':
                sourceTypeObj.styleName = 'source-schedule-cell';
                sourceTypeObj.translateKey = 'ConfigurationFilesClient.BackupRestoreView.BackupFilesView.ScheduleSource';
                sourceTypeObj.backgroundImageHtml = Ext.String.format("url({0}) no-repeat left center", Ext.getResourcePath('icons/source_schedule.svg'));
                break;
        }

        return sourceTypeObj;
    }

});