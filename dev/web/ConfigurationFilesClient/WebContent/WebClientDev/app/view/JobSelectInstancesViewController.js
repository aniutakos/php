Ext.define('ConfigurationFilesClient.view.JobSelectInstancesViewController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.job-select-instances-view-controller',

    setNesGridData:function(NeList,configurationFileValue){
        if (NeList != undefined && NeList != null && NeList != "" ) {
            var me = this;
            var view = me.getView();
            var neGrid = view.down('gridpanel[name=gridpanelSelectInstances]');
            neGrid.getStore().removeAll();
            if (NeList != '') {
                var filter = me.getFilterForNes(NeList,configurationFileValue);
                var neListRequest = {
                    "mdClass": "BCAPI:CFM.CFMNEScriptMapping",
                    "attributes": null, "projection": null,
                    "filter": filter ,
                    "criteria": null, "limit": null, "orderBy": null, "ignoreCache": null, "dateFormat": null
                };

                InteropService.evaluateInterconnectPointMap('ConfigurationFilesClient', 'BCAPIGenricService').then(function (data) {
                    var URL = SessionProvider.buildURL(data.WebServiceInterConnectingPointData[0].StaticData.FullURL.RelativeURL + "/" + 'getValues');
                    Ext.Ajax.request({
                        url: URL,
                        method: 'POST',
                        jsonData: neListRequest,
                        success: function (response) {
                            var data = Ext.decode(response.responseText);
                            var results = [];
                            var columns = null;
                            if (!Ext.isEmpty(data.result)) {
                                columns = data.result.columns;
                                Ext.Array.each(data.result.resultSet.row, function (obj) {
                                    var result = {};
                                    for (var column in columns) {
                                        result[columns[column].name] = obj.item[column] ? Ext.htmlEncode(obj.item[column].value) : null;
                                    }
                                    results.push(result);
                                });
                            }
                            else if (!Ext.isEmpty(data.columns)) {
                                columns = data.columns;
                                Ext.Array.each(data.resultSet.row, function (obj) {
                                    var result = {};
                                    for (var column in columns) {
                                        result[columns[column].name] = obj.item[column] ? Ext.htmlEncode(obj.item[column].value) : null;
                                    }
                                    results.push(result);
                                });
                            }
                           // var cardContainer = Ext.ComponentQuery.query('job-details-container-view')[0];
                            //var jobDefinition = cardContainer.getLayout().getActiveItem().down('job-definition-panel');
                            
                            var grid = view.down('gridpanel[name=gridpanelSelectInstances]');
                            grid.getStore().loadData(results, true);
                            if(results.length != NeList.split(',').length){
                                view.up('job-definition-panel').getViewModel().set('ExistDeletedNes',true);
                            }
                            else{
                                view.up('job-definition-panel').getViewModel().set('ExistDeletedNes',false);
                            }
                        },
                        failure: function () {
                            ExtCore.ux.message.MessageBox.show('Error','Error', "Failed to get job Nes");
                        }
                    });
                });
            }
        }

    },
    getFilterForNes: function(NeList,configurationFileValue){
        var queryFilter ={ 
            expression:{
                operator:{
                    operand1:{
                        logicaOperator:{
                            operand1:{
                                conditionOperator:{
                                    identifier:{
                                        name:"ConfFileTypeConfigId"
                                    },
                                    literal:{
                                        type:'string',
                                        value:configurationFileValue
                                    },
                                    operatorType:'EQ_IC'
                                }
                            },
                            operatorType:'AND'  
                        }                      
                    },
                    operand2:{ "conditionOperator": 
                    { "identifier": { "name": "ObjectId" }, "literal": { "value": NeList, "type": "string" }, "operatorType": "IN" }, "logicaOperator": null },
                    operatorType:'AND'
                }
            
            }
        };
        return queryFilter;
    }
});