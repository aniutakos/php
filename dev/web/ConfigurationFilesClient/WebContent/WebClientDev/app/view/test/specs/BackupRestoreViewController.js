describe('getOperationStatusValue', function() {

    beforeEach(function() {
        var me = this;

        me.grid = Ext.create('Ext.grid.Panel');
        me.store = Ext.create('Ext.data.Store');
        me.vm = Ext.create('Ext.app.ViewModel');
        me.view = Ext.create('Ext.panel.Panel');
        me.backupRestoreViewController = Ext.create('ConfigurationFilesClient.view.BackupRestoreViewController');
        BackupOperationsIndexerService.ResetData();


        spyOn(me.view, "getViewModel").and.returnValue(me.vm);
        spyOn(me.vm, "getStore").and.returnValue(me.store);
        spyOn(me.grid, "getStore").and.returnValue(me.store);
        spyOn(me.store, "reload");
        spyOn(BackupOperationsIndexerService, 'fireEvent').and.returnValue(null);

        spyOn(me.backupRestoreViewController, "getView").and.returnValue(me.view);

        spyOn(Ext.ComponentMgr, 'get').and.callFake(function(componentId) {
            if (componentId == 'ne-grid')
                return me.grid;
        });
    });

    it('pollRefreshNeListTask_whenRefreshIsInProgress_willNotCallReload', function() {

        var me = this;

        me.backupRestoreViewController.refreshNeListTaskInProgress = me;

        me.backupRestoreViewController.pollRefreshNeListTask();

        expect(me.store.reload).not.toHaveBeenCalled();
    });

    it('pollRefreshNeListTask_calledWhenItemIsSelectedInGrid_sameSelectionWillRemainAfterReload', function() {

        var me = this;

        me.store.loadData([{ id: 1, label: 'first' }, { id: 2, label: 'second' }, { id: 3, label: 'third' }]);

        me.grid.setStore(me.store);

        // select first item
        me.grid.selection = me.grid.getStore().getData().items[0];

        var selectedBeforeReload = me.grid.selection.getData().id;

        me.backupRestoreViewController.refreshNeListTaskInProgress = false;

        me.backupRestoreViewController.pollRefreshNeListTask();

        expect(me.store.reload).toHaveBeenCalled();

        var selectedAfterReload = me.grid.selection.getData().id;

        expect(selectedBeforeReload == selectedAfterReload).toBe(true);
    });

    it('getDistinctValues_givenValidValues_returnsValidResponse', function() {
        var me = this;

        var records = [{ id: 1, value: 'value1', get(prop) { return this[prop]; } },
            { id: 2, value: 'value2', get(prop) { return this[prop]; } },
            { id: 3, value: 'value1', get(prop) { return this[prop]; } },
            { id: 4, value: 'value2', get(prop) { return this[prop]; } },
            { id: 5, value: 'value3', get(prop) { return this[prop]; } }
        ];

        var res = me.backupRestoreViewController.getDistinctValues(records, 2, 'value');
        expect(res.length).toBe(2);

        res = me.backupRestoreViewController.getDistinctValues(records, 1, 'value');
        expect(res.length).toBe(1);
    });

    it('getDistinctValues_givenInValidValues_returnsEmptyResponse', function() {
        var me = this;

        var records = [{ id: 1, value: 'value1', get(prop) { return this[prop]; } },
            { id: 2, value: 'value2', get(prop) { return this[prop]; } },
            { id: 3, value: 'value1', get(prop) { return this[prop]; } },
            { id: 4, value: 'value2', get(prop) { return this[prop]; } },
            { id: 5, value: 'value3', get(prop) { return this[prop]; } }
        ];

        var res = me.backupRestoreViewController.getDistinctValues(records, 0, 'value');
        expect(res.length).toBe(0);

        res = me.backupRestoreViewController.getDistinctValues(records, 4, 'value');
        expect(res.length).toBe(0);
    });

    it('getDistinctValues_givenNoValues_returnsEmptyResponse', function() {
        var me = this;

        var records = [];

        var res = me.backupRestoreViewController.getDistinctValues(records, 0, 'value');
        expect(res.length).toBe(0);

        res = me.backupRestoreViewController.getDistinctValues(records, 1, 'value');
        expect(res.length).toBe(0);
    });

    it('pollBackupOperationsProgress_whenCalled_increasesTheCycleCounter', function() {
        var me = this;

        me.backupRestoreViewController.CheckScriptExecutionStatusIntervalSeconds = 1;
        me.backupRestoreViewController.CheckScriptLongExecutionStatusIntervalSeconds = 3;
        me.backupRestoreViewController.backupOperationsCycleCounter = 0;
        me.backupRestoreViewController.maxBackupOperationsCycle = 3;

        BackupOperationsIndexerService.AddNewOperation(11111);

        me.backupRestoreViewController.pollBackupOperationsProgress();

        expect(me.backupRestoreViewController.backupOperationsCycleCounter).toBe(1);
    });

    it('pollBackupOperationsProgress_whenReachingMaxOperationsCycle_willRunOnAllActiveOperations', function() {
        var me = this;

        me.backupRestoreViewController.CheckScriptExecutionStatusIntervalSeconds = 1;
        me.backupRestoreViewController.CheckScriptLongExecutionStatusIntervalSeconds = 3;
        me.backupRestoreViewController.backupOperationsCycleCounter = 0;
        me.backupRestoreViewController.maxBackupOperationsCycle = 3;

        BackupOperationsIndexerService.AddNewOperation(11111);

        spyOn(BackupOperationsIndexerService, 'GetAllActiveOperationsNeIds').and.callThrough();

        me.backupRestoreViewController.pollBackupOperationsProgress(); // 0
        expect(BackupOperationsIndexerService.GetAllActiveOperationsNeIds).not.toHaveBeenCalledWith(-1);

        me.backupRestoreViewController.pollBackupOperationsProgress(); // 1
        expect(BackupOperationsIndexerService.GetAllActiveOperationsNeIds).not.toHaveBeenCalledWith(-1);

        me.backupRestoreViewController.pollBackupOperationsProgress(); // 2
        expect(BackupOperationsIndexerService.GetAllActiveOperationsNeIds).not.toHaveBeenCalledWith(-1);

        me.backupRestoreViewController.pollBackupOperationsProgress(); // 3 (the MaxCycle value) => 0 , and run on all cycle Values
        expect(BackupOperationsIndexerService.GetAllActiveOperationsNeIds).toHaveBeenCalledWith(-1);
    });

    it('pollBackupOperationsProgress_whenReachedTimeoutForNe_willChangeNeCycleLevel', function() {
        var me = this;

        me.backupRestoreViewController.CheckScriptExecutionStatusIntervalSeconds = 1;
        me.backupRestoreViewController.CheckScriptLongExecutionStatusIntervalSeconds = 3;
        me.backupRestoreViewController.backupOperationsCycleCounter = 0;
        me.backupRestoreViewController.maxBackupOperationsCycle = 3;

        BackupOperationsIndexerService.AddNewOperation(11111);

        var data = BackupOperationsIndexerService.GetOperationData(11111);
        expect(data.cycleLevel).toBe(1);

        spyOn(me.backupRestoreViewController, 'didBackupOperationTimeOut').and.returnValue(true);

        me.backupRestoreViewController.pollBackupOperationsProgress();

        data = BackupOperationsIndexerService.GetOperationData(11111);
        expect(data.cycleLevel).toBe(2);
    });

});