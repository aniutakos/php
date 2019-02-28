describe('BakupFilesFilesViewModel tests', function() {

    beforeEach(function() {
        var me = this;

        me.view = Ext.create('Ext.panel.Panel');
        //me.backupRestoreViewController = Ext.create('ConfigurationFilesClient.view.BackupRestoreViewController');

        me.backupFilesViewModel = Ext.create('ConfigurationFilesClient.view.BackupFilesViewModel');

        //me.getView = function() { return this[x].view; }

        spyOn(me.backupFilesViewModel, "getView").and.returnValue(me.view);
        //spyOn(me.view, "getController").and.returnValue(me.backupRestoreViewController);
        //spyOn(me, "getView").and.returnValue(me.view);
    });

    it('restoreDisabled_whenSingleFileSelectedAndAuthorized_willReturnFalse', function() {

        var me = this;

        me.backupFilesViewModel.set('areNetworkElementsBackupInProgress', false);
        me.backupFilesViewModel.set('restoreAuthorized', true);
        me.backupFilesViewModel.set('isOneFileSelected', true);
        me.backupFilesViewModel.set('selectedFiles', ['file1']);
        me.backupFilesViewModel.set('selectedNetworkElements', [{ get: function(x) { return this[x]; }, ObjectId: '1111' }]);

        me.backupFilesViewModel.notify();

        var restoreDisabled = me.backupFilesViewModel.get('restoreDisabled');

        expect(restoreDisabled).toBe(false);
    });

    it('restoreDisabled_whenNetworkElementsInProgress_willReturnTrue', function() {

        var me = this;

        me.backupFilesViewModel.set('areNetworkElementsBackupInProgress', true);
        me.backupFilesViewModel.set('restoreAuthorized', true);
        me.backupFilesViewModel.set('isOneFileSelected', true);
        me.backupFilesViewModel.set('selectedFiles', ['file1', 'file2']);
        me.backupFilesViewModel.set('selectedNetworkElements', [{ get: function(x) { return this[x]; }, ObjectId: '1111' }]);

        me.backupFilesViewModel.notify();

        var restoreDisabled = me.backupFilesViewModel.get('restoreDisabled');

        expect(restoreDisabled).toBe(true);
    });

    it('restoreDisabled_whenNotAuthorized_willReturnTrue', function() {

        var me = this;

        me.backupFilesViewModel.set('areNetworkElementsBackupInProgress', false);
        me.backupFilesViewModel.set('restoreAuthorized', false);
        me.backupFilesViewModel.set('isOneFileSelected', true);
        me.backupFilesViewModel.set('selectedFiles', ['file1', 'file2']);
        me.backupFilesViewModel.set('selectedNetworkElements', [{ get: function(x) { return this[x]; }, ObjectId: '1111' }]);

        me.backupFilesViewModel.notify();

        var restoreDisabled = me.backupFilesViewModel.get('restoreDisabled');

        expect(restoreDisabled).toBe(true);
    });

    it('restoreDisabled_whenMoreThanOneFileIsSelected_willReturnTrue', function() {

        var me = this;

        me.backupFilesViewModel.set('areNetworkElementsBackupInProgress', false);
        me.backupFilesViewModel.set('restoreAuthorized', true);
        me.backupFilesViewModel.set('isOneFileSelected', false);
        me.backupFilesViewModel.set('selectedFiles', ['file1', 'file2']);
        me.backupFilesViewModel.set('selectedNetworkElements', [{ get: function(x) { return this[x]; }, ObjectId: '1111' }]);

        me.backupFilesViewModel.notify();

        var restoreDisabled = me.backupFilesViewModel.get('restoreDisabled');

        expect(restoreDisabled).toBe(true);
    });

});