/**
 * Created by igors on 07/11/2018.
 */
describe('fillFileContents', function() {
    beforeEach(function() {
        var me = this;
        me.vm = Ext.create('Ext.app.ViewModel');
        me.contentsFieldName = 'someName';
        me.deferred = Ext.create('Ext.Deferred');
        me.controller = Ext.create('ConfigurationFilesClient.view.BackupFilesViewController');

        spyOn(me.controller, 'getFileAsync').and.callFake(function(fileName, filePath) {
            return me.deferred.promise;
        })
    });

    it('empty file contents', function() {
        var me = this;
        me.deferred.resolve();

        me.controller.fillFileContents(null, me.vm, me.contentsFieldName);

        expect(me.vm.get(me.contentsFieldName)).toBeNull();

        expect(me.controller.getFileAsync).not.toHaveBeenCalled();
    });

    it('not empty file contents', function() {
        var me = this,
            newValue = Ext.create('Ext.app.ViewModel'),
            fileContents = "Some contents",
            filePath = 'somePath',
            fileName = 'someName';
        newValue.set('FilePath', filePath);
        newValue.set('FileName', fileName);
        me.deferred.resolve(fileContents);

        me.controller.fillFileContents(newValue, me.vm, me.contentsFieldName);
        me.deferred.promise.then(function() {
            expect(me.vm.get(me.contentsFieldName)).not.toBeNull();
        });

        expect(me.controller.getFileAsync).toHaveBeenCalledTimes(1);
        expect(me.controller.getFileAsync).toHaveBeenCalledWith(fileName, filePath);
    });

    it('not empty file contents with error', function() {
        var me = this,
            newValue = Ext.create('Ext.app.ViewModel'),
            errMsg = "Some err",
            filePath = 'somePath',
            fileName = 'someName',
            fileFieldName = 'fileName1';
        newValue.set('FilePath', filePath);
        newValue.set('FileName', fileName);
        me.deferred.reject(errMsg);

        me.controller.fillFileContents(newValue, me.vm, me.contentsFieldName);
        me.deferred.promise.then(function() {
            expect(me.vm.get(me.contentsFieldName)).toBeNull();
            expect(me.vm.get(fileFieldName)).toBeNull();
            expect(ExtCore.ux.message.MessageBox.alert).toHaveBeenCalled();
        });

        expect(me.controller.getFileAsync).toHaveBeenCalledTimes(1);
        expect(me.controller.getFileAsync).toHaveBeenCalledWith(fileName, filePath);
    });
});

describe('initAuthorizations', function() {
    beforeEach(function() {
        var me = this;
        me.vm = Ext.create('Ext.app.ViewModel');
        me.controller = Ext.create('ConfigurationFilesClient.view.BackupFilesViewController');

        spyOn(me.controller, 'getViewModel').and.callFake(function() {
            return me.vm;
        });
        spyOn(SessionProvider, 'getAppName').and.returnValue('app1');
        spyOn(me.vm, 'set').and.callThrough();
    });

    it('view model set -  all permitted', function() {
        var me = this;
        AuthorizationProvider.actions = ["app1:delete-files", "app1:manual-restore"];
        me.controller.initAuthorizations();

        expect(me.vm.get('restoreAuthorized')).toEqual(true);
        expect(me.vm.get('deleteAuthorized')).toEqual(true);

        expect(me.vm.set).toHaveBeenCalledTimes(2);
    });

    it('view model set -  nothing permitted', function() {
        var me = this;
        AuthorizationProvider.actions = [];
        me.controller.initAuthorizations();

        expect(me.vm.get('restoreAuthorized')).toEqual(false);
        expect(me.vm.get('deleteAuthorized')).toEqual(false);

        expect(me.vm.set).toHaveBeenCalledTimes(2);
    });
});

describe('onBoxReady', function() {
    beforeEach(function() {
        var me = this;
        me.vm = Ext.create('Ext.app.ViewModel');
        me.controller = Ext.create('ConfigurationFilesClient.view.BackupFilesViewController');
        spyOn(me.controller, 'getViewModel').and.callFake(function() {
            return me.vm;
        });
    });

    it('call all functions', function() {
        var me = this;
        spyOn(me.vm, 'bind');
        spyOn(me.controller, 'initGridColumns');
        spyOn(me.controller, 'initAuthorizations');
        me.controller.onBoxReady();

        expect(me.vm.bind).toHaveBeenCalledTimes(3);
        expect(me.vm.bind).toHaveBeenCalledWith('{selectedNetworkElements}', jasmine.any(Function), jasmine.any(Object));
        expect(me.vm.bind).toHaveBeenCalledWith('{compareFile1}', jasmine.any(Function), jasmine.any(Object));
        expect(me.vm.bind).toHaveBeenCalledWith('{compareFile2}', jasmine.any(Function), jasmine.any(Object));
        expect(me.controller.initGridColumns).toHaveBeenCalledTimes(1);
        expect(me.controller.initAuthorizations).toHaveBeenCalledTimes(1);
    });
});

