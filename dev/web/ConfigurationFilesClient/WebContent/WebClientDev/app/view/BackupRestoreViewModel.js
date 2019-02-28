/**
 * Created by ornaz on 09/08/2018.
 */
Ext.define('ConfigurationFilesClient.view.BackupRestoreViewModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.backuprestoreview',

    constructor: function() {
        var me = this;
        me.callParent(arguments);

        me.bind('{selectedNetworkElements}', function(selectedNes) {

            if (Ext.isEmpty(selectedNes)) {
                me.selectedNes = [];
                return;
            }

            // if (me.getView().getController().refreshNeListTaskInProgress)
            //     return;

            // If no change was made in the selection, nothing to change
            var selectedNeIds = _.map(selectedNes, function(ne) { return ne.get("ObjectId"); }).join(',');

            if (me.selectedNes == selectedNeIds)
                return;

            var store = me.getStore('fileTypesPerNesStore');
            store.load(function(records, operation, success) {
                if (!success) {
                    console.warn('failed to load records for fileTypesPerNesStore.');
                }
            });

            me.selectedNes = selectedNeIds;
        })
    },

    data: {
        neSearchText: '',
        selectAll: false,
        selectedNetworkElements: null,
        resultStatus: '',
        areNetworkElementsBackupInProgress: false,
        numOfFileTypesForCurrentNes: 0,
        fileTypesAvailableForCurrentNes: false
    },

    formulas: {

        areNetworkElementsSelected: {
            bind: {
                selectedNetworkElements: '{selectedNetworkElements}'
            },
            get: function(data) {
                if (Ext.isEmpty(data.selectedNetworkElements))
                    return false;
                return true;
            }
        },

        shouldEnableBackupButton: {
            bind: {
                selectedNetworkElements: '{selectedNetworkElements}',
                numOfFileTypesForCurrentNes: '{numOfFileTypesForCurrentNes}',
                areNetworkElementsBackupInProgress: '{areNetworkElementsBackupInProgress}'
            },
            get: function(data) {

                var me = this;
                if (me.getView().getController().refreshNeListTaskInProgress)
                    return false;
                if (Ext.isEmpty(data.selectedNetworkElements))
                    return false;
                if (data.numOfFileTypesForCurrentNes == 0)
                    return false;

                // don't allow backup if the selected NEs contain one that's already in progress
                if (data.areNetworkElementsBackupInProgress) {
                    var activeNes = BackupOperationsIndexerService.GetAllActiveOperationsNeIds();
                    if (!Ext.isEmpty(activeNes)) {
                        var selectedNeIsInProgress = data.selectedNetworkElements.some(function(x) {
                            return activeNes.indexOf(x.get('ObjectId')) > -1;
                        });
                        if (selectedNeIsInProgress)
                            return false;
                    }
                }

                return true;
            }
        },

        backupButtonTooltip: {
            bind: {
                selectedNetworkElements: '{selectedNetworkElements}',
                numOfFileTypesForCurrentNes: '{numOfFileTypesForCurrentNes}',
                fileTypesAvailableForCurrentNes: '{fileTypesAvailableForCurrentNes}',
                areNetworkElementsBackupInProgress: '{areNetworkElementsBackupInProgress}',
                dataIsValidToolTip: '{resources.ConfigurationFilesClient.BackupRestoreView.NetworkElementView.BackupTooltip}',
                noNesSelectedToolTip: '{resources.ConfigurationFilesClient.BackupRestoreView.NetworkElementView.BackupNoNesSelectedToolTip}',
                noFileTypesForSelectedNesToolTip: '{resources.ConfigurationFilesClient.BackupRestoreView.NetworkElementView.BackupNoFileTypesForSelectedNesToolTip}',
                noCommonCommandsForSelectedNesToolTip: '{resources.ConfigurationFilesClient.BackupRestoreView.NetworkElementView.BackupNoCommonCommandsForSelectedNesToolTip}'

            },
            get: function(data) {
                if (Ext.isEmpty(data.selectedNetworkElements))
                    return data.noNesSelectedToolTip;

                if (!data.fileTypesAvailableForCurrentNes)
                    return data.noFileTypesForSelectedNesToolTip;

                if (data.numOfFileTypesForCurrentNes == 0)
                    return data.noCommonCommandsForSelectedNesToolTip;

                return data.dataIsValidToolTip;
            }
        },

        query_params: {
            bind: {
                neSearchText: '{neSearchText}'
            },
            get: function(data) {
                var query = {
                    searchString: data.neSearchText,
                    searchProjection: "Search",
                    getValuesParameters: {
                        mdClass: 'BCAPI:CFM.CFMNetworkElement',
                        limit: PropertyService.getPropertyFromCache(SessionProvider.getAppName(), 'max.search.networkelemets'),
                        orderBy: 'lower(Name)',
                        dateFormat: {
                            "enabled": true,
                            "format": "dd/MM/yyyy HH:mm:ss"
                        }
                    }
                };
                return query;
            }
        },

        file_types_per_nes_query_params: {
            bind: {
                selectedNetworkElements: '{selectedNetworkElements}'
            },
            get: function(data) {
                if (Ext.isEmpty(data.selectedNetworkElements))
                    return {};

                var selectedNetworkElementsList = _.map(data.selectedNetworkElements, function(ne) { return ne.get("ObjectId"); }).join(',');

                var filterExp = {
                    expression: {
                        operator: {
                            operatorType: 'AND',
                            operand1: {
                                conditionOperator: {
                                    operatorType: "IN",
                                    identifier: {
                                        name: 'ObjectId'
                                    },
                                    literal: { value: selectedNetworkElementsList, type: 'string' }
                                }
                            },
                            operand2: null
                        }
                    }
                };
                return {
                    mdClass: 'BCAPI:CFM.CFMNEScriptMapping',
                    filter: filterExp
                };
            }
        }
    },

    stores: {
        network_elements_store: {
            type: 'networkelementsstore',
            storeId: 'network_elements_store',
            query_params: '{query_params}',
            listeners: {
                beforeload: 'beforestoreload',
                load: 'storeload'
            },
            proxy: {
                url: '/getValuesBySubstrings'
            }
        },
        backup_files_status_store: {
            type: 'backupfiles4nestore'
        },
        fileTypesPerNesStore: {
            type: 'fileTypesStore',
            reference: 'fileTypesPerNesStore',
            query_params: '{file_types_per_nes_query_params}',
            autoLoad: false,
            autoSync: false,
            trackRemoved: false,
            listeners: {
                load: 'fileTypesStoreLoad'
            },
            url: ''
        }
    }
});