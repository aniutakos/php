describe('BackupRestoreViewModel tests', function() {

    beforeEach(function() {
        var me = this;

        me.view = Ext.create('Ext.panel.Panel');
        me.backupRestoreViewController = Ext.create('ConfigurationFilesClient.view.BackupRestoreViewController');

        me.backFilesViewModel = Ext.create('ConfigurationFilesClient.view.BackupRestoreViewModel');

        me.getView = function() { return this[x].view; }

        spyOn(me.backFilesViewModel, "getView").and.returnValue(me.view);
        spyOn(me.view, "getController").and.returnValue(me.backupRestoreViewController);
        spyOn(me, "getView").and.returnValue(me.view);
    });

    it('shouldEnableBackupButton_whenRefreshNeIsInProgress_willReturnFalse', function() {

        var me = this;

        me.backupRestoreViewController.refreshNeListTaskInProgress = true;

        //me.backFilesViewModel.getFormulas().areNetworkElementsSelected.get(me.backFilesViewModel.data);

        //var backupButtonEnabled = me.backFilesViewModel.shouldEnableBackupButton;

        //var backupButtonEnabled = me.backFilesViewModel.getFormulas().shouldEnableBackupButton.get(me.backFilesViewModel.data);


        // var vm = new Ext.app.ViewModel();
        // var spy = jasmine.createSpy();
        // vm.bind('{foo}', spy);
        // vm.set('foo', 1);
        // vm.notify();
        // expect(spy).toHaveBeenCalled();
        // expect(spy.mostRecentCall.args[0]).toBe(1);

        me.backFilesViewModel.notify();

        var backupButtonEnabled = me.backFilesViewModel.get('shouldEnableBackupButton');

        expect(backupButtonEnabled).toBe(false);
    });

    it('shouldEnableBackupButton_whenNoNEsAreSelected_willReturnFalse', function() {

        var me = this;

        me.backupRestoreViewController.refreshNeListTaskInProgress = false;

        me.backFilesViewModel.set('selectedNetworkElements', []);

        me.backFilesViewModel.notify();

        var backupButtonEnabled = me.backFilesViewModel.get('shouldEnableBackupButton');

        expect(backupButtonEnabled).toBe(false);
    });

    it('shouldEnableBackupButton_whenNoFileTypesAvailable_willReturnFalse', function() {

        var me = this;

        me.backupRestoreViewController.refreshNeListTaskInProgress = false;

        me.backFilesViewModel.set('selectedNetworkElements', [{ get: function(x) { return this[x]; }, ObjectId: '1111' }, { get: function(x) { return this[x]; }, ObjectId: '2222' }]);

        me.backFilesViewModel.set('numOfFileTypesForCurrentNes', 0);

        me.backFilesViewModel.notify();

        var backupButtonEnabled = me.backFilesViewModel.get('shouldEnableBackupButton');

        expect(backupButtonEnabled).toBe(false);
    });

    it('shouldEnableBackupButton_whenSelectedNEsAreInBackupProgress_willReturnFalse', function() {

        var me = this;

        me.backupRestoreViewController.refreshNeListTaskInProgress = false;
        me.backFilesViewModel.set('selectedNetworkElements', [{ get: function(x) { return this[x]; }, ObjectId: '1111' }, { get: function(x) { return this[x]; }, ObjectId: '2222' }]);
        me.backFilesViewModel.set('numOfFileTypesForCurrentNes', 1);
        spyOn(BackupOperationsIndexerService, 'GetAllActiveOperationsNeIds').and.returnValue(['1111']);
        me.backFilesViewModel.set('areNetworkElementsBackupInProgress', true);

        me.backFilesViewModel.notify();

        var backupButtonEnabled = me.backFilesViewModel.get('shouldEnableBackupButton');

        expect(backupButtonEnabled).toBe(false);
    });

    it('shouldEnableBackupButton_whenNoSelectedNEsAreInBackupProgress_willReturnTrue', function() {

        var me = this;

        me.backupRestoreViewController.refreshNeListTaskInProgress = false;
        me.backFilesViewModel.set('selectedNetworkElements', [{ get: function(x) { return this[x]; }, ObjectId: '1111' }, { get: function(x) { return this[x]; }, ObjectId: '2222' }]);
        me.backFilesViewModel.set('numOfFileTypesForCurrentNes', 1);
        spyOn(BackupOperationsIndexerService, 'GetAllActiveOperationsNeIds').and.returnValue(['3333']);
        me.backFilesViewModel.set('areNetworkElementsBackupInProgress', true);

        me.backFilesViewModel.notify();

        var backupButtonEnabled = me.backFilesViewModel.get('shouldEnableBackupButton');

        expect(backupButtonEnabled).toBe(true);
    });

    it('shouldEnableBackupButton_whenNoNEsAreInBackupProgress_willReturnTrue', function() {

        var me = this;

        me.backupRestoreViewController.refreshNeListTaskInProgress = false;
        me.backFilesViewModel.set('selectedNetworkElements', [{ get: function(x) { return this[x]; }, ObjectId: '1111' }, { get: function(x) { return this[x]; }, ObjectId: '2222' }]);
        me.backFilesViewModel.set('numOfFileTypesForCurrentNes', 1);
        spyOn(BackupOperationsIndexerService, 'GetAllActiveOperationsNeIds').and.returnValue([]);
        me.backFilesViewModel.set('areNetworkElementsBackupInProgress', true);

        me.backFilesViewModel.notify();

        var backupButtonEnabled = me.backFilesViewModel.get('shouldEnableBackupButton');

        expect(backupButtonEnabled).toBe(true);
    });


});