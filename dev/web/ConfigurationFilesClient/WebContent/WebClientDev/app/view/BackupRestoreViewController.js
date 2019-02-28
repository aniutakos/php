/**
 * Created by ornaz on 09/08/2018.
 */

const OPERATION_STATUS_SUCCEEDED_TOKEN = "succeeded";
const OPERATION_STATUS_FAILED_TOKEN = "failed";

const OperationStatusValues = Object.freeze({
    NONE: 0,
    SUCCESS: 1,
    FAIL: 2
});

Ext.define('ConfigurationFilesClient.view.BackupRestoreViewController', {
    extend: 'ConfigurationFilesClient.view.BackupBaseViewController',
    alias: 'controller.backuprestoreview',

    initNetworkElementsView: function(grid) {
        var me = this;

        me.RunScriptTimeoutSeconds = PropertyService.getPropertyFromCache(SessionProvider.getAppName(), 'RunScriptTimeoutSeconds');
        me.StatusIndicationsRefreshIntervalSeconds = PropertyService.getPropertyFromCache(SessionProvider.getAppName(), 'StatusIndicationsRefreshIntervalSeconds');
        me.CheckScriptExecutionStatusIntervalSeconds = PropertyService.getPropertyFromCache(SessionProvider.getAppName(), 'CheckScriptExecutionStatusIntervalSeconds');
        me.CheckScriptLongExecutionStatusIntervalSeconds = PropertyService.getPropertyFromCache(SessionProvider.getAppName(), 'CheckScriptLongExecutionStatusIntervalSeconds');

        me.backupOperationsCycleCounter = 0;
        me.maxBackupOperationsCycle = Math.floor(me.CheckScriptLongExecutionStatusIntervalSeconds / me.CheckScriptExecutionStatusIntervalSeconds);

        me.refreshNeListTaskInProgress = false;

        grid.getView().markDirty = false;
        grid.getView().preserveScrollOnReload = true;
        grid.getView().preserveScrollOnRefresh = true;

        BackupOperationsIndexerService.on({
            contentsChanged: {
                scope: this,
                fn: function(controller, numOfActiveOperations) {
                    var me = this;

                    me.getViewModel().set('areNetworkElementsBackupInProgress', numOfActiveOperations > 0);
                }
            }
        });

        var displayProjection = MetadataClassService.getProjection(ConfigurationFilesClient.app.bcMetadataClassName, 'Display');

        var count = Math.min(2, displayProjection.AttributeRef.length);
        var columns = _.map(_.slice(displayProjection.AttributeRef, 0, count), function(column) {
            return { dataIndex: column, tooltipFormatFn: me.getToolTip };
        });

        getOperationStatusValue = function(dbValue) {
            if (dbValue == null || dbValue == undefined)
                return OperationStatusValues.NONE;

            if (dbValue == OPERATION_STATUS_SUCCEEDED_TOKEN)
                return OperationStatusValues.SUCCESS;

            if (dbValue == OPERATION_STATUS_FAILED_TOKEN)
                return OperationStatusValues.FAIL;

            return OperationStatusValues.NONE;
        };

        getSourceTypeBackgroundImage = function(sourceType) {
            var backgroundImageHtml = '';

            var sourceTypeData = me.getSourceTypeText(sourceType);
            return sourceTypeData.backgroundImageHtml;
        };

        getLeftStatusBackgroundImage = function(operationStatus) {
            if (operationStatus == OperationStatusValues.SUCCESS)
                return Ext.String.format("url({0}) no-repeat left center", Ext.getResourcePath('icons/green-circle-left.svg'));
            else if (operationStatus == OperationStatusValues.FAIL)
                return Ext.String.format("url({0}) no-repeat left center", Ext.getResourcePath('icons/red-circle-left.svg'));
            else if (operationStatus == OperationStatusValues.NONE)
                return Ext.String.format("url({0}) no-repeat left center", Ext.getResourcePath('icons/gray-circle-left.svg'));
            return "";
        };

        getRightStatusBackgroundImage = function(operationStatus) {
            if (operationStatus == OperationStatusValues.SUCCESS)
                return Ext.String.format("url({0}) no-repeat left center", Ext.getResourcePath('icons/green-circle-right.svg'));
            else if (operationStatus == OperationStatusValues.FAIL)
                return Ext.String.format("url({0}) no-repeat left center", Ext.getResourcePath('icons/red-circle-right.svg'));
            else if (operationStatus == OperationStatusValues.NONE)
                return Ext.String.format("url({0}) no-repeat left center", Ext.getResourcePath('icons/gray-circle-right.svg'));
            return "";
        };

        var getStyle = function(isInProgress, isBackupSuccessful, isRestoreSuccessful) {
            var style = "background-repeat: no-repeat; background-position: center; background-color: transparent;";
            if (isInProgress) {
                style += Ext.String.format("background: url({0}) no-repeat center center!important; width: 40;", Ext.getResourcePath('icons/progressCircle.svg'));
                style += "animation: rotate 0.8s infinite linear;";
                return style;
            }

            var backgroundImageUrls = [];

            backgroundImageUrls.push(getLeftStatusBackgroundImage(isBackupSuccessful));
            backgroundImageUrls.push(getRightStatusBackgroundImage(isRestoreSuccessful));

            if (backgroundImageUrls.length > 0) {
                style += "background: ";
                for (var i = 0; i < backgroundImageUrls.length; i++) {
                    if (i > 0)
                        style += ", ";

                    style += backgroundImageUrls[i];
                }
                style += "!important;";
            }

            return style;
        };

        var backupStatusColumn = Ext.create('Ext.grid.column.Column', {
            width: 24,
            maxWidth: 28,
            minWidth: 24,
            margin: '0 3 0 0',
            dataIndex: 'isInProgress',
            align: 'central',
            cls: '',
            padding: 0,
            renderer: function(value, metaData, record, rowIndex, colIndex, store, view) {

                //var isInProgress = record.get("isInProgress") == true;
                var neId = record.get('ObjectId');
                var isInProgress = BackupOperationsIndexerService.IsOperationActive(neId);

                metaData.tdStyle = getStyle(isInProgress, getOperationStatusValue(record.data.LastBackupStatus), getOperationStatusValue(record.data.LastRestoreStatus));
                metaData.tdCls = "myStatusIcon";

                // if (Math.random() * 2 < 1)
                //     metaData.tdStyle = getStyle(isInProgress, OperationStatusValues.FAIL, OperationStatusValues.SUCCESS);
                // else
                //     metaData.tdStyle = getStyle(isInProgress, OperationStatusValues.SUCCESS, OperationStatusValues.FAIL);

                return ''; //<button type="button" style="width:50%">!!</button>';
            },
            tooltipFormatFn: me.getOperationStatusToolTip
        });

        // var widgetColumn = {
        //     xtype: 'widgetcolumn',
        //     menuDisabled: true,
        //     align: 'center',
        //     width: 40,
        //     widget: {
        //         xtype: 'BackOperationsStatusUi',
        //         bind: {
        //             //html: '{myText}'
        //         },
        //     },
        //     viewModel: {
        //         parent: this.getViewModel(),
        //     }
        // };

        columns.push(backupStatusColumn); //, widgetColumn); 

        grid.reconfigure(null, columns);

        me.getNetworkElements();
    },

    getToolTip: function(column, val, cellIndex, recordIndex) {
        var me = this,
            view = me.getView().up('backup-restore-view'),
            tooltip = '<div style="font-weight: normal;background-color: white;width: 350px;padding: 15px;margin:-10px">',
            tooltipProjection = MetadataClassService.getProjectionWithAttributesDefinitions(ConfigurationFilesClient.app.bcMetadataClassName, 'Tooltip'),
            store = view.getViewModel().getStore('network_elements_store'),
            record = store.getAt(recordIndex);

        for (var i = 0; i < tooltipProjection.AttributeRef.length; i++) {
            var attr = tooltipProjection.AttributeRef[i],
                value = record.get(attr.name) || '';

            tooltip += ((i % 2 == 0) ? '<div class="attribute-row">' : '<div class="attribute-row-alt">');
            tooltip += '<div class="attribute-name">' + attr.label + '</div><div class="attribute-value">' + value + '</div> </div>';
        }

        tooltip += '</div>';
        return tooltip;
    },

    getOperationStatusText: function(status) {
        if (!status)
            return '';
        if (status == OPERATION_STATUS_FAILED_TOKEN)
            return LocalizationManager.getLocalizedResource('ConfigurationFilesClient.BackupRestoreView.BackupFilesView.OperationFailedMsg');
        if (status == OPERATION_STATUS_SUCCEEDED_TOKEN)
            return LocalizationManager.getLocalizedResource('ConfigurationFilesClient.BackupRestoreView.BackupFilesView.OperationSucceededMsg');
        return ';'
    },

    getOperationStatusToolTip: function(column, val, cellIndex, recordIndex) {
        var me = this,
            view = me.getView().up('backup-restore-view'),
            store = view.getViewModel().getStore('network_elements_store'),
            controller = view.getController(),
            record = store.getAt(recordIndex);

        var neId = record.get('ObjectId');
        var isInProgress = BackupOperationsIndexerService.IsOperationActive(neId);

        var tooltipTemplate = '<div style="font-weight: normal;background-color: white;padding: 5px;max-width: {0}px;margin:-10px;color:black">';

        if (isInProgress) {
            var tooltip = Ext.String.format(tooltipTemplate, 200);
            tooltip += LocalizationManager.getLocalizedResource('ConfigurationFilesClient.BackupRestoreView.BackupFilesView.InProgress');
            tooltip += '</div>';
            return tooltip;
        }

        var showBackupStatus = !Ext.isEmpty(record.data.LastBackupStatus);
        var showRestoreStatus = !Ext.isEmpty(record.data.LastRestoreStatus);
        if (!showBackupStatus && !showRestoreStatus)
            return null;

        var showSingleColumn = (showBackupStatus && !showRestoreStatus) || (!showBackupStatus && showRestoreStatus);

        var tooltip = Ext.String.format(tooltipTemplate, (showSingleColumn ? '320' : '440'));

        tooltip += "<table style='border: 0px solid black;width:100%;table-layout: fixed;'><tr>";
        if (showBackupStatus)
            tooltip += "<th class='status-tooltip-header'>" + LocalizationManager.getLocalizedResource('ConfigurationFilesClient.BackupRestoreView.BackupFilesView.Backup') + "</th>";
        if (!showSingleColumn)
            tooltip += "<th class='status-tooltip-space-column'/>";
        if (showRestoreStatus)
            tooltip += "<th class='status-tooltip-header'>" + LocalizationManager.getLocalizedResource('ConfigurationFilesClient.BackupRestoreView.BackupFilesView.Restore') + "</th>";
        tooltip += "</tr>";

        var backupFieldStatusImage = getLeftStatusBackgroundImage(getOperationStatusValue(record.data.LastBackupStatus));
        var restoreFieldStatusImage = getLeftStatusBackgroundImage(getOperationStatusValue(record.data.LastRestoreStatus));

        // update status
        tooltip += '<tr class="' + ((i % 2 != 0) ? "attribute-row" : "attribute-row-alt") + '" style="border: 0px solid black;">';

        statusValueTemplate = '<td><span class="status-tooltip-label status-tooltip-image-label" style="background: {0};background-size: cover;"></span><span class="status-tooltip-value">{1}</span></td>';

        if (showBackupStatus)
            tooltip += Ext.String.format(statusValueTemplate, backupFieldStatusImage, controller.getOperationStatusText(record.data.LastBackupStatus));
        if (!showSingleColumn)
            tooltip += "<td class='status-tooltip-space-column'/>";
        if (showRestoreStatus)
            tooltip += Ext.String.format(statusValueTemplate, restoreFieldStatusImage, controller.getOperationStatusText(record.data.LastRestoreStatus));
        tooltip += '</tr>';

        //update the rest of the fields
        var labels = ['', LocalizationManager.getLocalizedResource('ConfigurationFilesClient.BackupRestoreView.BackupFilesView.StatusTooltipDateTimeLabel'),
            LocalizationManager.getLocalizedResource('ConfigurationFilesClient.BackupRestoreView.BackupFilesView.StatusTooltipFileTypeLabel'),
            LocalizationManager.getLocalizedResource('ConfigurationFilesClient.BackupRestoreView.BackupFilesView.StatusTooltipMessageLabel')
        ];
        var labelImages = [function(val) { return Ext.String.format('background: {0};width: 16px; height: 16px;display: inline-block;background-size: cover;', getSourceTypeBackgroundImage(val)); },
            null, null, null
        ];
        var backupFieldNames = ['LastBackupSourceType', 'LastBackupOperationTime', 'LastBackupConfFileTypeDisplayName', 'LastBackupDescr'];
        var restoreFieldNames = ['LastRestoreSourceType', 'LastRestoreOperationTime', 'LastRestoreConfFileTypeDisplayName', 'LastRestoreDescr'];
        var backupValues = ['', '', '', ''];
        var restoreValues = ['', '', '', ''];
        var transformValueFuncs = [function(val) {
                var sourceTypeObj = controller.getSourceTypeText(val);
                return (sourceTypeObj.translateKey) ? LocalizationProvider.getLocalizedResource(sourceTypeObj.translateKey) : '';
            },
            null, null, null
        ];
        var displayLabelForEmptyValues = [true, true, true, false];
        var labelImage, i;

        for (i = 0; i < labels.length; i++) {
            var label = Ext.isEmpty(labels[i]) ? '' : (labels[i] + ': '),
                backupValue = !Ext.isEmpty(record.data[backupFieldNames[i]]) ? record.data[backupFieldNames[i]] : backupValues[i],
                restoreValue = !Ext.isEmpty(record.data[restoreFieldNames[i]]) ? record.data[restoreFieldNames[i]] : restoreValues[i];


            var backupLabel = label,
                restoreLabel = label;

            if (transformValueFuncs[i] != null) {
                backupValue = transformValueFuncs[i](backupValue);
                restoreValue = transformValueFuncs[i](restoreValue);
            }

            if (!displayLabelForEmptyValues[i] && Ext.isEmpty(backupValue))
                backupLabel = '';
            if (!displayLabelForEmptyValues[i] && Ext.isEmpty(restoreValue))
                restoreLabel = '';

            tooltip += '<tr class="' + ((i % 2 != 0) ? "attribute-row" : "attribute-row-alt") + '" style="border: 0px solid black;">';

            var cellTemplate = '<td style="border: 0px solid black;text:left;vertical-align: text-top;padding:3px 3px 3px 0px"><span class="status-tooltip-label" style="{0}">{1}</span><span class="status-tooltip-value">{2}</span></td>';

            if (showBackupStatus) {
                labelImage = '';
                if (labelImages[i] != null)
                    labelImage = labelImages[i](backupValue);

                tooltip += Ext.String.format(cellTemplate, labelImage, backupLabel, backupValue);
            }
            if (!showSingleColumn)
                tooltip += "<td class='status-tooltip-space-column'/>";
            if (showRestoreStatus) {
                labelImage = '';
                if (labelImages[i] != null)
                    labelImage = labelImages[i](restoreValue);

                tooltip += Ext.String.format(cellTemplate, labelImage, restoreLabel, restoreValue);
            }
        }

        tooltip += "</table>";
        tooltip += '</div>';

        return tooltip;
    },

    getToolTipDataView: function(column, val, cellIndex, recordIndex) {
        var me = this,
            data = [],
            view = me.getView().up('backup-restore-view'),
            tooltipProjection = MetadataClassService.getProjectionWithAttributesDefinitions(ConfigurationFilesClient.app.bcMetadataClassName, 'Tooltip'),
            nestore = view.getViewModel().getStore('network_elements_store'),
            record = nestore.getAt(recordIndex);

        _.each(tooltipProjection.AttributeRef, function(attr) {
            data.push({ name: attr.label, value: record.get(attr.name) })
        });

        var store = Ext.create('Ext.data.Store', {
            data: data,
            proxy: {
                type: 'memory'
            }
        });
        var dataview = {
            xtype: 'dataview',
            cls: 'tooltip-attributes',
            tpl: new Ext.XTemplate(
                '<tpl for=".">',
                '<div class="attribute-wrap {[xindex % 2 === 0 ? "even" : "odd"]}">',
                '<div class="attribute-name" data-qtip="{name}">{name}</div>',
                '<div class="attribute-value" data-qtip="{value}">{value}</div>',
                '</div>',
                '</tpl>'
            ),
            itemSelector: 'div.thumb-wrap',
            bind: {
                store: store
            }

        };

        return dataview;
    },

    pollRefreshNeListTask: function() {
        var me = this,
            view = me.getView(),
            grid = Ext.ComponentMgr.get('ne-grid'),
            vm = view.getViewModel(),
            store = vm.getStore('network_elements_store');

        if (me.refreshNeListTaskInProgress)
            return;

        me.refreshNeListTaskInProgress = true;

        // Keep a list of selected rows to restore as selected after the Grid data refreshes
        grid.selectedGridRows = Ext.clone(grid.getSelectionModel().getSelected().items);
        //grid.selectedGridRows = grid.getSelectionModel().getSelected().items;
        // grid.selectedGridRows = [];
        // for (indx in grid.getSelectionModel().getSelected().items) {
        //     grid.selectedGridRows.push(grid.getSelectionModel().getSelected().items[indx]);
        // }

        store.reload({
            scope: this,
            callback: function(records, operation, success) {
                var me = this;

                if (!success) {
                    me.refreshNeListTaskInProgress = false;
                    return;
                }

                //var view = me.getView(),
                var grid = Ext.ComponentMgr.get('ne-grid');

                var newRecordsToSelect = [];

                if (grid.selectedGridRows.length > 0) {
                    for (var i = 0; i < grid.selectedGridRows.length; i++) {

                        // get the records using the ObjectId as the Key
                        //record = records.find(function(item, key) { return item.data.ObjectId == grid.selectedGridRows[i].getData().ObjectId })
                        record = records.filter(function(item) { return item.data.ObjectId == grid.selectedGridRows[i].getData().ObjectId; });
                        if (!Ext.isEmpty(record)) {
                            if (Ext.isArray(record) && record.length > 0)
                                newRecordsToSelect.push(record[0]);
                            else
                                newRecordsToSelect.push(record);
                        }
                    }

                    // re-select all pre-selected rows that are still present in the Grid
                    if (newRecordsToSelect.length > 0) {
                        grid.getSelectionModel().select(newRecordsToSelect);
                        grid.getView().focusRow(newRecordsToSelect[0], 1000);
                    }
                }

                //grid.getView().refresh();
                me.refreshNeListTaskInProgress = false;
            }
        });


    },

    didBackupOperationTimeOut: function(startTime, currentTime) {
        var me = this;

        var timeDiffSeconds = Ext.Date.diff(startTime, currentTime, "s");
        return timeDiffSeconds > me.RunScriptTimeoutSeconds;
    },

    increaseBackupOperationsCycleCounter: function() {
        var me = this;

        me.backupOperationsCycleCounter++;
        if (me.backupOperationsCycleCounter > me.maxBackupOperationsCycle)
            me.backupOperationsCycleCounter = 0;
    },

    selectedNeShouldBeRefreshed: function(completedNes) {
        var me = this;

        var selectedNetworkElements = me.getViewModel().get('selectedNetworkElements');
        if (Ext.isEmpty(selectedNetworkElements))
            return false;

        var numOfSelectedNetworkElements = selectedNetworkElements.length;
        if (numOfSelectedNetworkElements != 1)
            return false;

        if (completedNes.length <= 0)
            return false;

        return (completedNes.indexOf(selectedNetworkElements[0].get('ObjectId')) > -1);
    },

    refreshFilesList: function() {
        var me = this;
        view = me.getView();
        var bfv = view.down('backup-files-view');
        var bfvController = bfv.getController();
        var bfvViewModel = bfvController.getViewModel();
        var bfvStore = bfvViewModel.getStore('backup_files_store');
        bfvStore.reload();
    },

    pollBackupOperationsProgress: function() {
        var me = this;
        view = me.getView();
        var vm = view.getViewModel();
        store = vm.getStore('backup_files_status_store');
        var grid = Ext.ComponentMgr.get('ne-grid');

        var requestedCycleLevel = 1;
        if (me.backupOperationsCycleCounter >= me.maxBackupOperationsCycle)
            requestedCycleLevel = -1;

        var activeOperationsNeIds = BackupOperationsIndexerService.GetAllActiveOperationsNeIds(requestedCycleLevel);

        me.increaseBackupOperationsCycleCounter();

        if (activeOperationsNeIds.length == 0)
            return;

        var activeNetworkElementsList = "";
        var activeExecutionIdsList = "";
        for (var i = 0; i < activeOperationsNeIds.length; i++) {
            var neId = activeOperationsNeIds[i];
            activeNetworkElementsList += neId;
            var executionId = BackupOperationsIndexerService.GetExecutionId(neId);
            activeExecutionIdsList += executionId;
            if (i != activeOperationsNeIds.length - 1) {
                activeNetworkElementsList += ",";
                activeExecutionIdsList += ",";
            }
        }

        store.query_params = me.getBackupQueryParams(activeNetworkElementsList, activeExecutionIdsList);

        store.load({
            scope: this,
            callback: function(records, operation, success) {

                var shouldRefreshFiles = false;

                if (success) {

                    if (records.length > 0) {

                        var completedNes = [];

                        for (idx in records) {
                            var operationStatus = records[idx].data.Status;
                            var recordNeId = records[idx].data.NEId;
                            var opertationType = records[idx].data.actionType;

                            if (operationStatus == OPERATION_STATUS_SUCCEEDED_TOKEN) {
                                console.log(Ext.String.format("{0} Operation {1} for NeId {2} ({3}) returned with Status : success", opertationType, records[idx].data.Id, records[idx].data.NEId, records[idx].data.NEConfigId));
                                BackupOperationsIndexerService.RemoveOperation(recordNeId);
                                me.setIsInProgress(recordNeId, false);
                                completedNes.push(recordNeId);
                                shouldRefreshFiles = true;
                                continue;
                            }

                            if (operationStatus == OPERATION_STATUS_FAILED_TOKEN) {
                                BackupOperationsIndexerService.RemoveOperation(recordNeId);
                                me.setIsInProgress(recordNeId, false);
                                completedNes.push(recordNeId);
                                shouldRefreshFiles = true;
                                continue;
                            }

                        }

                        if (shouldRefreshFiles) {
                            me.pollRefreshNeListTask();
                            if (me.selectedNeShouldBeRefreshed(completedNes))
                                me.refreshFilesList();
                        }
                    }

                }

                var remainingActiveNeIds = BackupOperationsIndexerService.GetAllActiveOperationsNeIds(1 /*cycleLevel*/ );
                for (idx in remainingActiveNeIds) {
                    var activeNeId = remainingActiveNeIds[idx];
                    var recordStartTime = BackupOperationsIndexerService.GetStartTime(activeNeId);

                    var currentTimeDate = new Date(Date.now());
                    if (me.didBackupOperationTimeOut(recordStartTime, currentTimeDate)) {
                        BackupOperationsIndexerService.SetCycleLevel(activeNeId, 2);
                        continue;
                    }
                }

                return false;
            }
        });
    },


    startBackupProgressPollingTask: function() {
        var me = this;
        me.backupProgressPollingTask = Ext.TaskManager.start({
            run: me.pollBackupOperationsProgress,
            interval: (me.CheckScriptExecutionStatusIntervalSeconds * 1000),
            scope: me
        });
    },

    startNeListRefreshTask: function() {
        var me = this;

        me.working = false;

        me.neListRefreshTask = Ext.TaskManager.start({
            run: me.pollRefreshNeListTask,
            interval: (me.StatusIndicationsRefreshIntervalSeconds * 1000),
            scope: me
        });
    },

    endBackupOperationProgressPollingTask: function() {
        var me = this;
        if (me.backupProgressPollingTask != undefined) {
            Ext.TaskManager.stop(me.backupProgressPollingTask);
            me.backupProgressPollingTask = undefined;
        }
    },

    endNeListRefreshTask: function() {
        var me = this;
        if (me.neListRefreshTask != undefined) {
            Ext.TaskManager.stop(me.neListRefreshTask);
            me.neListRefreshTask = undefined;
        }
    },

    onActivated: function() {
        var me = this;
        me.startBackupProgressPollingTask();
        me.startNeListRefreshTask();
    },
    onDeactivated: function() {
        var me = this;
        me.endBackupOperationProgressPollingTask();
        me.endNeListRefreshTask();
    },

    getNetworkElements: function() {
        var me = this,
            view = me.getView(),
            grid = Ext.ComponentMgr.get('ne-grid'),
            vm = view.getViewModel(),
            store = vm.getStore('network_elements_store');

        vm.set('resultStatus', '');
        vm.set('selectAll', false);
        grid.unmask();

        store.loadData([]);
        store.load({
            scope: view,
            callback: function(records, operation, success) {
                var res = Ext.decode(operation.getResponse().responseText),
                    grid = view.down('#ne-grid');
                if (success && res.result) {
                    var isPartial = res.result.partial,
                        status = records.length + ' NEs found' + (isPartial ? ' (Partial)' : '');
                    view.getViewModel().set('resultStatus', status);
                } else {
                    grid.mask('<p>Error retrieving data from server</p>');
                    if (res.failureReason)
                    //console.warn("Failed to get NE data : " + res.failureReason)
                        JCoreLogger.warn("Failed to get NE data : " + res.failureReason)
                }
                if (records.length == 1)
                    grid.getSelectionModel().selectAll();

                store.getModel().idProperty = 'ObjectId';

            }
        });
    },

    beforestoreload: function() {
        var me = this,
            view = me.getView().down('#innerPanel');

        if (!me.refreshNeListTaskInProgress)
            view.mask();
    },
    storeload: function() {
        var me = this,
            view = me.getView().down('#innerPanel');

        if (view.isMasked)
            view.unmask();
        var grid = view.down("#ne-grid");
        // fix bug SA-24515 Search NE - Empty Search result
        grid.getView().focusRow(0, 1000);
    },

    fileTypesStoreLoad: function(store, records, successful, operation, eOpts) {
        var me = this;
        var view = me.getView();
        var menu = view.lookupReference('neFileTypesMenu');
        menu.removeAll();

        var filteredRecords = [];
        var selectedNetworkElements = me.getViewModel().get('selectedNetworkElements');
        if (!Ext.isEmpty(selectedNetworkElements)) {

            var numOfSelectedNetworkElements = selectedNetworkElements.length;

            // filter array to only values that appear for ALL selected NEs
            filteredRecords = me.getDistinctValues(records, numOfSelectedNetworkElements, 'text');

            if (!Ext.isEmpty(filteredRecords)) {
                filteredRecords.forEach(function(record) {
                    menu.add({ text: record.data.text, value: record.data.value });
                });
            }
        }


        me.getViewModel().set('numOfFileTypesForCurrentNes', Ext.isEmpty(filteredRecords) ? 0 : filteredRecords.length);
        me.getViewModel().set('fileTypesAvailableForCurrentNes', records ? (records.length > 0) : 0);
    },

    // returns array of records with only values that appear numberOfAppearances times in the original array
    getDistinctValues: function(records, numberOfAppearances, valuePropertyName) {
        var distinctValues = _.filter(_.groupBy(records, function(item) { return item.get(valuePropertyName); }), function(o) { return o.length == numberOfAppearances });

        return _.map(distinctValues, function(val) { return val[0]; })
    },

    selectBackupMenuItem: function(backupType) {
        var me = this;
        vm = me.getViewModel();
        var selectedNE = vm.get('selectedNetworkElements');
        var neIds = [];
        var neConfigIds = [];
        var nesAlreadyInProgress = [];
        if (!Ext.isEmpty(selectedNE) && selectedNE.length > 0) {
            selectedNE.forEach(function(neObject) {
                if (BackupOperationsIndexerService.IsOperationActive(neObject.getData().ObjectId))
                    nesAlreadyInProgress.push(neObject);
                neIds.push(neObject.getData().ObjectId);
                neConfigIds.push(neObject.getData().ConfigId);
            });
        }

        if (nesAlreadyInProgress.length > 0) {
            ExtCore.ux.message.MessageBox.alert('warning',
                LocalizationManager.getLocalizedResource('ConfigurationFilesClient.BackupRestoreView.BackupFilesView.OperationError'),
                LocalizationManager.getLocalizedResource('ConfigurationFilesClient.BackupRestoreView.BackupFilesView.OperationInProgressErrorMsg')
            );
            return;
        }

        userName = SessionProvider.getLoggedInUser().id; //'nsa';

        this.executeBackup(selectedNE, neIds, neConfigIds, backupType.value, userName);
    },


    getBackupQueryParams: function(selectedNetworkElements, activeExecutionIdsList) {
        if (Ext.isEmpty(selectedNetworkElements))
            return {};

        var filterExp = {
            expression: {
                operator: {
                    operatorType: 'AND',
                    operand1: {
                        logicaOperator: {
                            operatorType: 'AND',
                            operand1: {
                                conditionOperator: {
                                    operatorType: "IN",
                                    identifier: {
                                        name: 'NEId'
                                    },
                                    literal: { value: selectedNetworkElements, type: 'string' }
                                }
                            },
                            operand2: {
                                conditionOperator: {
                                    operatorType: "IN",
                                    identifier: {
                                        name: 'ExecutionId'
                                    },
                                    literal: { value: activeExecutionIdsList, type: 'string' }
                                }

                            }
                        }
                    },
                    operand2: {
                        conditionOperator: {
                            operatorType: "IN",
                            identifier: {
                                name: 'ActionType'
                            },
                            literal: { value: 'Backup,Restore', type: 'string' }
                        }
                    }
                }
            }
        };

        return {
            mdClass: 'BCAPI:CFM.CFMMain',
            projection: 'General',
            filter: filterExp,
            orderBy: 'OperationTime DESC',
            dateFormat: {
                "enabled": true,
                "format": "MM/dd/yyyy HH:mm:ss"
            }
        };

    },

    setIsInProgress: function(neId, inProgress) {
        var me = this;
        view = me.getView();
        var vm = view.getViewModel();

        var grid = this.getView().down('#ne-grid')
        var record = grid.getStore().findRecord('ObjectId', neId, 0, false, false, true);

        if (record)
            record.set("isInProgress", inProgress);
    },

    executeBackup: function(selectedNE, neIds, neConfigIds, backupType, userName) {

        var me = this;
        view = me.getView();
        var vm = view.getViewModel();

        var nesAsString = GeneralUtilsService.GetArrayAsString(neIds, false /*withQuotationMarks*/ );

        var neConfigIdsAsString = GeneralUtilsService.GetArrayAsString(neConfigIds, false /*withQuotationMarks*/ );

        var executionId = BackupOperationsIndexerService.AddNewOperation(neIds, OperationTypeValues.Backup);

        for (idx in neIds)
            me.setIsInProgress(neIds[idx], true);

        me.auditExecuteBackup(neConfigIdsAsString, backupType);

        var cmdArguments = [nesAsString, backupType, "manual", userName, executionId];
        var promise = GeneralUtilsService.executeNCICommand("CFM_Backup_v1", cmdArguments)
            .catch(function(err) { JCoreLogger.error(err); });

    },

    auditExecuteBackup: function(neConfigIdsAsString, backupType) {
        var additionalDetails = Ext.String.format('NE ConfigIDs : {0}, File Type : {1}', neConfigIdsAsString, backupType);
        AuditService.auditServiceRequest('CD_Run_Manual_Backup', true, additionalDetails);

    }



});