describe('initGridColumns', function() {
    beforeEach(function() {
        var me = this;
        me.vm = Ext.create('Ext.app.ViewModel');
        me.controller = Ext.create('ConfigurationFilesClient.view.BackupFilesViewController');
        ConfigurationFilesClient.app = {};
        spyOn(me.controller, 'getViewModel').and.callFake(function() {
            return me.vm;
        });
    });

    it('call all functions and fill all columns', function() {
        var me = this;
        spyOn(MetadataClassService, 'getProjectionWithAttributesDefinitions').and.callFake(function() {
            return { AttributeRef: [{ 'name': 'col1', label: 'col1Label' }] };
        });
        spyOn(LocalizationProvider, 'getLocalizedResource').and.returnValue("stam-translation");
        spyOn(me.controller, 'createCompareColumnDef').and.callThrough();
        spyOn(me.controller, 'updateSourceTypeColumnDef');

        var grid = Ext.create('Ext.grid.Panel');
        spyOn(me.controller, 'getGrid').and.callFake(function() {
            return grid;
        });

        me.controller.initGridColumns();

        expect(me.controller.createCompareColumnDef).toHaveBeenCalledTimes(2);
        expect(me.controller.updateSourceTypeColumnDef).toHaveBeenCalledTimes(1);
        expect(grid.getColumns().length).toEqual(3);
    });
});

describe('deleteFiles', function() {
    beforeEach(function() {
        var me = this;
        me.vm = Ext.create('Ext.app.ViewModel');
        me.controller = Ext.create('ConfigurationFilesClient.view.BackupFilesViewController');
        spyOn(me.controller, 'getViewModel').and.callFake(function() {
            return me.vm;
        });

        me.deferred = Ext.create('Ext.Deferred');

        spyOn(me.controller, 'deleteFilesAsync').and.callFake(function(fileNames) {
            return me.deferred.promise;
        });

        spyOn(me.controller, 'clearComparedFiles4Delete');
        spyOn(me.controller, 'auditDeleteFiles');
        spyOn(me.controller, 'refreshFiles');
        spyOn(ExtCore.ux.message.MessageBox, 'alert');
    });

    it('without prompt ', function() {
        var me = this,
            filesMap = new Ext.util.HashMap();
        filesMap.add('Id11', 'File11');
        filesMap.add('Id12', 'File22');

        me.controller.deleteFiles(filesMap, false);
        me.deferred.resolve();
        me.deferred.promise.then(function() {
            expect(me.controller.auditDeleteFiles).toHaveBeenCalled();
            expect(me.controller.refreshFiles).toHaveBeenCalled();
            expect(ExtCore.ux.message.MessageBox.alert).toHaveBeenCalledWith('kuku', jasmine.any(Object), jasmine.any(Object));
        });

        expect(me.controller.deleteFilesAsync).toHaveBeenCalled();
        expect(me.controller.clearComparedFiles4Delete).toHaveBeenCalled();
    });

    it('without prompt with error ', function() {
        var me = this,
            filesMap = new Ext.util.HashMap();
        filesMap.add('Id11', 'File11');
        filesMap.add('Id12', 'File22');

        me.controller.deleteFiles(filesMap, false);
        me.deferred.promise.then(function() {
            expect(me.controller.auditDeleteFiles).toHaveBeenCalled();
            expect(me.controller.refreshFiles).toHaveBeenCalled();
        });

        me.deferred.reject();

        expect(me.controller.deleteFilesAsync).toHaveBeenCalled();
        expect(me.controller.clearComparedFiles4Delete).toHaveBeenCalled();
    });

    it('getSorterFnForColumn', function() {
        var me = this;

        var columnIndexName = 'columnIndex';

        var sortFn = me.controller.getSorterFnForColumn();

        expect(sortFn({ get: function(x) { return 'aaaa'; } }, { get: function(x) { return 'aaaa'; } })).toBe(0);
        expect(sortFn({ get: function(x) { return 'aaaa'; } }, { get: function(x) { return 'bbbb'; } })).toBe(-1);
        expect(sortFn({ get: function(x) { return 'bbbb'; } }, { get: function(x) { return 'aaaa'; } })).toBe(1);
        expect(sortFn({ get: function(x) { return 'aaaa'; } }, { get: function(x) { return 'AAAA'; } })).toBe(0);
        expect(sortFn({ get: function(x) { return 'AAAA'; } }, { get: function(x) { return 'bbbb'; } })).toBe(-1);
        expect(sortFn({ get: function(x) { return 'bbbb'; } }, { get: function(x) { return 'AAAA'; } })).toBe(1);
        expect(sortFn({ get: function(x) { return 'aAaA'; } }, { get: function(x) { return 'AaAa'; } })).toBe(0);
        expect(sortFn({ get: function(x) { return null; } }, { get: function(x) { return 'AaAa'; } })).toBe(-1);
        expect(sortFn({ get: function(x) { return 'aaaa'; } }, { get: function(x) { return null; } })).toBe(1);
        expect(sortFn({ get: function(x) { return null; } }, { get: function(x) { return null; } })).toBe(0);


    })
});