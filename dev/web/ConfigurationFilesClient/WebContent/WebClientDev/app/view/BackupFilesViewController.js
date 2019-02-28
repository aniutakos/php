/**
 * Created by igors on 09/08/2018.
 */
Ext.define('ConfigurationFilesClient.view.BackupFilesViewController', {
    extend: 'ConfigurationFilesClient.view.BackupBaseViewController',
    alias: 'controller.backupfilesview',

    idFieldName: 'Id',
    fileFieldName: "FileName",
    fileTypeFieldName: "ConfFileTypeConfigId",
    filePathFieldName: "FilePath",
    sourceTypeFieldName: "SourceType",
    sourceNameFieldName: "SourceName",
    executionIdFieldName: "ExecutionId",
    neConfigIdFieldName: "NEConfigId",

    getBackupRestoreViewController: function() {
        var me = this;

        var brv = me.getView().up('backup-restore-view');
        if (brv)
            return brv.getController();

        return null;
    },

    onBoxReady: function() {
        var me = this,
            viewModel = this.getViewModel();
        viewModel.bind('{selectedNetworkElements}', me.selectedNEChanged, me);

        viewModel.bind('{compareFile1}', me.compareFile1Changed, me);

        viewModel.bind('{compareFile2}', me.compareFile2Changed, me);
        this.initGridColumns();
        this.initAuthorizations();

        BackupOperationsIndexerService.on({
            contentsChanged: {
                scope: this,
                fn: function(controller, numOfActiveOperations) {
                    var me = this;

                    me.getViewModel().set('areNetworkElementsBackupInProgress', numOfActiveOperations > 0);
                }
            }
        });
    },

    compareFile1Changed: function(newValue) {
        this.compareFileChanged(newValue, 'compareNE1', 'compare1', 'compareFile1Contents', 'compareFile1');
    },

    compareFile2Changed: function(newValue) {
        this.compareFileChanged(newValue, 'compareNE2', 'compare2', 'compareFile2Contents', 'compareFile2');
    },

    compareFileChanged: function(newValue, compareNE, compare, compareFileContents, compareFile) {
        var me = this,
            viewModel = this.getViewModel(),
            store = viewModel.getStore('backup_files_store'),
            selectedNE = viewModel.get('selectedNetworkElements');
        if (!Ext.isEmpty(selectedNE)) {
            viewModel.set(compareNE, selectedNE[0]);
            var oldCompareRec = store.findRecord(compare, true);
            if (!Ext.isEmpty(oldCompareRec))
                oldCompareRec.set(compare, false);
            if (!Ext.isEmpty(newValue))
                newValue.set(compare, true);
            me.fillFileContents(newValue, viewModel, compareFileContents, compareFile);
        }
    },


    selectedNEChanged: function(newValue) {
        // if refresh is currently in progress, don't change anything.
        var me = this,
            viewModel = me.getViewModel(),
            brvController = me.getBackupRestoreViewController();
        if (!brvController)
            return;

        if (brvController.refreshNeListTaskInProgress)
            return;

        // If no change was made in the selection, nothing to change
        var selectedNeIds = '';
        if (!Ext.isEmpty(newValue) && newValue.length > 0) {
            newValue.forEach(function(neObject) {
                selectedNeIds += neObject.getData().ObjectId;
            });
        }

        if (me.selectedNes == selectedNeIds)
            return;

        me.clearGridFilters();
        me.clearGridSorting();
        var isSingleElementSelected = (newValue && newValue.length == 1);
        viewModel.set("isSingleElementSelected", isSingleElementSelected);
        var store = viewModel.getStore('backup_files_store');
        if (isSingleElementSelected) {
            store.load();
        } else {
            store.removeAll();
            viewModel.set("isFilesFound", true);
        }

        me.selectedNes = selectedNeIds;
    },

    initAuthorizations: function() {
        var viewModel = this.getViewModel();
        viewModel.set('deleteAuthorized', AuthorizationProvider.canAct('delete-files'));
        viewModel.set('restoreAuthorized', AuthorizationProvider.canAct('manual-restore'));
    },

    fillFileContents: function(newValue, viewModel, contentsFieldName, fileFieldName) {
        if (Ext.isEmpty(newValue)) {
            viewModel.set(contentsFieldName, null);
        } else {
            var fileName = newValue.get('FileName'),
                filePath = newValue.get('FilePath');
            this.getFileAsync(fileName, filePath).then(
                function(data) {
                    viewModel.set(contentsFieldName, data);
                },
                function(err) {
                    viewModel.set(contentsFieldName, null);
                    viewModel.set(fileFieldName, null);
                    //ExtCore.ux.message.MessageBox.alert('error', 'Error', Ext.String.format("Failed to open file {0} {1} <BR> error: {2}", filePath, fileName, err));
                    ExtCore.ux.message.MessageBox.alert('error', 'Error', err);
                }
            );
        }

    },

    getSorterFnForColumn: function(columnIndex) {
        return function(rec1, rec2) {
            var val1 = '',
                val2 = '';

            if (!Ext.isEmpty(rec1) && !Ext.isEmpty(rec1.get(columnIndex)))
                val1 = rec1.get(columnIndex);

            if (!Ext.isEmpty(rec2) && !Ext.isEmpty(rec2.get(columnIndex)))
                val2 = rec2.get(columnIndex);

            var val1 = val1.trim().toLowerCase();
            var val2 = val2.trim().toLowerCase();

            if (val1 == val2)
                return 0;

            return (val1 > val2) ? 1 : -1;
        }
    },

    initGridColumns: function(grid) {
        var me = this;
        var displayProjection = MetadataClassService.getProjectionWithAttributesDefinitions(ConfigurationFilesClient.app.bcMetadataClassName4BackupFiles, 'Display');
        var columns = _.map(displayProjection.AttributeRef, function(column) {
            var resCol = { dataIndex: column.name, text: column.label, tooltip: column.tooltip, groupable: false };
            switch (column.type) {
                case 'string':
                    resCol.filter = { type: me.getFilterType(column.name) };
                    resCol.groupable = me.getGroupable(column.name);
                    resCol.sorter = me.getSorterFnForColumn(column.name);
                    break;
                case 'dateTime':
                    resCol.filter = { type: 'datetime' };
                    //resCol.filter = { type: 'date' };
                    resCol.xtype = 'datecolumn';
                    resCol.format = 'd/m/Y H:i:s';
                    resCol.tooltipFormatFn = me.gridTooltipFormatFn;
                    break;
            }
            return resCol;
        });
        var compareCol = me.createCompareColumnDef('1'),
            compareCol2 = me.createCompareColumnDef('2');
        columns.splice(0, 0, compareCol2);
        columns.splice(0, 0, compareCol);
        me.getGrid().controller = me;

        me.updateSourceTypeColumnDef(columns);
        me.getGrid().reconfigure(columns);
    },

    columnsNamesForListType: ["ConfFileTypeDisplayName", "SourceType", "SourceName"],

    getFilterType: function(columnName) {
        if (this.columnsNamesForListType.indexOf(columnName) >= 0)
            return 'list';
        else
            return 'string';
    },

    getGroupable: function(columnName) {
        return (this.columnsNamesForListType.indexOf(columnName) >= 0);
    },

    createCompareColumnDef: function(columnIndex) {
        var viewModel = this.getViewModel(),
            compare = 'compare' + columnIndex,
            compareFile1Title = LocalizationProvider.getLocalizedResource('ConfigurationFilesClient.BackupRestoreView.BackupFilesView.CompareFile' + columnIndex);
        var handlerFunction = (columnIndex == '1') ?
            function(grid, rowIndex, colIndex, item, e, record) {
                var compare1 = record.get('compare1'),
                    compare2 = record.get('compare2');
                if (compare1)
                    viewModel.set("compareFile1", null);
                else {
                    viewModel.set("compareFile1", record);
                    if (compare2)
                        viewModel.set("compareFile2", null);
                }
            } :
            function(grid, rowIndex, colIndex, item, e, record) {
                var compare1 = record.get('compare1'),
                    compare2 = record.get('compare2');
                if (compare2)
                    viewModel.set("compareFile2", null);
                else {
                    viewModel.set("compareFile2", record);
                    if (compare1)
                        viewModel.set("compareFile1", null);

                }
            };
        return {
            xtype: 'actioncolumn',
            menuDisabled: true,
            align: 'center',
            dataIndex: compare,
            maxWidth: 27,
            minWidth: 27,
            enableColumnHide: false,
            enableTextSelection: false,
            sortable: false,
            hideable: false,
            draggable: false,
            cls: 'action-compare-column',
            tooltip: compareFile1Title,
            header: '<img class="' + compare + '-icon" style="vertical-align:middle;background-color:white;" width="20" height="20" align="middle"/>',
            tooltipFormatFn: function() { return compareFile1Title },
            items: [{
                getClass: function(value, metedata, record) {
                    if (value) {
                        return compare + '-checked-icon';
                    }
                    return compare + '-icon';
                },
                handler: handlerFunction
            }]
        };
    },

    updateSourceTypeColumnDef: function(columns) {
        var sourceTypeCol = _.find(columns, { dataIndex: 'SourceType' });
        if (sourceTypeCol) {
            sourceTypeCol.renderer = function(value, meta) {

                var me = this;
                if (me.getController() == null)
                    return value;
                var sourceTypeResourceObj = me.getController().getSourceTypeText(value);

                if (sourceTypeResourceObj.styleName)
                    meta.tdCls = sourceTypeResourceObj.styleName;
                if (sourceTypeResourceObj.translateKey)
                    value = LocalizationProvider.getLocalizedResource(sourceTypeResourceObj.translateKey);

                return value;
            };

            sourceTypeCol.tooltipFormatFn = function(column, val, cellIndex, recordIndex) {
                var me = this;
                var sourceTypeResourceObj = me.findParentByType('grid').getController().getSourceTypeText(val);
                if (sourceTypeResourceObj.translateKey)
                    value = LocalizationProvider.getLocalizedResource(sourceTypeResourceObj.translateKey);

                return value;
            }
        }

    },

    getGrid: function() {
        return this.getView().down("gridpanel");
    },

    clearGridFilters: function() {
        this.getGrid().getPlugin('gridfilters').clearFilters();
    },

    clearGridSorting: function() {
        var grid = this.getGrid(),
            store = grid.getStore();
        store.sorters.clear();
        //grid.getHeaderContainer().setSortState();
    },

    gridTooltipFormatFn: function(cmp, value) {
        var resVal = value;
        //console.log('gridTooltipFormatFn  value:' + val);
        if (cmp && cmp.format) {
            switch (typeof value) {
                case "number":
                    resVal = Ext.util.Format.number(value, cmp.format);
                    break;
                case "date":
                    resVal = Ext.util.Format.date(value, cmp.format);
                    break;
                case "object":
                    if (!Ext.isEmpty(value) && value.getDate != undefined)
                        resVal = Ext.util.Format.date(value, cmp.format);
                    break;
            }
        }
        return resVal;
    },

    selectFiles: function(model, selected, opts) {
        var grid = this.getGrid(),
            plugin = grid.getView().getPlugin('gridviewdragdrop');
        if (selected && selected.length > 2)
            plugin.disable();
        else
            plugin.enable();
    },

    compareFilesClick: function() {
        this.openCompareDailog();
    },

    openCompareDailog: function() {
        var window = Ext.ComponentQuery.query('compare-files-window')[0];
        var vm = this.getViewModel();
        if (!window) {
            window = Ext.create('ConfigurationFilesClient.view.CompareFilesWindow', {
                viewModel: {
                    data: {
                        //originalFileName:file1Text,
                        //chengedFileName:file2Text,
                        compareFile1: vm.get('compareFile1'),
                        compareFile2: vm.get('compareFile2'),
                        compareFile1Contents: vm.get('compareFile1Contents'),
                        compareFile2Contents: vm.get('compareFile2Contents')

                    }
                }
            });
        }
        window.center();
        window.show();
    },

    storeload: function(store, records, successful, operation, eOpts) {
        var filesCount = store.getCount(),
            viewModel = this.getViewModel();
        viewModel.set("isFilesFound", (filesCount > 0));
        viewModel.set("filesCount", filesCount);
        this.updateCompareSelections(viewModel, store);
    },

    showSelectedFile: function(isDownload) {
        var selectedFiles = this.getViewModel().get("selectedFiles");
        if (!Ext.isEmpty(selectedFiles)) {
            var fileName = selectedFiles[0].get(this.fileFieldName),
                filePath = selectedFiles[0].get(this.filePathFieldName);
            this.getFile(fileName, filePath, isDownload);
        }
    },

    refreshNeList: function() {
        var me = this;

        var brvController = me.getBackupRestoreViewController();
        if (brvController)
            brvController.pollRefreshNeListTask();
    },

    canRestoreFileForNe: function(neId) {
        if (BackupOperationsIndexerService.IsOperationActive(neId))
            return false;
        return true;
    },

    confirmRestoreOperation: function(callerScope, neId, fileName) {

        var restoreWarningCaption = LocalizationManager.getLocalizedResource('ConfigurationFilesClient.BackupRestoreView.BackupFilesView.Restore');
        var restoreWarningMessage = LocalizationManager.getLocalizedResource('ConfigurationFilesClient.BackupRestoreView.BackupFilesView.RestoreUserWarningMessage');

        restoreWarningMessage = Ext.String.format(restoreWarningMessage, fileName);

        ExtCore.ux.message.MessageBox.show('warning', restoreWarningCaption, restoreWarningMessage,
            function(buttonAction) {
                if (buttonAction == 'yes') {
                    var me = this;

                    me.performRestore(neId);
                }
            }, {
                buttons: [{
                    text: LocalizationManager.getLocalizedResource('ConfigurationFilesClient.Common.Yes'),
                    action: "yes"
                }, {
                    text: LocalizationManager.getLocalizedResource('ConfigurationFilesClient.Common.No'),
                    action: "no"
                }],
                scope: callerScope
            }

        );

    },

    restoreSelectedFile: function() {
        var me = this;
        view = me.getView();
        var vm = view.getViewModel();

        var selectedFiles = this.getViewModel().get("selectedFiles");
        if (Ext.isEmpty(selectedFiles))
            return;

        var neId = selectedFiles[0].get('NEId');

        var canRestoreFile = me.canRestoreFileForNe(neId);
        if (!canRestoreFile) {
            ExtCore.ux.message.MessageBox.alert('warning',
                LocalizationManager.getLocalizedResource('ConfigurationFilesClient.BackupRestoreView.BackupFilesView.OperationError'),
                LocalizationManager.getLocalizedResource('ConfigurationFilesClient.BackupRestoreView.BackupFilesView.OperationInProgressErrorMsg')
            );
            return;
        }

        var fileName = selectedFiles[0].get(this.fileFieldName);

        me.confirmRestoreOperation(me, neId, fileName);
    },

    performRestore: function(neId) {
        var me = this;
        view = me.getView();
        var vm = view.getViewModel();

        var selectedFiles = this.getViewModel().get("selectedFiles");
        if (Ext.isEmpty(selectedFiles))
            return;

        if (selectedFiles[0].get('NEId') != neId)
            return;

        var fileType = selectedFiles[0].get(this.fileTypeFieldName),
            fileName = selectedFiles[0].get(this.fileFieldName),
            filePath = selectedFiles[0].get(this.filePathFieldName),
            sourceType = 'Manual',
            sourceName = selectedFiles[0].get(this.sourceNameFieldName),
            configId = selectedFiles[0].get(this.neConfigIdFieldName);

        var executionId = BackupOperationsIndexerService.AddNewOperation(neId, OperationTypeValues.Restore);

        var cmdArguments = [neId, fileType, fileName, filePath, sourceType, sourceName, executionId];

        me.setNeAsInProgress(neId, true);

        me.auditExecuteRestore(configId, fileType, fileName);

        var promise = GeneralUtilsService.executeNCICommand("CFM_Restore_v1", cmdArguments)
            //.then(me.refreshNeList()) // TBD - is this needed? Refresh occurs after in progress ends anyway..
            .catch(function(err) { JCoreLogger.error(err); });
    },

    auditExecuteRestore: function(configId, fileType, fileName) {
        var additionalDetails = Ext.String.format('NE ConfigID : {0}, File Type : {1}, File Name : {2}', configId, fileType, fileName);
        AuditService.auditServiceRequest('CD_Run_Manual_Restore', true, additionalDetails);

    },

    downloadSelectedFile: function() {
        this.showSelectedFile(true);
    },

    deleteFilesClick: function() {
        var me = this,
            viewModel = this.getViewModel(),
            selectedFiles = viewModel.get("selectedFiles");
        var filesMap = new Ext.util.HashMap();
        selectedFiles.forEach(function(fileRec) {
            filesMap.add(fileRec.get(me.idFieldName), fileRec.get(me.fileFieldName));
        });
        this.deleteFiles(filesMap, true);
    },

    clearComparedFiles4Delete: function() {
        var me = this,
            viewModel = this.getViewModel(),
            selectedFiles = viewModel.get("selectedFiles"),
            compareFile1 = viewModel.get("compareFile1"),
            compareFile2 = viewModel.get("compareFile2");
        if (selectedFiles) {
            selectedFiles.forEach(function(fileRec) {
                if (fileRec == compareFile1)
                    viewModel.set("compareFile1", null);
                else if (fileRec == compareFile2)
                    viewModel.set("compareFile2", null);
            });
        }

    },

    deleteFiles: function(filesMap, withPrompt) {
        var me = this;
        if (!withPrompt) {
            me.clearComparedFiles4Delete();
            this.deleteFilesAsync(filesMap.getKeys()).then(
                function() {
                    ExtCore.ux.message.MessageBox.alert('success', 'Success', LocalizationProvider.getLocalizedResource('ConfigurationFilesClient.BackupRestoreView.BackupFilesView.FilesDeletedSuccessfully'));
                    me.auditDeleteFiles(filesMap, true);
                    me.refreshFiles(false);
                },
                function(err) {
                    var errMsg = '';
                    if (!Ext.isEmpty(err)) {
                        errMsg = _.map(err, 'failureReason').join("<BR>");
                    }
                    ExtCore.ux.message.MessageBox.alert('error', 'Error', errMsg);
                    me.auditDeleteFiles(filesMap, false, errMsg);
                    me.refreshFiles(false);
                }
            );
        } else {
            ExtCore.ux.message.MessageBox.show('warning', 'Delete', LocalizationProvider.getLocalizedResource('ConfigurationFilesClient.BackupRestoreView.BackupFilesView.AreYouSureDelete'),
                function(buttonId) {
                    if (buttonId == 'yes') {
                        me.deleteFiles(filesMap, false);
                    }
                }, {
                    buttons: [{
                            text: "Yes",
                            action: "yes",
                            default: true
                        },
                        {
                            text: "No",
                            action: "no",
                            default: false
                        }
                    ]
                }
            );
        }
    },

    auditDeleteFiles: function(filesMap, isSucceded, errMsg) {
        var viewModel = this.getViewModel(),
            selectedNE = viewModel.get("selectedNetworkElements"),
            selectedNeConfigId = '';
        if (!Ext.isEmpty(selectedNE)) {
            selectedNeConfigId = selectedNE[0].get("ConfigId");
        }
        var additionalDetails = Ext.String.format('NE ConfigIDs : {0}, files : {1}', selectedNeConfigId, filesMap.getValues().join(','));
        //        AuditService.auditServiceRequest('Sentinel_Delete_Sys_Folder', true, 'Delete System Folder ' + selection.text);
        if (!isSucceded)
            additionalDetails += Ext.String.format(', error: {0}', errMsg);
        AuditService.auditServiceRequest('CD_Delete_File', isSucceded, additionalDetails);
    },

    getFile: function(fileName, filePath, isDownload) {
        var me = this;
        this.getFileAsync(fileName, filePath).then(
            function(data) {
                var dlg = Ext.create('ConfigurationFilesClient.view.ShowFileWindow', {
                    fileContent: data,
                    filePath: filePath,
                    fileName: fileName
                });
                if (isDownload === true) {
                    ExtCore.util.FileSaver.saveAs(data, me.fixFileExtension(fileName));
                } else
                    dlg.show();
            },
            function(err) {
                //ExtCore.ux.message.MessageBox.alert('error','Error',Ext.String.format("Failed to open file {0} {1} <BR> error: {2}", filePath, fileName, err));
                ExtCore.ux.message.MessageBox.alert('error', 'Error', err);
            }
        );
    },

    fixFileExtension: function(fileName) {
        var res = fileName.toLowerCase();
        if (this.strEndsWith(res, '.gz'))
            res = fileName.slice(0, -3);
        if (this.strEndsWith(res, '.zip'))
            res = fileName.slice(0, -4);
        return res;
    },

    strEndsWith: function(str, suffix) {
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    },


    buildConfigServiceURL: function(methodName) {
        var deferred = Ext.create('Ext.Deferred');
        InteropService.evaluateInterconnectPointMap('ConfigurationFilesClient', 'CFMGenericService').then(function(data) {
            //InteropService.evaluateInterconnectPointMap('ConfigurationFilesClient', 'BCAPIGenricService').then(function(data) {
            var URL = SessionProvider.buildURL(data.WebServiceInterConnectingPointData[0].StaticData.FullURL.RelativeURL + "/" + methodName);
            deferred.resolve(URL);
        });
        return deferred.promise;
    },

    getFileAsync: function(fileName, filePath) {
        var deferred = Ext.create('Ext.Deferred');
        this.buildConfigServiceURL('getFile').then(function(URL) {
            Ext.Ajax.request({
                url: URL,
                method: 'POST',
                jsonData: {
                    fileName: fileName,
                    filePath: filePath,
                    isAbsolutePath: true
                },
                success: function(response) {
                    try {
                        var resp = Ext.decode(response.responseText);
                        if (Ext.isEmpty(resp.failureReason))
                            deferred.resolve(resp.fileContents);
                        else
                            deferred.reject(resp.failureReason);
                    } catch (err) {
                        JCoreLogger.debug("BackupFilesViewProvider - failed to parse getFile response");
                    }
                    deferred.resolve();
                },
                failure: function() {
                    var msg = 'BackupFilesViewProvider - failed to execute getFile method';
                    //UNMARK IF NEEDED JCoreLogger.debug(msg);
                    JCoreLogger.error(msg);
                    deferred.reject();
                }
            });
        });
        return deferred.promise;
    },
    deleteFilesAsync: function(fileIDs) {
        var deferred = Ext.create('Ext.Deferred');
        this.buildConfigServiceURL('deleteFiles').then(function(URL) {
            var filesArr = _.map(fileIDs, function(fileID) {
                return { id: fileID };
            });
            Ext.Ajax.request({
                url: URL,
                method: 'POST',
                jsonData: {
                    filesToDelete: { deleteFile: filesArr }
                },
                success: function(response) {
                    try {
                        var resp = Ext.decode(response.responseText);
                        if (Ext.isEmpty(resp.failures.deleteFile))
                            deferred.resolve();
                        else
                            deferred.reject(resp.failures.deleteFile);
                    } catch (err) {
                        JCoreLogger.debug("BackupFilesViewController - failed to parse deleteFiles response");
                    }
                    deferred.resolve();
                },
                failure: function() {
                    var msg = 'BackupFilesViewController - failed to execute deleteFiles method';
                    //UNMARK IF NEEDED JCoreLogger.debug(msg);
                    JCoreLogger.error(msg);
                    deferred.reject();
                }
            });
        });
        return deferred.promise;
    },

    initDropFileTarget: function(textField) {
        //console.log('compareFileBoxReady');
        var me = this,
            viewModel = me.getViewModel(),
            dropTargetEl = textField.el;

        var dropTarget = Ext.create('Ext.dd.DropTarget', dropTargetEl, {
            ddGroup: 'compareDDGroup',
            //            notifyEnter: function(ddSource, e, data) {
            //                textField.body.highlight();
            //            },
            notifyDrop: function(ddSource, e, data) {
                var selectedRecords = ddSource.dragData.records,
                    record = selectedRecords[0],
                    fileName = record.get(me.fileFieldName),
                    fileID = record.get(me.idFieldName),
                    //selectedNE = viewModel.get('selectedNetworkElements')[0],
                    anotherFile = null;
                if (selectedRecords.length == 2) {
                    viewModel.set("compareFile1", selectedRecords[0]);
                    viewModel.set("compareFile2", selectedRecords[1]);
                    //viewModel.set("compareNE1", selectedNE);
                    //viewModel.set("compareNE2", selectedNE);
                } else {
                    if (textField.name == 'file1') {
                        anotherFile = viewModel.get("compareFile2");
                        if (anotherFile != null && anotherFile.get(me.idFieldName) == fileID && anotherFile.get(me.fileFieldName) == fileName)
                            return false;
                        viewModel.set("compareFile1", record);
                        //viewModel.set("compareNE1", selectedNE);
                    } else {
                        anotherFile = viewModel.get("compareFile1");
                        if (anotherFile != null && anotherFile.get(me.idFieldName) == fileID && anotherFile.get(me.fileFieldName) == fileName)
                            return false;
                        viewModel.set("compareFile2", record);
                        //viewModel.set("compareNE2", selectedNE);
                    }
                }
                return true;
            }
        });
    },

    initClearTextTrigger: function(textField) {
        var me = this;
        textField.getTrigger('clear').getEl().on({
            click: function() {
                me.getViewModel().set((textField.name == 'file1') ? 'compareFile1' : 'compareFile2', null);
            }
        });
    },

    fileRowDblClick: function(grid, record) {
        this.showSelectedFile();
    },

    textChanged: function(textField, newValue) {
        textField.getEl().down('input').set({ 'data-qtip': newValue });
    },

    fileKeyDown: function(textField, e, eOpts) {
        if (e.getKey() == e.DELETE)
            this.getViewModel().set((textField.name == 'file1') ? 'compareFile1' : 'compareFile2', null);
    },

    refreshFilesClick: function() {
        this.refreshFiles();
    },

    refreshFiles: function(withClearFilters) {
        if (withClearFilters == undefined || withClearFilters === true)
            this.clearGridFilters();
        var viewModel = this.getViewModel(),
            store = viewModel.getStore('backup_files_store');
        store.reload();
    },

    updateCompareSelections: function(viewModel, store) {
        var compareFile, fileRecord, me = this;
        compareFile = viewModel.get("compareFile1");
        if (compareFile != null) {
            fileRecord = store.findRecord(me.idFieldName, compareFile.get(me.idFieldName), 0, false, false, true);
            if (fileRecord)
                fileRecord.set("compare1", true)
        }
        compareFile = viewModel.get("compareFile2");
        if (compareFile != null) {
            fileRecord = store.findRecord(me.idFieldName, compareFile.get(me.idFieldName), 0, false, false, true);
            if (fileRecord)
                fileRecord.set("compare2", true)
        }
    },

    setNeAsInProgress: function(neId, isInProgress) {
        var me = this;
        var brvController = me.getBackupRestoreViewController();
        if (!brvController)
            return;

        brvController.setIsInProgress(neId, isInProgress);
    },


});