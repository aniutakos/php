Ext.define('ConfigurationFilesClient.view.JobsListNavigatorViewController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.Job-list-navigator-view-controller',

    // deleteJobs: function() {
    //     var me = this;
    //     ExtCore.ux.message.MessageBox.show('warning', 'Delete jobs', 'Are you sure you want to delete the selected jobs?',
    //         function(buttonId) {
    //             if (buttonId == 'yes') {
    //                 var grid = Ext.getCmp("jobs-grid");
    //                 var selection = grid.getSelection();
    //                 for (indx in selection) {
    //                     job = selection[indx].data;
    //                     me.deleteJob(job.name);
    //                 }
    //             } else if (buttonId == 'no') {
    //                 return;
    //             }

    //         }, {
    //             buttons: [{
    //                     text: "Yes",
    //                     action: "yes",
    //                     //default: false
    //                 },
    //                 {
    //                     text: "No",
    //                     action: "no",
    //                     //default: true
    //                 }
    //             ]
    //         }
    //     );



//    },
    refreshJobs: function(){
        var grid = Ext.getCmp("jobs-grid");
        grid.getStore().reload();
    },

    deleteJobs: function() {
        var me = this;
            ExtCore.ux.message.MessageBox.show('warning', 'Delete jobs', 'Are you sure you want to delete the selected jobs?',
                function(buttonId) {
                    if (buttonId == 'yes') {
                        var grid = Ext.getCmp("jobs-grid");
                        var selection = grid.getSelection();
                        var jobs =_.map(selection, function (job) {
                            return job.data.name;
                        });
                        me.deleteJobsAsync(jobs).then(
                            function() {
                                ExtCore.ux.message.MessageBox.alert('Success', 'Success', "Jobs deleted succesfully");
                                me.jobsAudit('CD_Delete_Scheduled_Job',selection);
                                me.refreshJobs();

                            },
                            function(err) {
                                var errMsg = '';
                                if (!Ext.isEmpty(err)) {
                                    errMsg = _.map(err, 'failureReason').join("<BR>");
                                }
                                ExtCore.ux.message.MessageBox.alert('error', 'Error', errMsg);
                            }
                        );
                    } else if (buttonId == 'no') {
                        return;
                    }
    
                }, {
                    buttons: [{
                            text: "Yes",
                            action: "yes",
                            //default: false
                        },
                        {
                            text: "No",
                            action: "no",
                            //default: true
                        }
                    ]
                }
            );
    },


    deleteJobsAsync: function(jobsArray){
        var deferred = Ext.create('Ext.Deferred');
        // this.buildConfigServiceURL('deleteFiles').then(function(URL) {
        //     var filesArr = _.map(fileIDs, function(fileID) {
        //         return { id: fileID };
        //     });
        InteropService.evaluateInterconnectPointMap('ConfigurationFilesClient', 'CFMGenericService').then(function(data) {
            var URL = SessionProvider.buildURL(data.WebServiceInterConnectingPointData[0].StaticData.FullURL.RelativeURL + "/" + 'deleteScheduledJobs');
            Ext.Ajax.request({
                url: URL,
                method: 'POST',
                jsonData: {
                    "jobsName": jobsArray
                },
                success: function(response) {
                    // try {
                    //     var resp = Ext.decode(response.responseText);
                    //     if (Ext.isEmpty(resp.failures.deleteFile))
                    //         deferred.resolve();
                    //     else
                    //         deferred.reject(resp.failures.deleteFile);
                    // } catch (err) {
                    //     JCoreLogger.debug("Failed to delete jobs");
                    // }
                    deferred.resolve();
                },
                failure: function() {
                    var msg = 'Failed to delete jobs';
                    //UNMARK IF NEEDED JCoreLogger.debug(msg);
                    JCoreLogger.error(msg);
                    deferred.reject();
                }
            });
        });
        return deferred.promise;
    },
    // deleteJob: function(jobName) {
    //     var grid = Ext.getCmp("jobs-grid");
    //     var recordToDelete = grid.getStore().findRecord('name', jobName, 0, false, true, true);
    //     if (recordToDelete) {
    //         grid.recordToDelete = recordToDelete;
    //     } else {
    //         return;
    //     }
    //     InteropService.evaluateInterconnectPointMap('ConfigurationFilesClient', 'CFMGenericService').then(function(data) {
    //         var URL = SessionProvider.buildURL(data.WebServiceInterConnectingPointData[0].StaticData.FullURL.RelativeURL + "/" + 'deleteScheduledJob');
    //         Ext.Ajax.request({
    //             url: URL,
    //             method: 'POST',
    //             jsonData: { "jobName": jobName },
    //             success: function(response) {
    //                 ExtCore.ux.message.MessageBox.alert('Success', 'Success', "Jobs deleted succesfully");

    //                 var grid = Ext.getCmp("jobs-grid");
    //                 var navigator = Ext.ComponentQuery.query('jobs-list-navigator-view')[0];
    //                 var navigatorConroller = navigator.getController();
    //                 var recordToDelete = grid.recordToDelete;
    //                 navigatorConroller.AddJobAudit('CD_Delete_Scheduled_Job', recordToDelete.data);
    //                 grid.getStore().remove(recordToDelete);
    //             },
    //             failure: function() {
    //                 ExtCore.ux.message.MessageBox.show('Error', 'Error', "Failed to delete jobs");
    //                 //JCoreLogger.error(msg);
    //             }
    //         });
    //     });
    // },
    convertFilter: function(expression) {
        var me = this;
        var queryBuilderExpression = new Object(),
            rules = [];
        if (expression.conditionOperator) {
            if (!me.opMapOpposite) me.opMapToOpposite();
            var id = "CONFIG|" + expression.conditionOperator.identifier.name;
            var rule = {
                "id": id,
                field: id,
                type: expression.conditionOperator.literal.type,
                input: "text",
                operator: me.opMapOpposite[expression.conditionOperator.operatorType],
                value: expression.conditionOperator.literal.value,
                data: {
                    label: expression.conditionOperator.identifier.name
                }
            };
            return rule;
        } else {
            if (expression.logicaOperator) {
                if (!expression.logicaOperator.operand2) {
                    var rule = me.convertFilter(expression.logicaOperator.operand1);
                    return {
                        'condition': expression.logicaOperator.operatorType,
                        'rules': [rule]
                    };
                } else {
                    var rule1 = me.convertFilter(expression.logicaOperator.operand1);
                    var rule2 = me.convertFilter(expression.logicaOperator.operand2);
                    return {
                        'condition': expression.logicaOperator.operatorType,
                        'rules': [rule1, rule2]
                    };
                }
            }
        }

    },

    opMapToOpposite: function() {
        var me = this;
        me.opMapOpposite = new Object();
        if (!me.opMap) me.prepareInit();
        var queryOps = Object.keys(me.opMap);

        _.forEach(queryOps, function(op) {
            me.opMapOpposite[me.opMap[op]] = op;
        })
    },

    prepareInit: function() {
        this.ml = $.fn.queryBuilder.regional[this.lang];
        this.opMap = {
            'or': 'OR',
            'and': 'AND',
            'is': 'EQ_IC',
            'is_not': 'NE_IC',
            //'equal': 'EQ_IC',
            //'not_equal': 'NE_IC',
            'greater': 'gt',
            'less': 'lt',
            'greater_or_equal': 'ge',
            'less_or_equal': 'le',
            'in': 'IN',
            'not_in': 'NOT_IN',
            'is_null': 'IS_NULL',
            'is_not_null': 'NOT_IS_NULL',
            //'is_not_null': 'IsNotNull',
            'between': 'BETWEEN',
            'not_between': 'NOT_BETWEEN',
            'contains': 'LIKE_IC',
            'not_contains': 'NOT_LIKE_IC',
            'begins_with': 'BEGIN_WITH_IC',
            'ends_with': 'END_WITH_IC',
            'not_begins_with': 'NOT_BEGIN_WITH_IC',
            'not_ends_with': 'NOT_END_WITH_IC',
            'is_empty': 'IS_EMPTY',
            'is_not_empty': 'IS_NOT_EMPTY'
        };
    },

    isCardExist: function(cardId) {
        var me = this;
        var view = me.getView();
        cards = view.getLayout().getLayoutItems();
        var cardExist = false;
        for (indx in cards) {
            var card = cards[indx];
            if (card.id == cardId) {
                cardExist = true;
                break;
            }
        }
        return cardExist;
    },
    jobsAudit: function(eventId, jobs){
        var me = this;
        for(indx in jobs){
            var job = jobs[indx].data;
            me.AddJobAudit(eventId,job);
        }
    },
    AddJobAudit: function(eventId, job) {
        var me = this;

        var neType = job.selectedNEs.neList ? 'Ne CIDs' : 'Criteria';
        var neVal = '';
        if (job.selectedNEs.neCriteria) {
            neVal = me.convertFilter({ "logicaOperator": job.selectedNEs.neCriteria.expression.operator });
            neVal = JSON.stringify(neVal);
        } else {
            neVal = job.selectedNEs.neList;
        }
        //neVal = job.selectedNEs.neList ? job.neList : job.selectedNEs.neCriteria;
        var additionalDetails = Ext.String.format('job Name : {0}, File Type : {1}, {2} : {3}', job.name, job.configFileType, neType, neVal);
        AuditService.auditServiceRequest(eventId, true, additionalDetails);
    }
});