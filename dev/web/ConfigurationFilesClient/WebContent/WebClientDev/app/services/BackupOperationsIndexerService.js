const DATETIME_TIMESTAMP_FORMAT = 'Y-m-d.H-i-s-u';

const OperationTypeValues = Object.freeze({
    Backup: { actionTypeValue: "Backup" },
    Restore: { actionTypeValue: "Restore" }
});

Ext.define('ConfigurationFilesClient.services.BackupOperationsIndexerService', {
    alternateClassName: 'BackupOperationsIndexerService',
    extend: 'Ext.Component',
    singleton: true,
    requires: [
        'Ext.Deferred',
    ],



    //stores: {
    operationsDataStore: new Ext.data.SimpleStore({
        storeId: 'operationsDataStore',
        fields: [
            { name: 'creationDateTime', type: 'date', dateFormat: 'Y-m-d H:i:s' },
            'executionId',
            'neId',
            'operationType',
            { name: 'cycleLevel', type: 'int' }
        ]
    }),
    //},

    initComponent: function() {
        var me = this;

        me.ResetData();

        me.fireEvent('contentsChanged', me, me.GetNumOfActiveBackupOperations());
    },

    GetDateTimeStamp: function(datetime) {
        return Ext.Date.format(datetime, DATETIME_TIMESTAMP_FORMAT);
    },

    GetSessionId: function() {
        return ExtCore.services.SessionProvider.getSession();
    },

    CreateUniqueId: function() {
        var me = this;

        var timestamp = me.GetDateTimeStamp(new Date(Ext.Date.now())),
            sessionId = me.GetSessionId();

        me.runningIndex++;

        return Ext.String.format('{0}.{1}.{2}', timestamp, me.runningIndex, sessionId);
    },

    AddNewOperationImp: function(neId, uniqueId, operationType) {
        var me = this;

        var existingRecord = me.operationsDataStore.findRecord('neId', neId, 0, false, false, true);
        if (existingRecord != null) {
            existingRecord.set('creationDateTime', new Date(Date.now()));
            existingRecord.set('executionId', uniqueId);
            existingRecord.set('operationType', operationType);
            existingRecord.set('cycleLevel', 1);

            return existingRecord;
        } else {
            var record = me.operationsDataStore.add({
                neId: neId,
                executionId: uniqueId,
                creationDateTime: new Date(Date.now()),
                operationType: operationType,
                cycleLevel: 1
            })
            return record;
        }

    },

    AddNewOperation: function(neIds, operationType) {
        var me = this;

        if (neIds == undefined || neIds == null)
            return;

        var uniqueId = me.CreateUniqueId();

        if (Ext.isArray(neIds)) {
            Ext.Array.forEach(neIds, function(item, index, allItems) { me.AddNewOperationImp(item, uniqueId, operationType) }, this);
        } else
            me.AddNewOperationImp(neIds, uniqueId, operationType);

        me.fireEvent('contentsChanged', me, me.GetNumOfActiveBackupOperations());

        return uniqueId;
    },

    RemoveOperation: function(neId) {
        var me = this;

        var existingRecord = me.operationsDataStore.findRecord('neId', neId, 0, false, false, true);
        if (existingRecord != null)
            me.operationsDataStore.remove(existingRecord);

        me.fireEvent('contentsChanged', me, me.GetNumOfActiveBackupOperations());
    },

    SetCycleLevel: function(neId, level) {
        var me = this;

        var existingRecord = me.operationsDataStore.findRecord('neId', neId, 0, false, false, true);
        if (existingRecord != null)
            existingRecord.set('cycleLevel', level);

        //me.fireEvent('contentsChanged', me, me.GetNumOfActiveBackupOperations());
    },

    GetOperationData: function(neId) {
        var me = this;

        var record = me.operationsDataStore.findRecord('neId', neId, 0, false, false, true);
        if (record != null)
            return record.data;

        return null;
    },

    GetExecutionId: function(neId) {
        var me = this;

        var operationData = me.GetOperationData(neId);
        if (operationData == null)
            return null;
        return operationData.executionId;
    },

    GetStartTime: function(neId) {
        var me = this;

        var operationData = me.GetOperationData(neId);
        if (operationData == null)
            return null;
        return operationData.creationDateTime;
    },

    GetAllActiveOperationsNeIds: function(requestedCycleLevel) {
        var me = this;

        requestedCycleLevel = requestedCycleLevel || -1;

        var neIdsInProgress = [];

        if (me.operationsDataStore.getData() != null && Ext.isArray(me.operationsDataStore.getData().items))
            Ext.Array.forEach(me.operationsDataStore.getData().items, function(item, index, allItems) {
                if (requestedCycleLevel == -1)
                    neIdsInProgress.push(item.getData().neId);
                else {
                    if (item.getData().cycleLevel == requestedCycleLevel)
                        neIdsInProgress.push(item.getData().neId);
                }
            }, this);

        return neIdsInProgress;
    },

    GetNumOfActiveBackupOperations: function() {
        var me = this;

        if (!me.operationsDataStore.getData())
            return 0;

        return me.operationsDataStore.getData().items.length;
    },

    AreThereActiveBackupOperations: function() {
        var me = this;

        return me.GetNumOfActiveBackupOperations() > 0;
    },

    IsOperationActive: function(neId) {
        var me = this;

        var data = me.operationsDataStore.getData();
        if (!data)
            return false;

        var record = me.operationsDataStore.findRecord('neId', neId, 0, false, false, true);
        return record != null;
    },

    ResetData: function() {
        var me = this;

        me.operationsDataStore.data.removeAll();
        me.runningIndex = 0;
    },


});