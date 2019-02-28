/**
 * Created by igors on 09/08/2018.
 */
Ext.define('ConfigurationFilesClient.view.BackupFilesViewModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.backupfilesview',

    data: {
        compareFile1: null,
        compareFile2: null,
        compareNE1: null,
        compareNE2: null,
        compareFile1Contents: null,
        compareFile2Contents: null,
        isSingleElementSelected: false,
        isFilesFound: true,
        selectedFiles: null,
        deleteAuthorized: true,
        restoreAuthorized: true,
        filesCount: 0,
        areNetworkElementsBackupInProgress: false,
    },

    formulas: {
        gridFlex: {
            bind: {
                isSingleElementSelected: '{isSingleElementSelected}',
                isFilesFound: '{isFilesFound}'
            },
            get: function(data) {
                if (data.isSingleElementSelected && data.isFilesFound)
                    return 1;
                else
                    return undefined;
            }
        },
        messageFlex: {
            bind: {
                isSingleElementSelected: '{isSingleElementSelected}',
                isFilesFound: '{isFilesFound}'
            },
            get: function(data) {
                if (!data.isSingleElementSelected || !data.isFilesFound)
                    return 1;
                else
                    return undefined;
            }
        },
        messageText: {
            bind: {
                elements: '{selectedNetworkElements}',
                isFilesFound: '{isFilesFound}',
                noElementsMsg: '{resources.ConfigurationFilesClient.BackupRestoreView.BackupFilesView.NoElementSelected}',
                multipleElementsMsg: '{resources.ConfigurationFilesClient.BackupRestoreView.BackupFilesView.MultipleElementSelected}',
                noFilesMsg: '{resources.ConfigurationFilesClient.BackupRestoreView.BackupFilesView.NoFilesFound}'
            },
            get: function(data) {
                if (Ext.isEmpty(data.elements))
                    return data.noElementsMsg;
                if (data.elements.length == 0)
                    return data.noElementsMsg;
                else if (data.elements.length > 1)
                    return data.multipleElementsMsg;
                if (!data.isFilesFound)
                    return data.noFilesMsg;
            }
        },
        isDisplayMessage: {
            bind: {
                isSingleElementSelected: '{isSingleElementSelected}',
                isFilesFound: '{isFilesFound}'
            },
            get: function(data) {
                return (!data.isSingleElementSelected || !data.isFilesFound);
            }
        },
        isCompareAllowed: {
            bind: {
                file1: '{compareFile1Contents}',
                file2: '{compareFile2Contents}'
            },
            get: function(data) {
                return (data.file1 != null && data.file2 != null);
            }
        },
        isOneFileSelected: {
            bind: {
                files: '{selectedFiles}'
            },
            get: function(data) {
                return (!Ext.isEmpty(data.files) && data.files.length == 1);
            }
        },
        isOneOrMultipleFileSelected: {
            bind: {
                files: '{selectedFiles}'
            },
            get: function(data) {
                return (!Ext.isEmpty(data.files) && data.files.length >= 1);
            }
        },
        compareFile1Desc: {
            bind: {
                file: '{compareFile1}',
                ne: '{compareNE1}'
            },
            get: function(data) {
                if (Ext.isEmpty(data.file) || Ext.isEmpty(data.ne))
                    return '';
                else
                    return Ext.String.format('{0} ({1})', data.file.get('FileName'), data.ne.get('Name'));
            }
        },
        compareFile2Desc: {
            bind: {
                file: '{compareFile2}',
                ne: '{compareNE2}'
            },
            get: function(data) {
                if (Ext.isEmpty(data.file) || Ext.isEmpty(data.ne))
                    return '';
                else
                    return Ext.String.format('{0} ({1})', data.file.get('FileName'), data.ne.get('Name'));
            }
        },

        deleteDisabled: {
            bind: {
                isOneOrMultipleFileSelected: '{isOneOrMultipleFileSelected}',
                deleteAuthorized: '{deleteAuthorized}'
            },
            get: function(data) {
                return !data.isOneOrMultipleFileSelected || !data.deleteAuthorized;
            }
        },
        restoreDisabled: {
            bind: {
                isOneFileSelected: '{isOneFileSelected}',
                restoreAuthorized: '{restoreAuthorized}',
                selectedNetworkElements: '{selectedNetworkElements}',
                areNetworkElementsBackupInProgress: '{areNetworkElementsBackupInProgress}'
            },
            get: function(data) {
                if (data.areNetworkElementsBackupInProgress)
                    return true;

                return !data.isOneFileSelected || !data.restoreAuthorized;
            }
        },

        filesCountText: {
            bind: {
                filesCount: '{filesCount}',
                msg: '{resources.ConfigurationFilesClient.BackupRestoreView.BackupFilesView.BackupFilesFoundCount}'
            },
            get: function(data) {
                if (data.filesCount == 0)
                    return "";
                return data.filesCount + " " + data.msg;
            }
        },

        query_params: {
            bind: {
                selectedNetworkElements: '{selectedNetworkElements}'
            },
            get: function(data) {
                if (Ext.isEmpty(data.selectedNetworkElements))
                    return {};
                var ne = data.selectedNetworkElements[0],
                    neID = ne.get("ObjectId");
                if (Ext.isEmpty(neID))
                    neID = '0';
                var filterExp = {
                    expression: {
                        operator: {
                            operatorType: 'AND',
                            operand1: {
                                logicaOperator: {
                                    operatorType: 'AND',
                                    operand1: {
                                        conditionOperator: {
                                            operatorType: "EQ",
                                            identifier: {
                                                name: 'NEId'
                                            },
                                            literal: { value: neID, type: 'string' }
                                        }
                                    },
                                    operand2: {
                                        conditionOperator: {
                                            operatorType: "EQ",
                                            identifier: {
                                                name: 'ActionType'
                                            },
                                            literal: { value: 'Backup', type: 'string' }
                                        }

                                    }
                                }
                            },
                            operand2: {
                                conditionOperator: {
                                    operatorType: "EQ",
                                    identifier: {
                                        name: 'Status'
                                    },
                                    literal: { value: 'succeeded', type: 'string' }
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
                    },
                    limit: PropertyService.getPropertyFromCache(SessionProvider.getAppName(), 'max.files.backupFiles'),
                };

            }
        },

    },



    stores: {
        backup_files_store: {
            type: 'backupfiles4nestore',
            query_params: '{query_params}',
            listeners: {
                load: 'storeload'
            }
        },
    }
});