Ext.define('ConfigurationFilesClient.view.CompareFilesWindow', {
    extend: 'ExtCore.ux.Dialog',
    xtype: 'compare-files-window',

    // requires: [
    //     'Ext.layout.container.VBox',
    //     'ExtCore.util.JCoreProxy'
    // ],
    //layout:'fit',
    //closeable: true,
    closeAction: 'destroy',
    layout: 'fit',

    modal: true,
    bind: {
        title: '{resources.ConfigurationFilesClient.CompareFileWindowView.Compare}'
    },
    closeable: true,
    clickOutside: true,
    draggable: true,
    liveDrag: true,
    resizable: true,
    maximizable: true,
    constrainHeader: true,
    // maximized: true,
    config: {
        constrain: true,
    },
    controller: 'compare-files-window-view-controller',
    viewModel: {
        type: 'compare-files-window-view-model'
    },
    header: true,

    dockedItems: [{
        xtype: 'toolbar',
        ui: 'compare-toolbar',
        cls: 'compare-toolbar',
        dock: 'top',
        defaults: {
            margin: '0 5 0 5'
        },
        items: [
            {
                xtype: 'displayfield',
                //fieldCls: 'backupJobTitleCls',
                //flex:0.5,
                bind: {
                    hidden: '{!isNoChanges}',
                    value: '<img style="border: 0; align:left ;" align="left" class="compare-icon"/>&nbsp IDENTICAL FILES'
                }
            },
            {
                xtype: 'displayfield',
                cls:'compareDataFields',
                //fieldCls: 'backupJobTitleCls',
                //flex:0.5,
                bind: {
                    hidden: '{isNoChanges}',
                    value: '<img style="border: 0; align:left; margin-top:-2px!important;" align="left" class="compare-changed-icon"/>&nbsp{resources.ConfigurationFilesClient.CompareFileWindowView.Updated}: {changedLinesNum}'
                }
            },
            {
                xtype: 'displayfield',
                cls:'compareDataFields',
                //fieldCls: 'backupJobTitleCls',
                //flex:0.5,
                bind: {
                    hidden: '{isNoChanges}',
                    value: '<img style="border: 0; align:left; margin-top:-2px!important;" align="left" class="compare-added-icon"/>&nbsp{resources.ConfigurationFilesClient.CompareFileWindowView.Added}: {addedLinesNum}'
                }
            },
            {
                xtype: 'displayfield',
                cls:'compareDataFields',
                //fieldCls: 'backupJobTitleCls',
                //flex:0.5,
                bind: {
                    hidden: '{isNoChanges}',
                    value: '<img style="border: 0; align:left; margin-top:-2px!important;" align="left" class="compare-deleted-icon"/>&nbsp{resources.ConfigurationFilesClient.CompareFileWindowView.Deleted}: {deletedLinesNum}'
                }
            },
            {
                xtype: 'draw',
                renderTo: document.body,

                cls: 'compare-toolbar-line',
                bind: {
                    hidden: '{isNoChanges}',
                },
                width: 8,
                height: 20,
                sprites: [
                    {
                        type: 'path',
                        path: 'M0,-5 L0,20',
                        stroke: '#4D4D4D',
                    }
                ]
            },
            {
                xtype: 'button',
                ui: 'compare-previous-next-button',
                cls: 'compare-previous-next-button',
                iconCls: 'compare-previous-icon',
                handler: 'focusPreviousChange',
                bind: {
                    hidden: '{isNoChanges}',
                    text: '{resources.ConfigurationFilesClient.CompareFileWindowView.Previous}'
                }
            },
            {
                xtype: 'button',
                ui: 'compare-previous-next-button',
                cls: 'compare-previous-next-button',
                iconCls: 'compare-next-icon',
                iconAlign: 'right',
                handler: 'focusNextChange',
                bind: {
                    hidden: '{isNoChanges}',
                    text: '{resources.ConfigurationFilesClient.CompareFileWindowView.Next}'
                }
            },
        ]
    }],

    listeners: {

        afterrender: function () {
            var me = this;

            // get temp files
            //me.getFile('resources/files/fileOne.txt',true,'fileOne');
            //me.getFile('resources/files/fileTwo.txt',false,'fileTwo');
            //me.getFile('resources/files/c_7200_pe_west-confg-RUNNING(ORIGINAL).txt',true,'c_7200_pe_west-confg-RUNNING(ORIGINAL)');
            //me.getFile('resources/files/c_7200_pe_west-confg-RUNNING(CHANGED).txt',false,'c_7200_pe_west-confg-RUNNING(CHANGED)');
            ///
            me.getController().compareFiles();
        },
    },

    initComponent: function () {
        var me = this;
        var vm = me.getViewModel();
        var originalFileName = vm.get('compareFile1').data.FileName;
        var changedFileName = vm.get('compareFile2').data.FileName;
        me.items = [{
            xtype: 'panel',
            layout: 'fit',
            scrollable: 'y',
            items: [{
                xtype: 'gridpanel',
                cls: 'compare-grid-cls',
                dataIndex: 'indx',
                stripeRows: true,
                rowLines: false,
                columnLines: true,
                autoScroll: true,
                forceFit: true,
                columns: [
                    {
                        header: originalFileName,
                        flex: 1,
                        cls: 'compare-header',
                        menuDisabled: true,
                        columns: [
                            {
                                text: "",
                                //height:0,  
                                fixed: true,
                                dataIndex: 'originalLineNumber',
                                flex: 0.2,
                                minWidth: 60,
                                menuDisabled: true,
                                getSortParam: Ext.emptyFn,
                                cls: 'RemoveLine',
                                renderer: function (value, meta, record) {
                                    meta.tdCls = 'grayCell compare-grid';
                                    var val = value;
                                    switch (record.data.status) {
                                        case '':
                                            break;
                                        case '?':
                                            val += '&nbsp<img style="border: 0 align:right;" align="right" class="compare-changed-icon"/>';
                                            break;
                                        case '+':
                                            val = '';
                                            break;
                                        case '-':
                                            val += '&nbsp<img style="border: 0 align:right;" align="right" class="compare-deleted-icon"/>';
                                            break;
                                    }
                                    return val;
                                }
                            },
                            {
                                dataIndex: 'originalText',
                                text: "",
                                fixed: true,
                                //height:0,                   
                                menuDisabled: true,
                                getSortParam: Ext.emptyFn,
                                flex: 2,
                                cls: 'RemoveLine',
                                renderer: function (value, meta, record) {
                                    switch (record.data.status) {
                                        case '':
                                            meta.tdCls += 'whiteCell compare-grid';
                                            break;
                                        case '?':
                                            meta.tdCls += 'yellowCell compare-grid';
                                            break;
                                        case '+':
                                            meta.tdCls += 'grayCell compare-grid';
                                            break;
                                        case '-':
                                            meta.tdCls += 'grayCell compare-grid';
                                            break;
                                    }
                                    return value;
                                }
                            }
                        ],


                    },
                    {
                        header: changedFileName,
                        cls: 'compare-header',
                        menuDisabled: true,
                        getSortParam: Ext.emptyFn,
                        flex: 1,
                        columns: [
                            {
                                dataIndex: 'changedLineNumber',
                                menuDisabled: true,
                                text: "",
                                fixed: true,
                                getSortParam: Ext.emptyFn,
                                //height:0,                  
                                flex: 0.2,
                                minWidth: 60,
                                cls: 'RemoveLine',
                                renderer: function (value, meta, record) {
                                    meta.tdCls = 'grayCell compare-grid';
                                    var val = value;
                                    switch (record.data.status) {
                                        case '':
                                            break;
                                        case '?':
                                            val += '&nbsp<img style="border: 0 align:right;" align="right" class="compare-changed-icon"/>';
                                            break;
                                        case '+':
                                            val += '&nbsp<img style="border: 0 align:right;" align="right" class="compare-added-icon"/>';
                                            break;
                                        case '-':
                                            val = '';
                                            break;
                                    }
                                    return val;
                                }
                            },
                            {
                                dataIndex: 'changedText',
                                text: "",
                                menuDisabled: true,
                                getSortParam: Ext.emptyFn,
                                flex: 2,
                                fixed: true,
                                //height:0,
                                cls: 'RemoveLine',
                                renderer: function (value, meta, record) {
                                    switch (record.data.status) {
                                        case '':
                                            meta.tdCls += 'whiteCell compare-grid';
                                            break;
                                        case '?':
                                            meta.tdCls += 'yellowCell compare-grid';
                                            break;
                                        case '+':
                                            meta.tdCls += 'greenCell compare-grid';
                                            break;
                                        case '-':
                                            meta.tdCls += 'redCell compare-grid';
                                            break;
                                    }
                                    return value;
                                }
                            }
                        ],


                    }]
            }
            ],

        }];
        //me.getController().compareFiles();
        me.callParent(arguments);
    },

    // items: 
    //  [



    //     html:
    //         '<table class:"diffTable" cellpadding="10" id ="diffTable" style="cell-padding:10px ;border-collapse: collapse;width: 100%;table-layout:fixed;">'+
    //         //'<thead>'+
    //         '<col width="3%" />'+
    //         '<col width="0.25%" />'+
    //         '<col width="46.5%" />'+
    //         '<col width="0.25%" />'+
    //         '<col width="3%" />'+
    //         '<col width="0.25%" />'+
    //         '<col width="46.5%" />'+
    //         '<col width="0.25%" />'+
    //         '<tr>'+
    //         '<th style="height: 10px;"></th>'+
    //         '<th style="height: 10px;"></th>'+
    //         '</tr>'+
    //         //'</thead>'+
    //         '<tbody>'+
    //         '</tbody>'+
    //         '</table>'
    // }
    // ],

    getFile: function (url, original, fileName) {
        var me = this;
        Ext.Ajax.request(
            {
                url: url,
                method: 'POST',
                async: false,
                jsonData: {
                    //"AppName": ExtCore.services.SessionManager.appName,
                    "MetadataCategory": "dotNetBundle",
                    "MetadataId": "StaticResources"
                },
                success: function (response) {
                    if (original) {
                        me.original = {
                            name: fileName,
                            data: response.responseText.split("\n")
                        };

                    }
                    else {
                        me.changed = {
                            name: fileName,
                            data: response.responseText.split("\n")
                        };

                    }

                }
            });
    }
});
